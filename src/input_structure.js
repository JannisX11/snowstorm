import Input from './input'
import Gradient from './gradient'
import {Config} from './emitter'
import vscode from './vscode_extension';

const Data = {
	setup: {
		label: 'Quick Setup',
	},

	effect: {
		label: 'File',
		meta: {
			label: 'File',
			_folded: false,
			inputs: {
				identifier: new Input({
					id: 'identifier',
					label: 'Identifier',
					info: 'This is the name the particle emitter is referred to as. Should have a namespace.',
					placeholder: 'space:name',
					required: true,
					type: 'text',
					onchange() {
						document.title = (this.value ? this.value + ' - ' : '') + 'Snowstorm';
					}
				})
			}
		},
		space: {
			label: 'Space',
			_folded: false,
			inputs: {
				local_position: new Input({
					id: 'space_local_position',
					label: 'Local Position',
					info: 'When enabled and the effect is attached to an entity, the particles will simulate in entity space',
					type: 'checkbox',
					onchange(e) {
						if (!Data.effect.space.inputs.local_position.value) {
							Data.effect.space.inputs.local_rotation.set(false);
						}
					}
				}),
				local_rotation: new Input({
					id: 'space_local_rotation',
					label: 'Local Rotation',
					info: 'When enabled and the effect is attached to an entity, the particle rotation will simulate in entity space. Only works if local position is enabled too.',
					type: 'checkbox',
					onchange(e) {
						if (Data.effect.space.inputs.local_rotation.value) {
							Data.effect.space.inputs.local_position.set(true);
						}
					}
				}),
				local_velocity: new Input({
					id: 'space_local_velocity',
					label: 'Local Velocity',
					info: 'When enabled and the effect is attached to an entity, the particle velocity will simulate in entity space.',
					type: 'checkbox'
				})
			}
		},
	},
	emitter: {
		label: 'Emitter',
		rate: {
			label: 'Spawn Amount',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'emitter_rate_mode',
					type: 'select',
					label: 'Mode',
					info: '',
					mode_groups: ['emitter', 'rate'],
					options: {
						steady: 'Steady',
						instant: 'Instant',
						manual: 'Manual'
					}
				}),
				rate: new Input({
					id: 'emitter_rate_rate',
					label: 'Rate',
					info: 'How often a particle is emitted, in particles/sec. Evaluated once per particle emitted.',
					enabled_modes: ['steady'],
					required: true,
					value: 4,
				}),
				amount: new Input({
					id: 'emitter_rate_amount',
					label: 'Amount',
					info: 'How many particles are spawned at once',
					enabled_modes: ['instant'],
					required: true,
				}),
				maximum: new Input({
					id: 'emitter_rate_maximum',
					label: 'Maximum',
					info: '',
					enabled_modes: ['steady', 'manual'],
					required: true,
					value: 100,
				})
			}
		},
		lifetime: {
			label: 'Emitter Lifetime',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'emitter_lifetime_mode',
					type: 'select',
					label: 'Mode',
					info: '',
					mode_groups: ['emitter', 'lifetime'],
					options: {
						looping: 'Looping',
						once: 'Once',
						expression: 'Expression'
					},
					//updatePreview: (m) => {Emitter.mode = m}
				}),
				active_time: new Input({
					id: 'emitter_lifetime_active_time',
					label: 'Active Time',
					info: '',
					enabled_modes: ['looping', 'once'],
					required: true,
					value: 1,
					//updatePreview: (v) => {Emitter.active_time = v}
				}),
				sleep_time: new Input({
					id: 'emitter_lifetime_sleep_time',
					label: 'Sleep Time',
					info: 'emitter will pause emitting particles for this time per loop',
					enabled_modes: ['looping'],
					//updatePreview: (v) => {Emitter.sleep_time = v}
				}),
				activation: new Input({
					id: 'emitter_lifetime_activation',
					label: 'Activation',
					info: 'When the expression is non-zero, the emitter will emit particles',
					required: true,
					enabled_modes: ['expression']
				}),
				expiration: new Input({
					id: 'emitter_lifetime_expiration',
					label: 'Expiration',
					info: 'Emitter will expire if the expression is non-zero',
					enabled_modes: ['expression']
				})
			}
		},
		shape: {
			label: 'Spawn Shape',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'emitter_shape_mode',
					type: 'select',
					label: 'Mode',
					mode_groups: ['emitter', 'shape'],
					options: {
						point: 'Point',
						sphere: 'Sphere',
						box: 'Box',
						disc: 'Disc',
						//custom: 'Custom',
						entity_aabb: 'Entity Bounding Box',
					},
					//updatePreview: (m) => {Emitter.shape = m}
				}),
				offset: new Input({
					id: 'emitter_shape_offset',
					label: 'Offset',
					info: 'Specifies the offset from the emitter to emit each particle',
					axis_count: 3,
					enabled_modes: ['point', 'sphere', 'box', 'custom', 'disc']
				}),
				radius: new Input({
					id: 'emitter_shape_radius',
					label: 'Radius',
					required: true,
					info: 'Sphere or disc radius',
					enabled_modes: ['sphere', 'disc'],
				}),
				half_dimensions: new Input({
					id: 'emitter_shape_half_dimensions',
					label: 'Box Size',
					info: 'Half dimensions of the box formed around the emitter',
					axis_count: 3,
					enabled_modes: ['box'],
				}),
				plane_normal: new Input({
					id: 'emitter_shape_plane_normal',
					label: 'Plane Normal',
					info: 'Specifies the normal of the disc plane, the disc will be perpendicular to this direction',
					axis_count: 3,
					enabled_modes: ['disc']
				}),
				surface_only: new Input({
					id: 'emitter_shape_surface_only',
					label: 'Surface Only',
					info: 'Emit only from the surface of the shape',
					type: 'checkbox',
					enabled_modes: ['sphere', 'box', 'entity_aabb', 'disc']
				})
			}
		},
	},
	motion: {
		label: 'Motion',
		motion: {
			label: 'Motion',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'particle_motion_mode',
					type: 'select',
					label: 'Mode',
					mode_groups: ['motion', 'motion'],
					options: {
						dynamic: 'Dynamic',
						parametric: 'Parametric',
						static: 'Static',
					},
				}),
				direction_mode: new Input({
					id: 'particle_direction_mode',
					type: 'select',
					label: 'Direction',
					info: 'The direction of emitted particles in regards to the emitter shape',
					enabled_modes: ['dynamic'],
					options: {
						outwards: 'Outwards',
						inwards: 'Inwards',
						direction: 'Custom',
					},
				}),
				direction: new Input({
					id: 'particle_direction_direction',
					label: 'Direction',
					info: 'The direction of emitted particles',
					axis_count: 3,
					enabled_modes: ['dynamic'],
					condition(group) {
						return group.inputs.mode.value == 'dynamic'
							&& group.inputs.direction_mode.value == 'direction'
					}
				}),
				linear_speed: new Input({
					id: 'particle_motion_linear_speed',
					label: 'Speed',
					info: 'Starts the particle with a specified speed, using the direction specified by the emitter shape',
					enabled_modes: ['dynamic'],
					required: true
				}),
				linear_acceleration: new Input({
					id: 'particle_motion_linear_acceleration',
					label: 'Acceleration',
					info: 'The linear acceleration applied to the particle in blocks/sec/sec',
					axis_count: 3,
					enabled_modes: ['dynamic'],
				}),
				linear_drag_coefficient: new Input({
					id: 'particle_motion_linear_drag_coefficient',
					label: 'Air Drag',
					info: 'Think of this as air-drag.  The higher the value, the more drag evaluated every frame.',
					enabled_modes: ['dynamic']
				}),
				relative_position: new Input({
					id: 'particle_motion_relative_position',
					label: 'Offset',
					info: 'Directly set the position relative to the emitter',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
				relative_direction: new Input({
					id: 'particle_motion_direction',
					label: 'Direction',
					info: 'Directly set the 3d direction of the particle',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
			}
		},
		rotation: {
			label: 'Rotation',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'particle_rotation_mode',
					type: 'select',
					label: 'Mode',
					mode_groups: ['motion', 'rotation'],
					options: {
						dynamic: 'Dynamic',
						parametric: 'Parametric',
					},
				}),
				initial_rotation: new Input({
					id: 'particle_rotation_initial_rotation',
					label: 'Start Rotation',
					info: 'Specifies the initial rotation in degrees',
					enabled_modes: ['dynamic']
				}),
				rotation_rate: new Input({
					id: 'particle_rotation_rotation_rate',
					label: 'Speed',
					info: 'Specifies the spin rate in degrees/second',
					enabled_modes: ['dynamic']
				}),
				rotation_acceleration: new Input({
					id: 'particle_rotation_rotation_acceleration',
					label: 'Acceleration',
					info: 'Acceleration applied to the rotation speed of the particle in degrees/sec/sec.',
					enabled_modes: ['dynamic']
				}),
				rotation_drag_coefficient: new Input({
					id: 'particle_rotation_rotation_drag_coefficient',
					label: 'Air Drag',
					info: 'Rotation resistance. Higher numbers will retard the rotation over time.',
					enabled_modes: ['dynamic']
				}),
				rotation: new Input({
					id: 'particle_rotation_rotation',
					label: 'Rotation',
					info: 'Directly set the rotation of the particle',
					enabled_modes: ['parametric']
				})
			}
		},
		collision: {
			label: 'Collision',
			_folded: false,
			inputs: {
				toggle: new Input({
					id: 'particle_collision_toggle',
					label: 'Collide',
					info: 'Make the particle collide with the world',
					type: 'checkbox',
					mode_groups: ['motion', 'collision'],
				}),
				collision_radius: new Input({
					id: 'particle_collision_collision_radius',
					label: 'Radius',
					info: 'Used to minimize interpenetration of particles with the environment',
					min: 0.0,
					max: 0.5,
					step: 0.05,
					required: true,
					type: 'number',
					enabled_modes: [true]
				}),
				collision_drag: new Input({
					id: 'particle_collision_collision_drag',
					label: 'Collision Drag',
					info: 'Alters the speed of the particle when it has collided',
					type: 'number',
					step: 0.1,
					enabled_modes: [true]
				}),
				coefficient_of_restitution: new Input({
					id: 'particle_collision_coefficient_of_restitution',
					label: 'Bounciness',
					info: 'Set to 0.0 to not bounce, 1.0 to bounce back up to original hight',
					type: 'number',
					step: 0.1,
					enabled_modes: [true]
				}),
				condition: new Input({
					id: 'particle_collision_enabled',
					label: 'Condition',
					info: 'Enables collision when true / non-zero or unset',
					enabled_modes: [true]
				}),
				events: new Input({
					id: 'particle_collision_events',
					label: 'Events',
					info: 'Events to fire when the particle collides',
					type: 'event_speed_list',
					enabled_modes: [true]
				}),
				expire_on_contact: new Input({
					id: 'particle_collision_expire_on_contact',
					label: 'Expire On Contact',
					info: 'Removes the particle when it hits a block',
					type: 'checkbox',
					enabled_modes: [true]
				}),
			}
		}
	},
	appearance: {
		label: 'Appearance',
		appearance: {
			label: 'Appearance',
			_folded: false,
			inputs: {
				size: new Input({
					id: 'particle_appearance_size',
					label: 'Size',
					info: 'Specifies the x/y size of the particle billboard.',
					axis_count: 2,
					value: [0.2, 0.2]
				}),
				material: new Input({
					id: 'particle_appearance_material',
					type: 'select_custom',
					info: 'Material to use for the particles',
					label: 'Material',
					options: {
						particles_alpha: 'Alpha Test',
						particles_blend: 'Blend',
						particles_add: 'Additive',
						particles_opaque: 'Opaque',
						custom: 'Custom:',
					},
				}),
				facing_camera_mode: new Input({
					id: 'particle_appearance_facing_camera_mode',
					type: 'select',
					info: 'Modes to orient the particle billboards facing the camera',
					label: 'Facing',
					options: {
						rotate_xyz: 'Rotate XYZ',
						rotate_y: 'Rotate Y',
						lookat_xyz: 'Look at XYZ',
						lookat_y: 'Look at Y',
						lookat_direction: 'Look at Direction',
						direction_x: 'Direction X',
						direction_y: 'Direction Y',
						direction_z: 'Direction Z',
						emitter_transform_xy: 'Emitter XY-Plane',
						emitter_transform_xz: 'Emitter XZ-Plane',
						emitter_transform_yz: 'Emitter YZ-Plane',
					},
				}),
				direction_mode: new Input({
					id: 'particle_appearance_direction_mode',
					type: 'select',
					info: 'Specifies how to calculate the billboard direction of a particle',
					label: 'Direction',
					options: {
						derive_from_velocity: 'From Motion',
						custom: 'Custom',
					},
					condition(group) {
						return group.inputs.facing_camera_mode.value.substr(0, 9) == 'direction' || group.inputs.facing_camera_mode.value == 'lookat_direction'
					}
				}),
				speed_threshold: new Input({
					id: 'particle_appearance_speed_threshold',
					label: 'Min Speed',
					info: 'The direction is set if the speed of the particle is above the threshold. The default is 0.01',
					type: 'number',
					step: 0.01,
					condition(group) {
						return group.inputs.facing_camera_mode.value.substr(0, 9) == 'direction' || group.inputs.facing_camera_mode.value == 'lookat_direction'
							&& group.inputs.direction_mode.value == 'derive_from_velocity';
					}
				}),
				direction: new Input({
					id: 'particle_appearance_direction',
					label: 'Direction',
					info: 'The facing direction of emitted particles',
					axis_count: 3,
					condition(group) {
						return group.inputs.facing_camera_mode.value.substr(0, 9) == 'direction' || group.inputs.facing_camera_mode.value == 'lookat_direction'
							&& group.inputs.direction_mode.value == 'custom';
					}
				}),
				light: new Input({
					id: 'particle_color_light',
					label: 'Environment Lighting',
					type: 'checkbox',
				}),
			}
		},
		color: {
			label: 'Color',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'particle_color_mode',
					type: 'select',
					label: 'Color Mode',
					mode_groups: ['appearance', 'color'],
					options: {
						static: 'Static',
						gradient: 'Gradient',
						expression: 'Expression',
					},
					onchange() {
						if (Data.appearance.color.inputs.mode.value == 'gradient') {
							if (Data.appearance.color.inputs.range.value == 0) {
								Data.appearance.color.inputs.range.value = 1;
							}
							if (!Data.appearance.color.inputs.interpolant.value) {
								Data.appearance.color.inputs.interpolant.value = 'v.particle_age / v.particle_lifetime';
							}
						}
					}
				}),
				picker: new Input({
					id: 'particle_color_static',
					label: 'Color',
					type: 'color',
					enabled_modes: ['static'],
					info: 'Set a static color for all emitted particles. Transparency is supported when the material is "Blend".'
				}),
				interpolant: new Input({
					id: 'particle_color_interpolant',
					label: 'Interpolant',
					info: 'Color Gradient Interpolant. Hint: use a curve here!',
					enabled_modes: ['gradient']
				}),
				range: new Input({
					id: 'particle_color_range',
					label: 'Range',
					info: 'Color Gradient Range',
					type: 'number',
					value: 1,
					enabled_modes: ['gradient']
				}),
				gradient: new Gradient({
					id: 'particle_color_gradient',
					label: 'Gradient',
					info: 'Gradient',
					type: 'gradient',
					enabled_modes: ['gradient']
				}),
				expression: new Input({
					id: 'particle_color_expression',
					label: 'Color',
					info: 'Set the color per particle using MoLang expressions in RGBA channels between 0 and 1. Alpha channel display is only supported with "Blend" material.',
					axis_count: 4,
					enabled_modes: ['expression']
				}),
			}
		},
	},
	texture: {
		label: 'Texture & UV',
		texture: {
			label: 'Texture',
			_folded: false,
			inputs: {
				path: new Input({
					id: 'particle_texture_path',
					type: 'text',
					info: 'Path to the texture, starting from the texture pack. Example: textures/particle/snowflake',
					placeholder: 'textures/particle/particles',
					label: 'Texture',
					updatePreview: function() {
						Config.updateTexture();
					}
				}),
				image: new Input({
					id: 'particle_texture_image',
					type: 'image',
					allow_upload: !vscode,
					updatePreview: function(src) {
						Config.updateTexture();
					}
				}),
			}
		},
		uv: {
			label: 'UV',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'particle_texture_mode',
					type: 'select',
					label: 'UV Mode',
					mode_groups: ['texture', 'uv'],
					options: {
						static: 'Static',
						full: 'Full Size',
						animated: 'Animated',
					},
				}),
				size: new Input({
					id: 'particle_texture_size',
					label: 'Texture Size',
					info: 'Resolution of the texture, used for UV mapping',
					type: 'number',
					axis_count: 2,
					required: true,
					value: [16, 16],
					enabled_modes: ['static', 'animated']
				}),
				uv: new Input({
					id: 'particle_texture_uv',
					label: 'UV Start',
					info: 'UV start coordinates',
					axis_count: 2,
					required: true,
					value: [0, 0],
					enabled_modes: ['static', 'animated']
				}),
				uv_size: new Input({
					id: 'particle_texture_uv_size',
					label: 'UV Size',
					info: 'UV size coordinates',
					axis_count: 2,
					value: [16, 16],
					enabled_modes: ['static', 'animated']
				}),
				uv_step: new Input({
					id: 'particle_texture_uv_step',
					label: 'UV Step',
					info: 'UV Offset per frame',
					axis_count: 2,
					enabled_modes: ['animated']
				}),
				frames_per_second: new Input({
					id: 'particle_texture_frames_per_second',
					label: 'FPS',
					info: 'Animation frames per second',
					type: 'number',
					min: 0,
					enabled_modes: ['animated']
				}),
				max_frame: new Input({
					id: 'particle_texture_max_frame',
					label: 'Max Frame',
					info: 'Maximum amount of frames to draw from the flipbook',
					enabled_modes: ['animated']
				}),
				stretch_to_lifetime: new Input({
					id: 'particle_texture_stretch_to_lifetime',
					label: 'Stretch To Lifetime',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
				loop: new Input({
					id: 'particle_texture_loop',
					label: 'Loop',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
			}
		},
	},
	lifetime: {
		label: 'Time',
		lifetime: {
			label: 'Particle Lifetime',
			_folded: false,
			inputs: {
				max_lifetime: new Input({
					id: 'particle_lifetime_max_lifetime',
					label: 'Max Age',
					info: 'Maximum age of the particle in seconds',
					value: 1
				}),
				expiration_expression: new Input({
					id: 'particle_lifetime_expiration_expression',
					label: 'Kill Expression',
					info: 'This expression makes the particle expire when true (non-zero)'
				}),
				kill_plane: new Input({
					id: 'particle_lifetime_kill_plane',
					label: 'Kill Plane',
					type: 'number',
					step: 0.1,
					info: 'Particles that cross this plane expire. The plane is relative to the emitter, but oriented in world space. The four parameters are the usual 4 elements of a plane equation.',
					axis_count: 4
				}),
				expire_in: new Input({
					id: 'particle_lifetime_expire_in',
					label: 'Kill in Blocks',
					info: 'List of blocks to that let the particle expire on contact. Block IDs have a namespace and are separated by a space character.',
					placeholder: 'minecraft:stone',
					axis_count: -1,
					type: 'text'
				}),
				expire_outside: new Input({
					id: 'particle_lifetime_expire_outside',
					label: 'Only in Blocks',
					info: 'List of blocks outside of which the particle expires. Block IDs have a namespace and are separated by a space character.',
					placeholder: 'minecraft:air',
					axis_count: -1,
					type: 'text'
				}),
			}
		},
	},
	events: {
		label: 'Events',
		events: {
			label: 'Events',
			_folded: false,
			type: 'events',
			events: []
		},
		emitter_events: {
			label: 'Emitter Event Triggers',
			_folded: false,
			inputs: {
				creation: new Input({
					id: 'emitter_events_creation',
					label: 'On Creation',
					info: 'Events to fire when the emitter is spawned',
					type: 'event_list',
				}),
				expiration: new Input({
					id: 'emitter_events_expiration',
					label: 'On Expiration',
					info: 'Events to fire when the emitter stops to exist',
					type: 'event_list',
				}),
				travel_distance: new Input({
					id: 'emitter_events_distance',
					label: 'Travel Distance',
					info: 'Fire an event when the emitter has moved a certain distance. Emitters can move when they are attached to an entity that moves. Distances are specified in blocks.',
					type: 'event_timeline',
				}),
				looping_travel_distance: new Input({
					id: 'emitter_events_distance_looping',
					label: 'Travel Distance Looping',
					info: 'Fire an event every time the emitter has moved a certain distance. Emitters can move when they are attached to an entity that moves. Distances are specified in blocks.',
					type: 'event_timeline',
				}),
				timeline: new Input({
					id: 'emitter_events_timeline',
					label: 'Timeline',
					info: 'Events to fire when the emitter stops to exist',
					type: 'event_timeline',
				}),
			}
		},
		particle_events: {
			label: 'Particle Event Triggers',
			_folded: false,
			inputs: {
				creation: new Input({
					id: 'particle_events_creation',
					label: 'On Creation',
					info: 'Events to fire when the particle is spawned',
					type: 'event_list',
				}),
				expiration: new Input({
					id: 'particle_events_expiration',
					label: 'On Expiration',
					info: 'Events to fire when the particle stops to exist',
					type: 'event_list',
				}),
				timeline: new Input({
					id: 'particle_events_timeline',
					label: 'Timeline',
					info: 'Events to fire when the particle stops to exist',
					type: 'event_timeline',
				}),
			}
		}
	},
	variables: {
		label: 'Variables & Curves',
		variables: {
			label: 'Variables',
			_folded: false,
			inputs: {
				creation_vars: new Input({
					id: 'variables_creation_vars',
					label: 'Start Variables',
					info: 'Set up MoLang Variables when the emitter starts',
					placeholder: 'variable.name = value;',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						/*
						Emitter.creation_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.creation_variables[key] = p.join('=');
							}
						})*/
					}
				}),
				tick_vars: new Input({
					id: 'variables_tick_vars',
					label: 'Tick Variables',
					info: 'MoLang Variables that get processed for every Emitter update',
					placeholder: 'variable.name = value;',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						/*
						Emitter.tick_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.tick_variables[key] = p.join('=');
							}
						})*/
					}
				}),
				particle_update: new Input({
					id: 'particle_update_expression',
					label: 'Particle Update',
					info: 'Run an expression on the emitter for every particle when the emitter updates',
					placeholder: 'variable.name = value;',
					type: 'molang',
					axis_count: -1
				}),
				particle_render: new Input({
					id: 'particle_render_expression',
					label: 'Particle Render',
					info: 'Run an expression on the emitter each time a particle is rendered',
					placeholder: 'variable.name = value;',
					type: 'molang',
					axis_count: -1
				})
			}
		},
		curves: {
			label: 'Curves',
			_folded: false,
			type: 'curves',
			curves: []
		}
	},
};


function forEachInput(cb) {
	for (var k_subject in Data) {
		for (var k_group in Data[k_subject]) {
			var group = Data[k_subject][k_group]
			if (typeof group === 'object') {
				for (var key in group.inputs) {
					if (group.inputs[key] instanceof Input) {
						cb(group.inputs[key], key)
					}
				}
			}
		}
	}
}
//Setup Data
forEachInput(input => {
	input.update(Data);
})

window.Data = Data;
export default Data
export {forEachInput}
