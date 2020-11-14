import Data from './input_structure'
import {compileJSON, IO} from './util'

import {Config} from './emitter'

function processValue(v, type) {
	if (type.type === 'molang') {
		if (!isNaN(v)) {
			v = parseFloat(v)
		}
		if (!v) v = 0;
	} else if (type.type === 'number' && typeof v !== type.type) {
		v = parseFloat(v)||0;
	}
	return v;
}
function getValue(key, required) {

	let value = Config[key];
	let type = Config.constructor.types[key];

	if (type.array) {
		var result = [];
		for (var num of value) {
			result.push(processValue(num, type));
		}
		if (!result.find(v => v) && !required) result = undefined;
	} else {
		var result = processValue(value, type);
		if (!result && !required) result = undefined;
	}
	return result;
}


function generateFile() {
	var file = {
		format_version: '1.10.0',
		particle_effect: {
			description: {
				identifier: Config.identifier,
				basic_render_parameters: {
					material: getValue('particle_appearance_material', true),
					texture: getValue('particle_texture_path') || 'textures/blocks/wool_colored_white'
				}
			}
		}
	}

	//Curves
	var json_curves = {};
	for (var key in Config.curves) {
		let curve = Config.curves[key];
		var json_curve = {
			type: processValue(curve.mode, {type: 'string'}),
			input: processValue(curve.input, {type: 'molang'}),
			horizontal_range: processValue(curve.range, {type: 'molang'}),
			nodes: curve.nodes.slice()
		}
		json_curves[key] = json_curve
	}
	if (Object.keys(json_curves).length) {
		file.particle_effect.curves  = json_curves;
	}

	/*
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
	*/

	var comps = file.particle_effect.components = {};

	//Emitter Components
	if (getValue('variables_creation_vars')) {
		var s = getValue('variables_creation_vars').join(';')
		s = s.replace(/;;/g, ';')
		if (s) {
			comps['minecraft:emitter_initialization'] = {
				creation_expression: s+';',
			}
		}
	}
	if (getValue('variables_tick_vars')) {
		var s = getValue('variables_tick_vars').join(';')
		s = s.replace(/;;/g, ';')
		if (s) {
			if (!comps['minecraft:emitter_initialization']) comps['minecraft:emitter_initialization'] = {};
			comps['minecraft:emitter_initialization'].per_update_expression = s+';'
		}
	}
	if (getValue('space_local_position', 'boolean')) {
		comps['minecraft:emitter_local_space'] = {
			position: getValue('space_local_position', 'boolean'),
			rotation: getValue('space_local_rotation', 'boolean'),
		}
	}
	//Rate
	var mode = getValue('emitter_rate_mode')
	if (mode === 'instant') {
		comps['minecraft:emitter_rate_instant'] = {
			num_particles: getValue('emitter_rate_amount'),
		}
	} else if (mode === 'steady') {
		comps['minecraft:emitter_rate_steady'] = {
			spawn_rate: getValue('emitter_rate_rate'),
			max_particles: getValue('emitter_rate_maximum'),
		}
	}
	//Lifetime
	var mode = getValue('emitter_lifetime_mode')
	if (mode) {
		if (mode === 'looping') {
			comps['minecraft:emitter_lifetime_looping'] = {
				active_time: getValue('emitter_lifetime_active_time'),
				sleep_time: getValue('emitter_lifetime_sleep_time'),
			}
		} else if (mode === 'once') {
			comps['minecraft:emitter_lifetime_once'] = {
				active_time: getValue('emitter_lifetime_active_time'),
			}
		} else if (mode === 'expression') {
			comps['minecraft:emitter_lifetime_expression'] = {
				activation_expression: getValue('emitter_lifetime_activation'),
				expiration_expression: getValue('emitter_lifetime_expiration'),
			}
		} else if (mode === 'events') {
			comps['minecraft:emitter_lifetime_events'] = {
				sleep_time: getValue('emitter_lifetime_sleep_time'),
				active_time: getValue('emitter_lifetime_active_time'),
			}
		}
	}
	//Direction
	var mode = getValue('particle_direction_mode');
	var direction = undefined;
	if (mode) {
		if (mode === 'inwards') {
			direction = 'inwards'
		} else if (mode === 'outwards') {
			direction = 'outwards'
		} else if (mode === 'direction') {
			direction = getValue('particle_direction_direction')
		}
	}
	//Shape
	var mode = getValue('emitter_shape_mode')
	if (mode) {
		if (mode === 'point') {
			if (typeof direction === 'string') {
				direction = undefined;
			}
			comps['minecraft:emitter_shape_point'] = {
				offset: getValue('emitter_shape_offset'),
				direction: direction
			}
		} else if (mode === 'sphere') {
			comps['minecraft:emitter_shape_sphere'] = {
				offset: getValue('emitter_shape_offset'),
				radius: getValue('emitter_shape_radius'),
				surface_only: getValue('emitter_shape_surface_only'),
				direction: direction
			}
		} else if (mode === 'box') {
			comps['minecraft:emitter_shape_box'] = {
				offset: getValue('emitter_shape_offset'),
				half_dimensions: getValue('emitter_shape_half_dimensions'),
				surface_only: getValue('emitter_shape_surface_only'),
				direction: direction
			}
		} else if (mode === 'disc') {
			let plane_normal = getValue('emitter_shape_plane_normal')
			if (plane_normal) {
				switch (plane_normal.join('')) {
					case '100': plane_normal = 'x'; break;
					case '010': plane_normal = 'y'; break;
					case '001': plane_normal = 'z'; break;
				}
			}
			comps['minecraft:emitter_shape_disc'] = {
				offset: getValue('emitter_shape_offset'),
				radius: getValue('emitter_shape_radius'),
				plane_normal,
				surface_only: getValue('emitter_shape_surface_only'),
				direction: direction
			}
		} else if (mode === 'custom') {
			if (typeof direction === 'string') {
				direction = undefined;
			}
			comps['minecraft:emitter_shape_custom'] = {
				offset: getValue('emitter_shape_offset'),
				direction: direction
			}
		} else if (mode === 'entity_aabb') {
			comps['minecraft:emitter_shape_entity_aabb'] = {
				surface_only: getValue('emitter_shape_surface_only'),
				direction: direction
			}
		}
	}



	//Particle Components

	//Lifetime
	var lifetime_comp = comps['minecraft:particle_lifetime_expression'] = {}
	if (getValue('particle_lifetime_mode') === 'time') {
		lifetime_comp.max_lifetime = getValue('particle_lifetime_max_lifetime')
	} else {
		lifetime_comp.expiration_expression = getValue('particle_lifetime_expiration_expression')
	}
	if (getValue('particle_lifetime_expire_in')) {
		comps['minecraft:particle_expire_if_in_blocks'] = getValue('particle_lifetime_expire_in')
	}
	if (getValue('particle_lifetime_expire_outside')) {
		comps['minecraft:particle_expire_if_not_in_blocks'] = getValue('particle_lifetime_expire_outside')
	}

	//Spin
	var init_rot = getValue('particle_rotation_initial_rotation')
	var init_rot_rate = getValue('particle_rotation_rotation_rate')
	if (init_rot || init_rot_rate) {
		comps['minecraft:particle_initial_spin'] = {
			rotation: init_rot||undefined,
			rotation_rate: init_rot_rate||undefined
		}
	}
	comps['minecraft:particle_initial_speed'] = getValue('particle_motion_linear_speed');
	/*
	mode = getValue('particle_init_mode')
	if (mode === 'linear') {
		comps['minecraft:particle_initial_speed'] = getValue('particle_init_linear_speed')||0;
	} else {
		comps['minecraft:particle_initial_speed'] = getValue('particle_init_direction_speed');
	}*/

	//Motion
	var mode = getValue('particle_motion_mode')
	if (mode) {
		if (mode === 'dynamic') {
			comps['minecraft:particle_motion_dynamic'] = {
				linear_acceleration: getValue('particle_motion_linear_acceleration'),
				linear_drag_coefficient: getValue('particle_motion_linear_drag_coefficient'),
				rotation_acceleration: getValue('particle_rotation_rotation_acceleration'),
				rotation_drag_coefficient: getValue('particle_rotation_rotation_drag_coefficient'),
			}
		} else if (mode === 'parametric') {
			comps['minecraft:particle_motion_parametric'] = {
				relative_position: getValue('particle_motion_relative_position'),
				direction: getValue('particle_motion_direction'),
				rotation: getValue('particle_rotation_rotation'),
			}
		}
	}

	//Kill Plane
	comps['minecraft:particle_kill_plane'] = getValue('particle_lifetime_kill_plane');
	
	//Texture
	var tex_comp = comps['minecraft:particle_appearance_billboard'] = {
		size: getValue('particle_appearance_size'),
		facing_camera_mode: getValue('particle_appearance_facing_camera_mode'),
		uv: {
			texture_width: Config.particle_texture_width,
			texture_height: Config.particle_texture_height,
		}
	}
	if (getValue('particle_texture_mode') === 'static') {
		tex_comp.uv.uv = getValue('particle_texture_uv')||[0, 0];
		tex_comp.uv.uv_size = getValue('particle_texture_uv_size')||[1, 1];
	} else {
		tex_comp.uv.flipbook = {
			base_UV: getValue('particle_texture_uv'),
			size_UV: getValue('particle_texture_uv_size'),
			step_UV: getValue('particle_texture_uv_step'),
			frames_per_second: getValue('particle_texture_frames_per_second'),
			max_frame: getValue('particle_texture_max_frame'),
			stretch_to_lifetime: getValue('particle_texture_stretch_to_lifetime'),
			loop: getValue('particle_texture_loop'),
		}
	}
	//Collision
	if (getValue('particle_collision_enabled')) {
		comps['minecraft:particle_motion_collision'] = {
			collision_drag: getValue('particle_collision_collision_drag'),
			coefficient_of_restitution: getValue('particle_collision_coefficient_of_restitution'),
			collision_radius: getValue('particle_collision_collision_radius'),
			expire_on_contact: getValue('particle_collision_expire_on_contact'),
		}
	}
	if (getValue('particle_color_light')) {
		comps['minecraft:particle_appearance_lighting'] = {}
	}
	if (getValue('particle_color_mode') === 'static') {

		/* todo
		let value = Data.particle.color.inputs.picker.value;
		var val = (this.value && this.value.hsl) ? this.value.hex : this.value;
		var c = tinycolor(val).toHex();
		var data = new THREE.Color('#'+c)


		var static_color = Data.particle.color.inputs.picker.calculate()
		if (!static_color.equals({r: 1, g: 1, b: 1})) {
			comps['minecraft:particle_appearance_tinting'] = {
				color: [
					static_color.r,
					static_color.g,
					static_color.b,
				]
			}
		}
		*/
	} else if (getValue('particle_color_mode') === 'gradient') {

		let range = getValue('particle_color_range')
		comps['minecraft:particle_appearance_tinting'] = {
			color: {
				interpolant: getValue('particle_color_interpolant'),
				gradient: Data.particle.color.inputs.gradient.export(range)
			}
		}

	} else {
		var color = getValue('particle_color_expression')
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