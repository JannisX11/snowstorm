import { IO } from "./util";
import vscode from "./vscode_extension";

class TextureClass {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.source = '';
        this.internal_changes = false;
    }
    linkEmitter(emitter, config) {
        this.texture = config.texture;
        this.img = this.texture.image;
        this.config = config;
    }
    canvasToDataURL() {
        this.source = this.canvas.toDataURL();
    }
    async updateCanvasFromSource() {
        let img = new Image();
        img.src = this.source;
        await new Promise((resolve, reject) => {
            img.onload = () => {
                this.canvas.width = img.naturalWidth;
                this.canvas.height = img.naturalHeight;
                this.ctx.drawImage(img, 0, 0);
                resolve();
            };
            img.onerror = reject;
        })
    }
    update() {
        this.config.updateTexture();
    }
    reset() {
        this.source = '';
        this.internal_changes = false;
    }
    createEmpty(width = 16, height = 16) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasToDataURL();
        this.internal_changes = true;
        this.update();
    }
    save() {
        if (!this.source) return;
        if (vscode) {
            let content = this.source;
            vscode.postMessage({
                type: 'save_texture',
                path: this.config.particle_texture_path,
                content,
            });
        } else {
            IO.export({
                name: this.name || 'Texture',
                extensions: ['png'],
                savetype: 'image',
                content: this.source
            })
        }
        this.markAsSaved();
    }
    markAsSaved() {
        this.internal_changes = false;
    }
    pickColor(event, context) {
        let coords = context.position;
        let {data} = this.ctx.getImageData(coords.x, coords.y, 1, 1);
        let string = '#';
        data.forEach(value => {
            let s = value.toString(16);
            if (s.length == 1) s = '0'+s;
            string = string + s;
        });
        return string;
    }
    usePaintTool(e1, context) {
        let last_coords = {};
        let onMove = (e2) => {
            let coords = context.position;
            if (last_coords.x == coords.x && last_coords.y == coords.y) return;

            let r = 0;
            if (context.tool == 'brush') {
                this.ctx.fillStyle = context.color;
                this.ctx.fillRect(
                    coords.x - Math.round(r),
                    coords.y - Math.round(r),
                    1+r,
                    1+r,
                );
            } else {
                this.ctx.clearRect(
                    coords.x - Math.round(r),
                    coords.y - Math.round(r),
                    1+r,
                    1+r,
                );
            }

            this.canvasToDataURL();
            this.internal_changes = true;
            this.update();

            last_coords.x = coords.x;
            last_coords.y = coords.y;
        }
        let onEnd = (e2) => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        onMove(e1);
    }
    useFillTool(event, context) {
        
    }

}


export const Texture = new TextureClass();
