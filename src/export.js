import Data from './input_structure'
import {compileJSON, IO} from './util'

import {Config} from './emitter'
import { MathUtils } from 'three';

function processValue(v, type) {
	if (type.type === 'molang') {
		if (!isNaN(v)) {
			v = parseFloat(v)
		} else if (typeof v == 'string' && v.includes('\n')) {
			v = v.replace(/[\r\n]+/g, '');
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
function formatEventList(list) {
	if (list.length == 1) {
		return list[0]
	} else if (list.length > 1) {
		return list;
	}
}
function formatEventTimeline(source) {
	let has_data = false;
	let copy = {};
	for (let key in source) {
		copy[key] = formatEventList(source[key]);
		if (copy[key]) has_data = true;
	}
	if (has_data) {
		return copy;
	}
}
function formatEventTimelineLooping(source) {
	if (!source) return;
	let copy_list = [];
	for (let entry of source) {
		let copy = {
			distance: entry.distance,
			effects: formatEventList(entry.effects)
		};
		copy_list.push(copy);
	}
	if (copy_list.length) {
		return copy_list;
	}
}


function generateFile() {
	var file = {
		format_version: '1.10.0',
		particle_effect: {
			description: {
				identifier: Config.identifier,
				basic_render_parameters: {
					material: Data.appearance.appearance.inputs.material.value,
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
			horizontal_range: curve.mode == 'bezier_chain' ? undefined : processValue(curve.range, {type: 'molang'}),
			nodes: curve.nodes.slice()
		}
		if (json_curve.type == 'bezier_chain') {
			let nodes = {};
			json_curve.nodes.forEach(node => {
				let time = Math.roundTo(node.time, 2).toString();
				if (time.search(/\./) < 0) time += '.0'
				nodes[time] = {
					value: node.right_value == node.left_value ? node.left_value : undefined,
					left_value: node.right_value == node.left_value ? undefined : node.left_value,
					right_value: node.right_value == node.left_value ? undefined : node.right_value,

					slope: node.right_slope == node.left_slope ? node.left_slope : undefined,
					left_slope: node.right_slope == node.left_slope ? undefined : node.left_slope,
					right_slope: node.right_slope == node.left_slope ? undefined : node.right_slope,
				}
			})
			json_curve.nodes = nodes;
		}
		json_curves[key] = json_curve
	}
	if (Object.keys(json_curves).length) {
		file.particle_effect.curves  = json_curves;
	}

	//Events
	if (Data.events.events.events.length) {
		function cleanEvent(subpart) {
			if (!subpart) return;
			if (subpart.randomize instanceof Array) {
				for (let option of subpart.randomize) {
					delete option.uuid;
					cleanEvent(option);
				}
			}
			if (subpart.sequence instanceof Array) {
				for (let option of subpart.sequence) {
					delete option.uuid;
					cleanEvent(option);
				}
			}
			if (subpart.particle_effect) {
				let {particle_effect} = subpart;
				if (!particle_effect.pre_effect_expression) {
					delete particle_effect.pre_effect_expression;
				} else if (typeof particle_effect.pre_effect_expression == 'string') {
					particle_effect.pre_effect_expression = particle_effect.pre_effect_expression.trim();
					if (!particle_effect.pre_effect_expression.endsWith(';')) {
						particle_effect.pre_effect_expression = particle_effect.pre_effect_expression + ';';
					}
				}
			}
			return subpart;
		}
		file.particle_effect.events = {};
		for (let entry of Data.events.events.events) {
			let copy = JSON.parse(JSON.stringify(entry.event));
			file.particle_effect.events[entry.id] = cleanEvent(copy);
		}
	}

	var comps = file.particle_effect.components = {};

	//Emitter Components
	if (getValue('variables_creation_vars')) {
		var s = getValue('variables_creation_vars').join(';')+';';
		s = s.replace(/;;+/g, ';')
		if (s) {
			comps['minecraft:emitter_initialization'] = {
				creation_expression: s,
			}
		}
	}
	if (getValue('variables_tick_vars')) {
		var s = getValue('variables_tick_vars').join(';')+';';
		s = s.replace(/;;+/g, ';')
		if (s) {
			if (!comps['minecraft:emitter_initialization']) comps['minecraft:emitter_initialization'] = {};
			comps['minecraft:emitter_initialization'].per_update_expression = s;
		}
	}
	if (getValue('space_local_position', 'boolean')) {
		comps['minecraft:emitter_local_space'] = {
			position: getValue('space_local_position', 'boolean'),
			rotation: getValue('space_local_rotation', 'boolean'),
			velocity: getValue('space_local_velocity', 'boolean') || undefined,
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
	} else if (mode === 'manual') {
		comps['minecraft:emitter_rate_manual'] = {
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
		}
	}
	//Particle Events
	let emitter_events = {
		creation_event: formatEventList(Config.emitter_events_creation),
		expiration_event: formatEventList(Config.emitter_events_expiration),
		timeline: formatEventTimeline(Config.emitter_events_timeline),
		travel_distance_events: formatEventTimeline(Config.emitter_events_distance),
		looping_travel_distance_events: formatEventTimelineLooping(Config.emitter_events_distance_looping),
	}
	if (emitter_events.creation_event || emitter_events.expiration_event || emitter_events.timeline || emitter_events.travel_distance_events || emitter_events.looping_travel_distance_events) {
		comps['minecraft:emitter_lifetime_events'] = emitter_events;
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

	// Variables
	if (getValue('particle_update_expression')) {
		var s = getValue('particle_update_expression').join(';')+';';
		s = s.replace(/;;+/g, ';')
		if (s) {
			comps['minecraft:particle_initialization'] = {
				per_update_expression: s,
			}
		}
	}
	if (getValue('particle_render_expression')) {
		var s = getValue('particle_render_expression').join(';')+';';
		s = s.replace(/;;+/g, ';')
		if (s) {
			if (!comps['minecraft:particle_initialization']) comps['minecraft:particle_initialization'] = {};
			comps['minecraft:particle_initialization'].per_render_expression = s;
		}
	}

	//Lifetime
	comps['minecraft:particle_lifetime_expression'] = {
		max_lifetime: getValue('particle_lifetime_max_lifetime'),
		expiration_expression: getValue('particle_lifetime_expiration_expression')
	}
	if (getValue('particle_lifetime_expire_in')) {
		comps['minecraft:particle_expire_if_in_blocks'] = getValue('particle_lifetime_expire_in')
	}
	if (getValue('particle_lifetime_expire_outside')) {
		comps['minecraft:particle_expire_if_not_in_blocks'] = getValue('particle_lifetime_expire_outside')
	}

	//Particle Events
	let particle_events = {
		creation_event: formatEventList(Config.particle_events_creation),
		expiration_event: formatEventList(Config.particle_events_expiration),
		timeline: formatEventTimeline(Config.particle_events_timeline),
	}
	if (particle_events.creation_event || particle_events.expiration_event || particle_events.timeline) {
		comps['minecraft:particle_lifetime_events'] = particle_events;
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

	//Motion
	var mode = getValue('particle_motion_mode')
	if (mode) {
		if (mode === 'dynamic') {
			comps['minecraft:particle_motion_dynamic'] = {
				linear_acceleration: getValue('particle_motion_linear_acceleration'),
				linear_drag_coefficient: getValue('particle_motion_linear_drag_coefficient'),
			}
			if (!comps['minecraft:particle_initial_speed']) comps['minecraft:particle_initial_speed'] = 0;
		} else if (mode === 'parametric') {
			comps['minecraft:particle_motion_parametric'] = {
				relative_position: getValue('particle_motion_relative_position'),
				direction: getValue('particle_motion_direction'),
			}
		}
	}

	//Rotation
	var mode = getValue('particle_rotation_mode')
	if (mode) {
		if (mode === 'dynamic') {
			let rotation_acceleration = getValue('particle_rotation_rotation_acceleration');
			let rotation_drag_coefficient = getValue('particle_rotation_rotation_drag_coefficient');
			if (rotation_acceleration || rotation_drag_coefficient) {
				if (!comps['minecraft:particle_motion_dynamic']) comps['minecraft:particle_motion_dynamic'] = {};
				let dyn_mo = comps['minecraft:particle_motion_dynamic'];
				dyn_mo.rotation_acceleration = rotation_acceleration;
				dyn_mo.rotation_drag_coefficient = rotation_drag_coefficient;
			}
		} else if (mode === 'parametric') {
			let rotation = getValue('particle_rotation_rotation');
			if (rotation) {
				if (!comps['minecraft:particle_motion_parametric']) comps['minecraft:particle_motion_parametric'] = {};
				comps['minecraft:particle_motion_parametric'].rotation = rotation;
			}
		}
	}

	//Kill Plane
	comps['minecraft:particle_kill_plane'] = getValue('particle_lifetime_kill_plane');
	
	//Texture
	let facing_camera_mode = getValue('particle_appearance_facing_camera_mode');
	var tex_comp = comps['minecraft:particle_appearance_billboard'] = {
		size: getValue('particle_appearance_size'),
		facing_camera_mode: facing_camera_mode,
		
	}
	if ((facing_camera_mode.substring(0, 9) == 'direction' || facing_camera_mode == 'lookat_direction') &&
		(getValue('particle_appearance_speed_threshold') != 0.01 || getValue('particle_appearance_direction_mode') != 'derive_from_velocity')
	) {
		tex_comp.direction = {
			mode: getValue('particle_appearance_direction_mode')
		}
		if (tex_comp.direction.mode == 'derive_from_velocity') {
			tex_comp.direction.min_speed_threshold = getValue('particle_appearance_speed_threshold');
		} else {
			tex_comp.direction.custom_direction = getValue('particle_appearance_direction');
		}
	}
	if (getValue('particle_texture_mode') !== 'full') {
		tex_comp.uv = {
			texture_width: parseInt(Config.particle_texture_size[0]) || 0,
			texture_height: parseInt(Config.particle_texture_size[1]) || 0,
		}
		if (getValue('particle_texture_mode') === 'static') {
			tex_comp.uv.uv = getValue('particle_texture_uv')||[0, 0];
			tex_comp.uv.uv_size = getValue('particle_texture_uv_size')||[tex_comp.uv.texture_width, tex_comp.uv.texture_height];

		} else {
			tex_comp.uv.flipbook = {
				base_UV: getValue('particle_texture_uv', true),
				size_UV: getValue('particle_texture_uv_size', true),
				step_UV: getValue('particle_texture_uv_step', true),
				frames_per_second: getValue('particle_texture_frames_per_second'),
				max_frame: getValue('particle_texture_max_frame'),
				stretch_to_lifetime: getValue('particle_texture_stretch_to_lifetime'),
				loop: getValue('particle_texture_loop'),
			}
		}
	}
	//Collision
	if (getValue('particle_collision_toggle')) {
		comps['minecraft:particle_motion_collision'] = {
			enabled: getValue('particle_collision_enabled'),
			collision_drag: getValue('particle_collision_collision_drag'),
			coefficient_of_restitution: getValue('particle_collision_coefficient_of_restitution'),
			collision_radius: getValue('particle_collision_collision_radius'),
			expire_on_contact: getValue('particle_collision_expire_on_contact'),
			events: getValue('particle_collision_events'),
		}
	}
	if (getValue('particle_color_light')) {
		comps['minecraft:particle_appearance_lighting'] = {}
	}
	if (getValue('particle_color_mode') === 'static') {

		
		let value = getValue('particle_color_static').substr(1, 8)
		if (value.toLowerCase() != 'ffffff') {
			let color = value.match(/.{2}/g).map(c => {
				return parseInt(c, 16) / 255;
			})
			if (color.length == 3) color[3] = 1;
			comps['minecraft:particle_appearance_tinting'] = {
				color
			}
		}
	} else if (getValue('particle_color_mode') === 'gradient') {

		let range = getValue('particle_color_range')
		comps['minecraft:particle_appearance_tinting'] = {
			color: {
				interpolant: getValue('particle_color_interpolant'),
				gradient: Data.appearance.color.inputs.gradient.export(range||1)
			}
		}

	} else {
		var color = getValue('particle_color_expression')
		if (color instanceof Array) {
			color.forEach((s, i) => {
				if (typeof s == 'number') {
					color[i] = MathUtils.clamp(s, 0, 1);
				}
			})
			if (!color[3]) color[3] = 1;
			comps['minecraft:particle_appearance_tinting'] = {
				color: color
			}
		}
	}

	return file;
}
window.generateFileForParentEffect = function() {
	let json = generateFile();
	return JSON.stringify(json);
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