import Data from './input_structure'
import {compileJSON, IO} from './util'

import {Flipbook} from './emitter'

function getValue(subject, group, key, curve_key) {
	if (typeof subject === 'number') {
		switch (subject) {
			case 0: subject = 'effect'; break;
			case 1: subject = 'emitter'; break;
			case 2: subject = 'particle'; break;
		}
	}
	var input;
	if (group == 'curves') {
		input = Data.effect.curves.curves[key].inputs[curve_key]
	} else {
		input = Data[subject][group].inputs[key];
	}
	var original_value = input.value;

	function processValue(v) {
		if (input.type === 'molang') {
			if (!isNaN(v)) {
				v = parseFloat(v)
			}
			if (!v) v = 0;
		} else if (input.type === 'number') {
			v = parseFloat(v)||0;
		}
		return v;
	}
	if (input.axis_count > 1) {
		var value = [];
		for (var i = 0; i < input.axis_count; i++) {
			value[i] = processValue(original_value[i])
		}
		if (value.allEqual(0) && !input.required) value = undefined;
	} else {
		var value = processValue(original_value);
		if (!value && !input.required) value = undefined;
	}
	return value;
}


function generateFile() {
	var file = {
		format_version: '1.10.0',
		particle_effect: {
			description: {
				identifier: Data.effect.meta.inputs.identifier.value,
				basic_render_parameters: {
					material: getValue(2, 'appearance', 'material'),
					texture: getValue(2, 'texture', 'path') || 'textures/blocks/wool_colored_white'
				}
			}
		}
	}

	//Curves
	if (Data.effect.curves.curves.length) {
		var json_curves = {};
		Data.effect.curves.curves.forEach((curve, i) => {
			if (!curve.inputs.id.value) return;
			var json_curve = {
				type: getValue(0, 'curves', i, 'mode'),
				input: getValue(0, 'curves', i, 'input'),
				horizontal_range: getValue(0, 'curves', i, 'range'),
				nodes: curve.nodes.slice()
			}
			json_curves[curve.inputs.id.value] = json_curve
		})
		if (Object.keys(json_curves).length) {
			file.particle_effect.curves  = json_curves;
		}
	}

	var comps = file.particle_effect.components = {};

	//Emitter Components
	if (getValue(0, 'variables', 'creation_vars').length) {
		var s = getValue(0, 'variables', 'creation_vars').join(';')
		s = s.replace(/;;/g, ';')
		if (s) {
			comps['minecraft:emitter_initialization'] = {
				creation_expression: s+';',
			}
		}
	}
	if (getValue(0, 'variables', 'tick_vars').length) {
		var s = getValue(0, 'variables', 'tick_vars').join(';')
		s = s.replace(/;;/g, ';')
		if (s) {
			if (!comps['minecraft:emitter_initialization']) comps['minecraft:emitter_initialization'] = {};
			comps['minecraft:emitter_initialization'].per_update_expression = s+';'
		}
	}
	if (getValue(0, 'space', 'local_position')) {
		comps['minecraft:emitter_local_space'] = {
			position: getValue(0, 'space', 'local_position'),
			rotation: getValue(0, 'space', 'local_rotation'),
		}
	}
	//Rate
	var mode = getValue(1, 'rate', 'mode')
	if (mode === 'instant') {
		comps['minecraft:emitter_rate_instant'] = {
			num_particles: getValue(1, 'rate', 'amount'),
		}
	} else if (mode === 'steady') {
		comps['minecraft:emitter_rate_steady'] = {
			spawn_rate: getValue(1, 'rate', 'rate'),
			max_particles: getValue(1, 'rate', 'maximum'),
		}
	}
	//Lifetime
	var mode = getValue(1, 'lifetime', 'mode')
	if (mode) {
		if (mode === 'looping') {
			comps['minecraft:emitter_lifetime_looping'] = {
				active_time: getValue(1, 'lifetime', 'active_time'),
				sleep_time: getValue(1, 'lifetime', 'sleep_time'),
			}
		} else if (mode === 'once') {
			comps['minecraft:emitter_lifetime_once'] = {
				active_time: getValue(1, 'lifetime', 'active_time'),
			}
		} else if (mode === 'expression') {
			comps['minecraft:emitter_lifetime_expression'] = {
				activation_expression: getValue(1, 'lifetime', 'activation'),
				expiration_expression: getValue(1, 'lifetime', 'expiration'),
			}
		} else if (mode === 'events') {
			comps['minecraft:emitter_lifetime_events'] = {
				sleep_time: getValue(1, 'lifetime', 'sleep_time'),
				active_time: getValue(1, 'lifetime', 'active_time'),
			}
		}
	}
	//Direction
	var mode = getValue(2, 'direction', 'mode');
	var direction = undefined;
	if (mode) {
		if (mode === 'inwards') {
			direction = 'inwards'
		} else if (mode === 'outwards') {
			direction = 'outwards'
		} else if (mode === 'direction') {
			direction = getValue(2, 'direction', 'direction')
		}
	}
	//Shape
	var mode = getValue(1, 'shape', 'mode')
	if (mode) {
		if (mode === 'point') {
			if (typeof direction === 'string') {
				direction = undefined;
			}
			comps['minecraft:emitter_shape_point'] = {
				offset: getValue(1, 'shape', 'offset'),
				direction: direction
			}
		} else if (mode === 'sphere') {
			comps['minecraft:emitter_shape_sphere'] = {
				offset: getValue(1, 'shape', 'offset'),
				radius: getValue(1, 'shape', 'radius'),
				surface_only: getValue(1, 'shape', 'surface_only'),
				direction: direction
			}
		} else if (mode === 'box') {
			comps['minecraft:emitter_shape_box'] = {
				offset: getValue(1, 'shape', 'offset'),
				half_dimensions: getValue(1, 'shape', 'half_dimensions'),
				surface_only: getValue(1, 'shape', 'surface_only'),
				direction: direction
			}
		} else if (mode === 'disc') {
			let plane_normal = getValue(1, 'shape', 'plane_normal')
			if (plane_normal) {
				switch (plane_normal.join('')) {
					case '100': plane_normal = 'x'; break;
					case '010': plane_normal = 'y'; break;
					case '001': plane_normal = 'z'; break;
				}
			}
			comps['minecraft:emitter_shape_disc'] = {
				offset: getValue(1, 'shape', 'offset'),
				radius: getValue(1, 'shape', 'radius'),
				plane_normal,
				surface_only: getValue(1, 'shape', 'surface_only'),
				direction: direction
			}
		} else if (mode === 'custom') {
			if (typeof direction === 'string') {
				direction = undefined;
			}
			comps['minecraft:emitter_shape_custom'] = {
				offset: getValue(1, 'shape', 'offset'),
				direction: direction
			}
		} else if (mode === 'entity_aabb') {
			comps['minecraft:emitter_shape_entity_aabb'] = {
				surface_only: getValue(1, 'shape', 'surface_only'),
				direction: direction
			}
		}
	}



	//Particle Components

	//Lifetime
	var lifetime_comp = comps['minecraft:particle_lifetime_expression'] = {}
	if (getValue(2, 'lifetime', 'mode') === 'time') {
		lifetime_comp.max_lifetime = getValue(2, 'lifetime', 'max_lifetime')
	} else {
		lifetime_comp.expiration_expression = getValue(2, 'lifetime', 'expiration_expression')
	}
	if (getValue(2, 'lifetime', 'expire_in').length) {
		comps['minecraft:particle_expire_if_in_blocks'] = getValue(2, 'lifetime', 'expire_in')
	}
	if (getValue(2, 'lifetime', 'expire_outside').length) {
		comps['minecraft:particle_expire_if_not_in_blocks'] = getValue(2, 'lifetime', 'expire_outside')
	}

	//Spin
	var init_rot = getValue(2, 'rotation', 'initial_rotation')
	var init_rot_rate = getValue(2, 'rotation', 'rotation_rate')
	if (init_rot || init_rot_rate) {
		comps['minecraft:particle_initial_spin'] = {
			rotation: init_rot||undefined,
			rotation_rate: init_rot_rate||undefined
		}
	}
	comps['minecraft:particle_initial_speed'] = getValue(2, 'motion', 'linear_speed');
	/*
	mode = getValue(2, 'init', 'mode')
	if (mode === 'linear') {
		comps['minecraft:particle_initial_speed'] = getValue(2, 'init', 'linear_speed')||0;
	} else {
		comps['minecraft:particle_initial_speed'] = getValue(2, 'init', 'direction_speed');
	}*/

	//Motion
	var mode = getValue(2, 'motion', 'mode')
	if (mode) {
		if (mode === 'dynamic') {
			comps['minecraft:particle_motion_dynamic'] = {
				linear_acceleration: getValue(2, 'motion', 'linear_acceleration'),
				linear_drag_coefficient: getValue(2, 'motion', 'linear_drag_coefficient'),
				rotation_acceleration: getValue(2, 'rotation', 'rotation_acceleration'),
				rotation_drag_coefficient: getValue(2, 'rotation', 'rotation_drag_coefficient'),
			}
		} else if (mode === 'parametric') {
			comps['minecraft:particle_motion_parametric'] = {
				relative_position: getValue(2, 'motion', 'relative_position'),
				direction: getValue(2, 'motion', 'direction'),
				rotation: getValue(2, 'rotation', 'rotation'),
			}
		}
	}

	//Kill Plane
	comps['minecraft:particle_kill_plane'] = getValue(2, 'lifetime', 'kill_plane');
	
	//Texture
	var tex_comp = comps['minecraft:particle_appearance_billboard'] = {
		size: getValue(2, 'appearance', 'size'),
		facing_camera_mode: getValue(2, 'appearance', 'facing_camera_mode'),
		uv: {
			texture_width: Flipbook.width,
			texture_height: Flipbook.height,
		}
	}
	if (getValue(2, 'texture', 'mode') === 'static') {
		tex_comp.uv.uv = getValue(2, 'texture', 'uv')||[0, 0];
		tex_comp.uv.uv_size = getValue(2, 'texture', 'uv_size')||[1, 1];
	} else {
		var fb = tex_comp.uv.flipbook = {
			base_UV: getValue(2, 'texture', 'uv'),
			size_UV: getValue(2, 'texture', 'uv_size'),
			step_UV: getValue(2, 'texture', 'uv_step'),
			frames_per_second: getValue(2, 'texture', 'frames_per_second'),
			max_frame: getValue(2, 'texture', 'max_frame'),
			stretch_to_lifetime: getValue(2, 'texture', 'stretch_to_lifetime'),
			loop: getValue(2, 'texture', 'loop'),
		}
	}
	//Collision
	if (getValue(2, 'collision', 'enabled')) {
		comps['minecraft:particle_motion_collision'] = {
			collision_drag: getValue(2, 'collision', 'collision_drag'),
			coefficient_of_restitution: getValue(2, 'collision', 'coefficient_of_restitution'),
			collision_radius: getValue(2, 'collision', 'collision_radius'),
			expire_on_contact: getValue(2, 'collision', 'expire_on_contact'),
		}
	}
	if (getValue(2, 'color', 'light')) {
		comps['minecraft:particle_appearance_lighting'] = {}
	}
	if (getValue(2, 'color', 'mode') === 'static') {
		var static_color = Data.particle.color.inputs.picker.calculate()
		if (!static_color.equals({r: 1, g: 1, b: 1})) {
			comps['minecraft:particle_appearance_tinting'] = {
				color: [
					static_color.r,
					static_color.g,
					static_color.b,
					static_color.a,
				]
			}
		}
	} else if (getValue(2, 'color', 'mode') === 'gradient') {

		let range = getValue(2, 'color', 'range')
		comps['minecraft:particle_appearance_tinting'] = {
			color: {
				interpolant: getValue(2, 'color', 'interpolant'),
				gradient: Data.particle.color.inputs.gradient.export(range)
			}
		}

	} else {
		var color = getValue(2, 'color', 'expression')
		if (color instanceof Array) {
			color.forEach((s, i) => {
				if (typeof s === 'string' && !s.toLowerCase().match(/^math\.clamp/)) {
					color[i] = `Math.clamp(${s}, 0, 1)`
				}
			})
			comps['minecraft:particle_appearance_tinting'] = {
				color: color
			}
		}
	}

	return file;
}
function getName() {
	var name = Data.effect.meta.inputs.identifier.value
	if (name) {
		name = name.replace(/^\w+:/, '');
	} else {
		name = 'particles';
	}
	return name;
}
function downloadFile() {
	var content = compileJSON(generateFile())
	IO.export({
		name: getName()+'.particle.json',
		content: content
	})
}


export {generateFile, downloadFile}