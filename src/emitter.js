import vscode from './vscode_extension'
import Wintersky from 'wintersky'

const Scene = new Wintersky.Scene({
	fetchTexture(config) {
		if (!window.Data) return;
		var path = config.particle_texture_path;
	
		if (vscode && path) {
	
			vscode.postMessage({
				type: 'request_texture',
				path
			});
			return new Promise((resolve, reject) => {
				function update(event) {
					if (event.data.type == 'provide_texture') {
						let uri = (event.data.url && event.data.url + '?'+Math.floor(Math.random()*1000));
						window.removeEventListener('message', update);
						resolve(uri);
					}
				}
				window.addEventListener('message', update, false);
			})
	
		} else if (window.Data.particle.texture.inputs.image.image && window.Data.particle.texture.inputs.image.image.loaded) {
	
			return window.Data.particle.texture.inputs.image.image.data;
	
		}
	}
});
const Config = new Wintersky.Config(Scene);
const Emitter = new Wintersky.Emitter(Scene, Config, {
	loop_mode: 'looping',
	parent_mode: 'world'
});
window.Emitter = Emitter;

Config.reset()

function initParticles(View) {	
	View.scene.add(Scene.space);
}
Config.onTextureUpdate = function() {
	if (!window.Data) return;
	window.Data.particle.texture.inputs.image.image.hidden = true;
	window.Data.particle.texture.inputs.image.image.hidden = false;
};

function updateMaterial() {
	Emitter.updateMaterial();
}

export {Emitter, Config, updateMaterial, initParticles, Scene}

