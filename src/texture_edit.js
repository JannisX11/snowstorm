class TextureClass {
    constructor() {
        this.canvas = document.createElement('canvas');

        this.source = '';
        this.internal_changes = false;
    }
    linkEmitter(emitter, config) {
        this.texture = config.texture;
        this.img = this.texture.image;
        this.config = config;
    }
    canvasToDataURL() {
        this.sourec = this.canvas.toDataURL();
    }
    update() {
        this.config.updateTexture();
    }
    reset() {
        this.source = '';
        this.internal_changes = false;
    }

}

export const Texture = new TextureClass();
