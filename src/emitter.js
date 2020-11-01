import * as THREE from 'three'

import Data, {forEachInput} from './input_structure'

import vscode from './vscode_extension'

import Wintersky from './../../wintersky'

console.log('config')

const Config = new Wintersky.Config();
const Emitter = new Wintersky.Emitter(Config);
window.Emitter = Emitter;


function initParticles(View) {	
	View.scene.add(Wintersky.space);
}

Wintersky.fetchTexture = function(config) {
	var url;
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

		url = Data.particle.texture.inputs.image.image.data;
		loadTexture(url, cb)

	} else {
		url = VanillaTextures[path];
		Data.particle.texture.inputs.image.image.data = url || '';
		Data.particle.texture.inputs.image.image.loaded = false;
		return url;
		//loadTexture(url || DefaultTex.missing, cb)
	}
}

function updateMaterial() {

}

/*
function updateMaterial(cb) {
	var url;
	var path = Data.particle.texture.inputs.path.value;

	if (vscode && path) {

		vscode.postMessage({
            type: 'request_texture',
            path
		});
		function update(event) {
			if (event.data.type == 'provide_texture') {
				let uri = (event.data.url && event.data.url + '?'+Math.floor(Math.random()*1000)) || VanillaTextures[path];
				loadTexture(uri || DefaultTex.missing, cb);
				Data.particle.texture.inputs.image.image.data = uri || '';
				window.removeEventListener('message', update);
			}
		}
		window.addEventListener('message', update, false);

	} else if (Data.particle.texture.inputs.image.image && Data.particle.texture.inputs.image.image.loaded) {

		url = Data.particle.texture.inputs.image.image.data;
		loadTexture(url, cb)

	} else {
		url = VanillaTextures[path];
		Data.particle.texture.inputs.image.image.data = url || '';
		Data.particle.texture.inputs.image.image.loaded = false;
		loadTexture(url || DefaultTex.missing, cb)
	}
}*/

function loadTexture(url, cb) {
	var tex = new THREE.TextureLoader().load(url, function(a, b) {
		function factorize(input, axis, factor) {
			if (!input.value || !input.value[axis]) return;
			var arr = input.value.slice()
			var val = arr[axis]
			if (isNaN(val)) {
				arr[axis] = `${factor} * (${val})`
			} else {
				arr[axis] = Math.round(factor * parseFloat(val) * 10000) / 10000;
			}
			input.value = arr;
		}

		tex.magFilter = THREE.NearestFilter
		tex.minFilter = THREE.NearestFilter
		System.material.map = tex
		var x_factor = System.material.map.image.naturalWidth / Flipbook.width;
		var y_factor = System.material.map.image.naturalHeight / Flipbook.height;
		if (x_factor && x_factor != 1) {
			factorize(Data.particle.texture.inputs.uv, 0, x_factor)
			factorize(Data.particle.texture.inputs.uv_size, 0, x_factor)
			factorize(Data.particle.texture.inputs.uv_step, 0, x_factor)
		}
		if (y_factor && y_factor != 1) {
			factorize(Data.particle.texture.inputs.uv, 1, y_factor)
			factorize(Data.particle.texture.inputs.uv_size, 1, y_factor)
			factorize(Data.particle.texture.inputs.uv_step, 1, y_factor)
		}
		Flipbook.width = System.material.map.image.naturalWidth;
		Flipbook.height = System.material.map.image.naturalHeight;
		if (typeof cb === 'function') {
			cb()
		}
	})
}


export {Emitter, Config, updateMaterial, initParticles}

