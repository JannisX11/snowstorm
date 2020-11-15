import Data from './input_structure'
import vscode from './vscode_extension'

import Wintersky from './../../wintersky'

const Config = new Wintersky.Config();
const Emitter = new Wintersky.Emitter(Config);
window.Emitter = Emitter;


function initParticles(View) {	
	View.scene.add(Wintersky.space);
}

Wintersky.fetchTexture = function(config) {

	var path = config.particle_texture_path;

	if (vscode && path) {

		vscode.postMessage({
            type: 'request_texture',
            path
		});
		function update(event) {
			if (event.data.type == 'provide_texture') {
				let uri = (event.data.url && event.data.url + '?'+Math.floor(Math.random()*1000)) || VanillaTextures[path];
				//Data.particle.texture.inputs.image.image.data = uri || '';
				window.removeEventListener('message', update);
				return uri;
			}
		}
		window.addEventListener('message', update, false);

	} else if (Data.particle.texture.inputs.image.image && Data.particle.texture.inputs.image.image.loaded) {

		return Data.particle.texture.inputs.image.image.data;

	}
}

function updateMaterial() {
	Emitter.updateMaterial();
}

export {Emitter, Config, updateMaterial, initParticles}

