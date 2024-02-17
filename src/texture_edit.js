import { IO } from "./util";
import vscode from "./vscode_extension";

let line_start = null;

function textureHexToArray(hex) {
    return [
        parseInt(hex.substring(1, 3), 16),
        parseInt(hex.substring(3, 5), 16),
        parseInt(hex.substring(5, 7), 16),
        parseInt(hex.substring(7, 9), 16),
    ]
}

function getIdentifier() {
    return String.fromCharCode(65 + Math.random() * 26) + String.fromCharCode(65 + Math.random() * 26);
}

class TextureClass {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = 16;
        this.ctx = this.canvas.getContext('2d');

        this.source = '';
        this.history = [];
        this.history_index = 0;
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
        line_start = null;
    }
    reload() {
        this.internal_changes = false;
        this.update();
        this.updateCanvasFromSource();
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
        this.beforeEdit();
        let last_coords = {};
        if (e1.shiftKey && line_start) {
            last_coords = {x: line_start[0], y: line_start[1]};
        }
        let color;
        if (context.color) {
            color = textureHexToArray(context.color);
        }

        let paint = (x, y, context) => {
            let r = 0;
            if (context.tool == 'brush') {
                let data = this.ctx.getImageData(
                    x - Math.round(r),
                    y - Math.round(r),
                    1+r,
                    1+r,
                );
                for (let i = 0; i < data.data.length; i += 4) {
                    data.data[i+0] = color[0];
                    data.data[i+1] = color[1];
                    data.data[i+2] = color[2];
                    data.data[i+3] = color[3];
                }
                this.ctx.putImageData(data, 
                    x - Math.round(r),
                    y - Math.round(r),
                )
            } else {
                this.ctx.clearRect(
                    x - Math.round(r),
                    y - Math.round(r),
                    1+r,
                    1+r,
                );
            }
        }
        let onMove = (e2) => {
            let coords = context.position;
            if (last_coords.x == coords.x && last_coords.y == coords.y) return;

            let diff_x = last_coords.x - coords.x;
            let diff_y = last_coords.y - coords.y;
            let length = Math.sqrt(Math.pow(diff_x, 2) + Math.pow(diff_y, 2));
            if (length > 1.5 && last_coords.x != undefined) {
                let interval = 1;
                if (Math.abs(diff_x) > Math.abs(diff_y)) {
                    interval = Math.sqrt(Math.pow(diff_y/diff_x, 2) + 1)
                } else {
                    interval = Math.sqrt(Math.pow(diff_x/diff_y, 2) + 1)
                }
                for (let i = 0; i <= length; i += interval) {
                    let x = length ? Math.round(last_coords.x - diff_x / length * i) : coords.x;
                    let y = length ? Math.round(last_coords.y - diff_y / length * i) : coords.y;
                    paint(x, y, context);
                }
            } else {
                paint(coords.x, coords.y, context);
            }

            this.canvasToDataURL();
            this.internal_changes = true;
            this.update();

            last_coords.x = coords.x;
            last_coords.y = coords.y;
            line_start = [coords.x, coords.y];
        }
        let onEnd = (e2) => {
            this.afterEdit();
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        onMove(e1);
    }
    useFillTool(event, context) {
        this.beforeEdit();

        let data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let fill_color = textureHexToArray(context.color);

        let matrix = {
            [context.position.x]: {[context.position.y]: true}
        };
        let getColor = (x, y) => {
            let offset = (y * this.canvas.width + x) * 4;
            return [data.data[offset], data.data[offset+1], data.data[offset+2], data.data[offset+3]];
        }
        let target_color = getColor(context.position.x, context.position.y);
        let expandTo = (x, y) => {
            if (matrix[x] && matrix[x][y] != undefined) return;
            if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) return;
            let color = getColor(x, y);
            let match = target_color.equals(color);
            if (!matrix[x]) matrix[x] = {};
            matrix[x][y] = match;
            if (match) {
                expandFrom(x, y);
            }
        }
        let expandFrom = (x, y) => {
            expandTo(x+1, y+0);
            expandTo(x-1, y+0);
            expandTo(x+0, y+1);
            expandTo(x+0, y-1);
        }
        expandFrom(context.position.x, context.position.y);

        for (let x in matrix) {
            for (let y in matrix[x]) {
                let value = matrix[x][y];
                if (value) {
                    let i = 0;
                    for (let fill_color_channel of fill_color) {
                        data.data[(y * this.canvas.width + 1 * x) * 4 + i] = fill_color_channel;
                        i++;
                    }
                }
            }
        }
        this.ctx.putImageData(data, 0, 0);

        this.afterEdit();
    }
    beforeEdit() {
        let undo_entry = {
            id: getIdentifier(),
            data_before: this.source
        };
        this.current_undo_entry = undo_entry;
    }
    afterEdit(label) {
        let entry = this.current_undo_entry
        entry.label = label;
        entry.data_after = this.source;

		if (this.history.length > this.history_index) {
            console.log('set', this.history.length, 'to', this.history_index)
			this.history.length = this.history_index;
		}
        this.history.push(entry);
        this.history_index = this.history.length;

        console.log('finish', entry.id, entry);

        delete this.current_undo_entry;
    }
    cancelEdit() {
        this.source = this.current_undo_entry.data_before;
        this.updateCanvasFromSource();
        delete this.current_undo_entry;
    }
    undo() {
        let after = this.history[this.history_index-1];
        let before = this.history[this.history_index-2];
        if (!before) return;
        this.history_index = Math.max(0, this.history_index-1);
        
        this.source = before ? before.data_after : after.data_before;
        if (this.source) {
            this.internal_changes = true;
            this.updateCanvasFromSource();
        } else {
            this.internal_changes = false;
            this.update();
        }
    }
    redo() {
        if (this.history_index >= this.history.length) return;
        let change = this.history[this.history_index];
        this.history_index += 1;

        console.log('redoing', change.id);
        
        this.source = change.data_after;
        if (this.source) {
            this.internal_changes = true;
            this.updateCanvasFromSource();
        } else {
            this.internal_changes = false;
            this.update();
        }
    }
}


export const Texture = new TextureClass();
