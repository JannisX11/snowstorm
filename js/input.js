
var side_vue;

class Input {
	constructor(data) {
		this.type = data.type||'molang';
		this.isInput = true;
		this.label = data.label;
		this.info = data.info;
		this.placeholder = data.placeholder;
		this.required = data.required == true;
		this.expanded = data.expanded == true;
		this.expandable = ['molang', 'text', 'number'].includes(this.type);
		this.value = data.value;

		this.options = data.options;
		this.mode_groups = data.mode_groups;
		if (this.mode_groups && !(this.mode_groups[0] instanceof Array)) {
			this.mode_groups = [this.mode_groups];
		}
		this.enabled_modes = data.enabled_modes;
		this.axis_count = data.axis_count||1;

		this.updatePreview = data.updatePreview;
		this.onchange = data.onchange;
		if (this.type === 'select') {
			if (!this.value) {
				this.value = Object.keys(this.options)[0]
			}
			this.meta_value = this.options[this.value]

		} else if (this.type === 'color') {
			this.value = '#ffffff';

		} else if (this.axis_count > 1 && !this.value) {
			this.value = []
		} else if (this.type === 'list' && !this.value) {
			this.value = []
		}
		this.default_value = this.value instanceof Array ? this.value.slice() : this.value;
	}
	toggleExpand() {
		if (this.expandable) {
			this.expanded = !this.expanded;
		}
	}
	update() {
		var scope = this;
		if (this.type === 'select') {
			if (this.mode_groups instanceof Array) {

				this.mode_groups.forEach((group, i) => {
					if (group instanceof Array) {
						group = scope.mode_groups[i] = Data[group[0]][group[1]]
					}
					group._selected_mode = scope.value
				})
			}
		}
		return this;
	}
	change(e) {
		var scope = this;
		if (this.type === 'image' && e) {
			var file = e.target.files[0];
			if (file) {
				var reader = new FileReader()
				reader.onloadend = function() {
					scope.image = {
						name: file.name,
						data: reader.result
					}
					$(e.target).siblings('.input_texture_preview').css('background-image', `url(${reader.result})`)
					scope.updatePreview(scope.image)
				}
				reader.readAsDataURL(file)
			}
		}
		if (this.type === 'select') {
			if (e) {
				this.value = $(e.target).find('option:selected').attr('id')
			}
			this.update()
		}
		if (ExpandedInput.obj && ['molang', 'text', 'list'].includes(this.type)) {
			this.focus()
		}
		if (typeof this.onchange === 'function') {
			this.onchange(e)
		}
		if (typeof this.updatePreview === 'function' && this.type !== 'image') {
			var data = this.calculate()
			this.updatePreview(data)
		}
		return this;
	}
	calculate(opts) {
		var scope = this;
		function getV(v) {
			if (scope.type === 'molang') {
				return Molang.parse(v, opts)
			} else if (scope.type === 'number') {
				return parseFloat(v)||0;
			}
		}
		var data;
		if (this.type === 'molang' || this.type === 'number') {
			if (this.axis_count === 3) {
				var data = new THREE.Vector3(
					getV(this.value[0]),
					getV(this.value[1]),
					getV(this.value[2])
				)
			} else if (this.axis_count === 2) {
				var data = new THREE.Vector2(
					getV(this.value[0]),
					getV(this.value[1])
				)
			} else {
				var data = getV(this.value)
			}
		} else if (this.type === 'color') {
			var val = (this.value && this.value.hsl) ? this.value.hex : this.value;
			var c = tinycolor(val).toHex();
			var data = new THREE.Color('#'+c)
		} else {
			var data = this.value
		}
		return data;
	}
	set(value) {
		var scope = this;
		if (value === undefined) return this;
		if (this.type === 'select') {
			this.value = value
			this.meta_value = this.options[this.value]
		} else {
			this.value = value;
		}
		scope.change()
		return this;
	}
	reset() {
		this.value = this.default_value;
		this.set(this.default_value);
		if (this.type == 'image') {
			delete this.image
			$('#particle-texture-image .input_texture_preview').css('background-image', `none`)
			this.updatePreview()
		}
		return this;
	}
	focus(axis) {
		ExpandedInput.input = this;
		if (axis !== undefined) ExpandedInput.axis = axis;
		var val = (this.axis_count > 1 || this.type == 'list') ? this.value[ExpandedInput.axis] : this.value
		ExpandedInput.obj.val(val)
		return this;
	}
}
/**/



const Data = {
	general: {
		label: 'General',
		general: {
			label: 'Particle Effect',
			_folded: false,
			identifier: new Input({
				label: 'Identifier',
				info: 'This is the name the particle emitter is referred to as. Should have a namespace.',
				placeholder: 'space:name',
				required: true,
				type: 'text'
			})
		},
		position: {
			label: 'Space',
			_folded: true,
			local_position: new Input({
				label: 'Local Position',
				info: 'When enabled and the effect is attached to an entity, the particles will simulate in entity space',
				type: 'checkbox'
			}),
			local_rotation: new Input({
				label: 'Local Rotation',
				info: 'When enabled and the effect is attached to an entity, the particle rotation will simulate in entity space. Only works if local position is enabled too.',
				type: 'checkbox'
			})
		},
		variables: {
			label: 'Variables',
			_folded: true,
			creation_vars: new Input({
				label: 'Start Variables',
				info: 'Set up MoLang Variables when the emitter starts',
				placeholder: 'variable.name = value',
				type: 'list',
				onchange: function() {
					Emitter.creation_variables = {};
					this.value.forEach((s, i) => {
						var p = s.toLowerCase().replace(/\s/g, '').split('=')
						if (p.length > 1) {
							let key = p.shift();
							Emitter.creation_variables[key] = p.join('=');
						}
					})
				}
			}),
			tick_vars: new Input({
				label: 'Tick Variables',
				info: 'MoLang Variables that get processed for every Emitter update',
				placeholder: 'variable.name = value',
				type: 'list',
				onchange: function() {
					Emitter.tick_variables = {};
					this.value.forEach((s, i) => {
						var p = s.toLowerCase().replace(/\s/g, '').split('=')
						if (p.length > 1) {
							let key = p.shift();
							Emitter.tick_variables[key] = p.join('=');
						}
					})
				}
			})
		},
		curves: {
			label: 'Curves',
			_folded: true,
			type: 'curves',
			curves: []
		}
	},
	emitter: {
		label: 'Emitter',
		rate: {
			label: 'Rate',
			_folded: false,
			mode: new Input({
				type: 'select',
				label: 'Mode',
				info: '',
				mode_groups: ['emitter', 'rate'],
				options: {
					steady: 'Steady',
					instant: 'Instant'
				}
			}),
			rate: new Input({
				label: 'Rate',
				info: 'How often a particle is emitted, in particles/sec. Evaluated once per particle emitted.',
				enabled_modes: ['steady'],
				required: true,
				value: 1,
			}),
			amount: new Input({
				label: 'Amount',
				info: 'How many particles are spawned at once',
				enabled_modes: ['instant'],
				required: true,
			}),
			maximum: new Input({
				label: 'Maximum',
				info: '',
				enabled_modes: ['steady'],
				required: true,
				value: 100,
			})
		},
		lifetime: {
			label: 'Emitter Lifetime',
			_folded: true,
			mode: new Input({
				type: 'select',
				label: 'Mode',
				info: '',
				mode_groups: ['emitter', 'lifetime'],
				options: {
					looping: 'Looping',
					once: 'Once',
					expression: 'Expression'
				},
				updatePreview: (m) => {Emitter.mode = m}
			}),
			active_time: new Input({
				label: 'Active Time',
				info: '',
				enabled_modes: ['looping', 'once'],
				value: 1,
				updatePreview: (v) => {Emitter.active_time = v}
			}),
			sleep_time: new Input({
				label: 'Sleep Time',
				info: 'emitter will pause emitting particles for this time per loop',
				enabled_modes: ['looping'],
				updatePreview: (v) => {Emitter.sleep_time = v}
			}),
			activation: new Input({
				label: 'Activation',
				info: 'When the expression is non-zero, the emitter will emit particles',
				enabled_modes: ['expression']
			}),
			expiration: new Input({
				label: 'Expiration',
				info: 'Emitter will expire if the expression is non-zero',
				enabled_modes: ['expression']
			})
		},
		shape: {
			label: 'Shape',
			_folded: true,
			mode: new Input({
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
				updatePreview: (m) => {Emitter.shape = m}
			}),
			offset: new Input({
				label: 'Offset',
				info: 'Specifies the offset from the emitter to emit each particle',
				axis_count: 3,
				enabled_modes: ['point', 'sphere', 'box', 'custom', 'disc']
			}),
			radius: new Input({
				label: 'Radius',
				info: 'Sphere or disc radius',
				enabled_modes: ['sphere', 'disc'],
			}),
			half_dimensions: new Input({
				label: 'Box Size',
				info: 'Half dimensions of the box formed around the emitter',
				axis_count: 3,
				enabled_modes: ['box'],
			}),
			plane_normal: new Input({
				label: 'Plane Normal',
				info: 'Specifies the normal of the disc plane, the disc will be perpendicular to this direction',
				axis_count: 3,
				enabled_modes: ['disc']
			}),
			surface_only: new Input({
				label: 'Surface Only',
				info: 'Emit only from the surface of the shape',
				type: 'checkbox',
				enabled_modes: ['sphere', 'box', 'entity_aabb', 'disc']
			})
		},
	},
	particle: {
		label: 'Particle',
		appearance: {
			label: 'Appearance',
			_folded: false,
			size: new Input({
				label: 'Size',
				info: 'Specifies the x/y size of the particle billboard.',
				axis_count: 2,
				value: [0.2, 0.2]
			}),
			facing_camera_mode: new Input({
				type: 'select',
				info: 'Modes to orient the particle billboards facing the camera',
				label: 'Facing',
				options: {
					rotate_xyz: 'Rotate XYZ',
					rotate_y: 'Rotate Y',
					lookat_xyz: 'Look at XYZ',
					lookat_y: 'Look at Y',
					direction_x: 'Direction X',
					direction_y: 'Direction Y',
					direction_z: 'Direction Z',
				},
			}),
		},
		direction: {
			label: 'Direction',
			_folded: true,
			mode: new Input({
				type: 'select',
				info: 'The direction of emitted particles in regards to the emitter shape',
				label: 'Mode',
				mode_groups: ['particle', 'direction'],
				options: {
					outwards: 'Outwards',
					inwards: 'Inwards',
					direction: 'Direction',
				},
			}),
			direction: new Input({
				label: 'Direction',
				info: 'The direction of emitted particles',
				axis_count: 3,
				enabled_modes: ['direction']
			})
		},
		motion: {
			label: 'Motion',
			_folded: true,
			mode: new Input({
				type: 'select',
				label: 'Mode',
				mode_groups: ['particle', 'motion'],
				options: {
					dynamic: 'Dynamic',
					parametric: 'Parametric',
				},
			}),
			linear_speed: new Input({
				label: 'Speed',
				info: 'Starts the particle with a specified speed, using the direction specified by the emitter shape',
				enabled_modes: ['dynamic'],
			}),
			linear_acceleration: new Input({
				label: 'Acceleration',
				info: 'The linear acceleration applied to the particle in blocks/sec/sec',
				axis_count: 3,
				enabled_modes: ['dynamic'],
			}),
			linear_drag_coefficient: new Input({
				label: 'Air Drag',
				info: 'Think of this as air-drag.  The higher the value, the more drag evaluated every frame.',
				enabled_modes: ['dynamic']
			}),
			relative_position: new Input({
				label: 'Offset',
				info: 'Directly set the position relative to the emitter',
				axis_count: 3,
				enabled_modes: ['parametric']
			}),
			direction: new Input({
				label: 'Direction',
				info: 'Directly set the 3d direction of the particle',
				axis_count: 3,
				enabled_modes: ['parametric']
			}),
		},
		rotation: {
			label: 'Rotation',
			_folded: true,
			mode: new Input({
				type: 'select',
				label: 'Mode',
				mode_groups: ['particle', 'rotation'],
				options: {
					dynamic: 'Dynamic',
					parametric: 'Parametric',
				},
			}),
			initial_rotation: new Input({
				label: 'Start Rotation',
				info: 'Specifies the initial rotation in degrees',
				enabled_modes: ['dynamic']
			}),
			rotation_rate: new Input({
				label: 'Speed',
				info: 'Specifies the spin rate in degrees/second',
				enabled_modes: ['dynamic']
			}),
			rotation_acceleration: new Input({
				label: 'Acceleration',
				info: 'Acceleration applied to the rotation speed of the particle in degrees/sec/sec.',
				enabled_modes: ['dynamic']
			}),
			rotation_drag_coefficient: new Input({
				label: 'Air Drag',
				info: 'Rotation resistance. Higher numbers will retard the rotation over time.',
				enabled_modes: ['dynamic']
			}),
			rotation: new Input({
				label: 'Rotation',
				info: 'Directly set the rotation of the particle',
				enabled_modes: ['parametric']
			}),
		},
		lifetime: {
			label: 'Lifetime',
			_folded: true,
			mode: new Input({
				type: 'select',
				label: 'Mode',
				mode_groups: ['particle', 'lifetime'],
				options: {
					time: 'Time',
					expression: 'Kill Expression',
				}
			}),
			max_lifetime: new Input({
				label: 'Max Age',
				info: 'Maximum age of the particle in seconds',
				value: 1,
				enabled_modes: ['time']
			}),
			expiration_expression: new Input({
				label: 'Kill Expression',
				info: 'This expression makes the particle expire when true (non-zero)',
				enabled_modes: ['expression']
			}),
			expire_in: new Input({
				label: 'Kill in Blocks',
				info: 'List of blocks to that let the particle expire on contact. Block IDs have a namespace and are separated by a space character.',
				placeholder: 'minecraft:stone',
				type: 'list'
			}),
			expire_outside: new Input({
				label: 'Only in Blocks',
				info: 'List of blocks outside of which the particle expires. Block IDs have a namespace and are separated by a space character.',
				placeholder: 'minecraft:air',
				type: 'list'
			}),
		},
		texture: {
			label: 'Texture',
			_folded: true,
			path: new Input({
				type: 'text',
				info: 'Path to the texture, starting from the texture pack. Example: textures/particle/snowflake',
				placeholder: 'textures/particle/particles',
				label: 'Texture',
				updatePreview: function() {
					updateMaterial()
				}
			}),
			image: new Input({
				type: 'image',
				updatePreview: function() {
					updateMaterial()
				}
			}),
			mode: new Input({
				type: 'select',
				label: 'UV Mode',
				mode_groups: ['particle', 'texture'],
				options: {
					static: 'Static',
					animated: 'Animated',
				},
			}),
			uv: new Input({
				label: 'UV Start',
				info: 'UV start coordinates',
				axis_count: 2,
				required: true,
				value: [0, 0]
			}),
			uv_size: new Input({
				label: 'UV Size',
				info: 'UV size coordinates',
				axis_count: 2,
				value: [16, 16]
			}),
			uv_step: new Input({
				label: 'UV Step',
				info: 'UV Offset per frame',
				axis_count: 2,
				enabled_modes: ['animated']
			}),
			frames_per_second: new Input({
				label: 'FPS',
				info: 'Animation frames per second',
				type: 'number',
				enabled_modes: ['animated']
			}),
			max_frame: new Input({
				label: 'Max Frame',
				info: 'Maximum amount of frames to draw from the flipbook',
				enabled_modes: ['animated']
			}),
			stretch_to_lifetime: new Input({
				label: 'Stretch To Lifetime',
				type: 'checkbox',
				enabled_modes: ['animated']
			}),
			loop: new Input({
				label: 'Loop',
				type: 'checkbox',
				enabled_modes: ['animated']
			}),
		},
		color: {
			label: 'Color & Light',
			_folded: true,
			mode: new Input({
				type: 'select',
				label: 'Color Mode',
				mode_groups: ['particle', 'color'],
				options: {
					static: 'Static',
					expression: 'Expression',
				},
			}),
			picker: new Input({
				label: 'Color',
				type: 'color',
				enabled_modes: ['static'],
				info: 'Set a static color for all emitted particles',
				updatePreview: (c) => {
					if (!c) return;
					System.material.color.copy(c)
				}
			}),
			expression: new Input({
				label: 'Color',
				info: 'Set the color per particle using MoLang expressions in RGB channels between 0 and 1',
				axis_count: 3,
				enabled_modes: ['expression']
			}),
			light: new Input({
				label: 'Lighting',
				type: 'checkbox',
			}),
		},
		collision: {
			label: 'Collision',
			_folded: true,
			enabled: new Input({
				label: 'Enabled',
				type: 'checkbox',
			}),
			collision_drag: new Input({
				label: 'Collision Drag',
				info: 'Alters the speed of the particle when it has collided',
				type: 'number',
			}),
			coefficient_of_restitution: new Input({
				label: 'Bounciness',
				info: 'Set to 0.0 to not bounce, 1.0 to bounce back up to original hight',
				type: 'number',
			}),
			collision_radius: new Input({
				label: 'Collision Radius',
				info: 'Used to minimize interpenetration of particles with the environment',
				max: 0.5,
				required: true,
				type: 'number',
			}),
			expire_on_contact: new Input({
				label: 'Expire On Contact',
				info: 'Removes the particle when it hits a block',
				type: 'checkbox',
			}),
		}
	}
};


function forEachInput(cb) {
	for (var k_subject in Data) {
		for (var k_group in Data[k_subject]) {
			var group = Data[k_subject][k_group]
			if (typeof group === 'object') {
				for (var key in group) {
					if (group[key] instanceof Input) {
						cb(group[key], key)
					}
				}
			}
		}
	}
}
//Setup Data
forEachInput(input => {
	if (input.type === 'select') {
		input.update()
	}
})

$(document).ready(function() {

	side_vue = new Vue({
		el: 'content#sidebar',
		components: {
			'color-picker': VueColor.Chrome,
		},
		data: {
			data: Data
		},
		methods: {
			fold: function(group) {
				group._folded = !group._folded
				if (group.curves && !group._folded) {
					updateCurvesPanel();
				}
			},
			addCurve() {
				Data.general.curves.curves.push(new Curve())
			}
		}
	})
})
