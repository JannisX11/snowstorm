import { Texture } from './texture_edit';
import vscode from './vscode_extension'
import Wintersky from 'wintersky'
import {View} from './components/Preview'
import { EventSubEffects } from './event_sub_effects';
import { bbuid } from './util';

const Scene = new Wintersky.Scene({
	fetchTexture(config) {
		let is_main_effect = config == Config;
		if (!is_main_effect && EventSubEffects[config.identifier] && EventSubEffects[config.identifier].texture) {
			return EventSubEffects[config.identifier].texture;
		}
		if (is_main_effect && Texture.internal_changes) {
			return Texture.source;
		}
		if (!window.Data) return;
		var path = config.particle_texture_path;
	
		if (vscode && path) {
			
			let request_id = bbuid(4);
			vscode.postMessage({
				type: 'request_texture',
				request_id,
				path
			});
			return new Promise((resolve, reject) => {
				function update(event) {
					if (event.data.type == 'provide_texture' && event.data.request_id == request_id) {
						let uri = (event.data.url && event.data.url + '?'+Math.floor(Math.random()*1000));
						window.removeEventListener('message', update);

						resolve(uri);
					}
				}
				window.addEventListener('message', update, false);
			})

		} else if (is_main_effect && window.Data.texture.texture.inputs.image.image && window.Data.texture.texture.inputs.image.image.loaded) {
	
			return window.Data.texture.texture.inputs.image.image.data;
	
		}
	},
	fetchParticleFile(identifier) {
		if (!identifier) return;
		if (vscode) {
	
			let request_id = bbuid(4);
			vscode.postMessage({
				type: 'request_particle_file',
				request_id,
				identifier
			});
			return new Promise((resolve, reject) => {
				function update(event) {
					if (event.data.type == 'provide_particle_file' && event.data.request_id == request_id) {
						window.removeEventListener('message', update);
						let json = event.data.content ? JSON.parse(event.data.content) : null;
						EventSubEffects[identifier] = {json}
						resolve(json);
					}
				}
				window.addEventListener('message', update, false);
			})
	
		} else {
			return EventSubEffects[identifier]?.json || null;
		}
	}
});
const Config = new Wintersky.Config(Scene);
const Emitter = new Wintersky.Emitter(Scene, Config, {
	loop_mode: 'auto',
	parent_mode: 'world'
});
const QuickSetup = {
	resetAll() {
		// stub in case the tab was never opened
	}
};
window.Emitter = Emitter;
Texture.linkEmitter(Emitter, Config);
Config.unsupported_fields = {};

Config.reset()

function initParticles(View) {	
	View.scene.add(Scene.space);
}
Config.onTextureUpdate = function() {
	if (!window.Data) return;

	if (!Texture.internal_changes) {
		if (Config.texture_source_category == 'placeholder') {
			Texture.source = '';
		} else {
			Texture.source = Config.texture.image.src;
		}
		Texture.updateCanvasFromSource();
	}
	
	window.Data.texture.texture.inputs.image.image.hidden = true;
	window.Data.texture.texture.inputs.image.image.hidden = false;
};

Emitter.Molang.global_variables = {
	/*'query.camera_rotation'(axis) {
		let val = cameraTargetToRotation(View.camera.position.toArray(), View.controls.target.toArray())[axis ? 0 : 1];
		if (axis == 0) val *= -1;
		return val;
	},
	'query.rotation_to_camera'(axis) {
		let val = cameraTargetToRotation([0, 0, 0], View.camera.position.toArray())[axis ? 0 : 1] ;
		if (axis == 0) val *= -1;
		return val;
	},*/
	get 'query.distance_from_camera'() {
		return View.camera.position.length();
	},
	'query.lod_index'(indices) {
		indices.sort((a, b) => a - b);
		let distance = View.camera.position.length();
		let index = indices.length;
		indices.forEachReverse((val, i) => {
			if (distance < val) index = i;
		})
		return index;
	},
	'query.camera_distance_range_lerp'(a, b) {
		let distance = View.camera.position.length();
		return Math.clamp(Math.getLerp(a, b, distance), 0, 1);
	}
}

let original_variable_handler = Emitter.Molang.variableHandler;
Emitter.Molang.variableHandler = (key, params) => {
	let computed_value = original_variable_handler(key, params);
	if (computed_value != undefined) return computed_value;
	return View.placeholder_variables[key];

}

export {Emitter, Config, initParticles, Scene, QuickSetup}

