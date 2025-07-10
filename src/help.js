export default {
	general: {
		title: 'General',
		pages: {
			overview: {
				title: 'Introduction',
				text: [
					'Snowstorm is a tool to visually create and edit particles for Minecraft: Bedrock Edition.',
					{type: 'h2', text: 'Documentation'},
					{type: 'link', text: 'Introduction to Particles', href: 'https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlesintroduction'},
					{type: 'link', text: 'Introduction to Snowstorm', href: 'https://learn.microsoft.com/en-us/minecraft/creator/documents/particleeffects'},
					{type: 'link', text: 'Particle Component List', href: 'https://learn.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/particlecomponentlist'},
					{type: 'h2', text: 'Tutorials'},
					{type: 'link', text: '"How to use Snowstorm to create particle effects" by McHorse', href: 'https://youtu.be/J1Ub1tbO9gg'},
					{type: 'h2', text: 'Links'},
					{type: 'link', text: 'Snowstorm Discord Server', href: 'https://discord.gg/W9d78Z8AvM'},
				]
			},
			molang: {
				title: 'Molang Reference',
				text: [
					'Molang is a C-like scripting value that can be used to dynamically calculate values for particle attributes. It is supported for most numeric values in Snowstorm.',
            		{type: 'link', href: 'https://docs.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/molangintroduction', text: 'Full Molang Documentation'},
					'This page acts as a reference sheet and lists all built-in variables and math functions.',
					'Note that Molang calculates all angles in degrees.',

					{type: 'h2', text: 'Variables'},

                	{type: 'code', code: 'variable.emitter_lifetime', text: 'Lifetime of the emitter'},
                	{type: 'code', code: 'variable.emitter_age', text: 'Age of the emitter'},
                	{type: 'code', code: 'variable.emitter_random_1', text: 'Random number between 0 and 1, constant per emitter loop'},
                	{type: 'code', code: 'variable.emitter_random_2', text: 'Random number'},
                	{type: 'code', code: 'variable.emitter_random_3', text: 'Random number'},
                	{type: 'code', code: 'variable.emitter_random_4', text: 'Random number'},
                	{type: 'code', code: 'variable.particle_lifetime', text: 'Lifetime of the particle'},
                	{type: 'code', code: 'variable.particle_age', text: 'Age of the particle'},
                	{type: 'code', code: 'variable.particle_random_1', text: 'Random number between 0 and 1, constant per particle'},
                	{type: 'code', code: 'variable.particle_random_2', text: 'Random number'},
                	{type: 'code', code: 'variable.particle_random_3', text: 'Random number'},
                	{type: 'code', code: 'variable.particle_random_4', text: 'Random number'},
                	{type: 'code', code: 'variable.entity_scale', text: 'Scale of the attached entity'},

					{type: 'h2', text: 'Math Operations'},
			
            		{type: 'code', code: 'math.abs(value)', text: 'Absolute value of value'},
            		{type: 'code', code: 'math.sin(value)', text: 'Sine (in degrees) of value'},
            		{type: 'code', code: 'math.cos(value)', text: 'Cosine (in degrees) of value'},
            		{type: 'code', code: 'math.clamp(value, min, max)', text: 'Clamp value to between min and max inclusive'},
            		{type: 'code', code: 'math.ceil(value)', text: 'Round value up to nearest integral number'},
            		{type: 'code', code: 'math.floor(value)', text: 'Round value down to nearest integral number'},
            		{type: 'code', code: 'math.trunc(value)', text: 'Round value towards zero'},
            		{type: 'code', code: 'math.round(value)', text: 'Round value to nearest integral number'},
            		{type: 'code', code: 'math.mod(value, denominator)', text: 'Return the remainder of value / denominator'},
            		{type: 'code', code: 'math.pow(base, exponent)', text: 'Elevates `base` to the `exponent`\'th power'},
            		{type: 'code', code: 'math.sqrt(value)', text: 'Square root of value'},
            		{type: 'code', code: 'math.exp(value)', text: 'Calculates e to the value\'th power'},
            		{type: 'code', code: 'math.pi', text: 'Returns the float representation of the constant pi.'},
            		{type: 'code', code: 'math.max(A, B)', text: 'Return highest value of A or B'},
            		{type: 'code', code: 'math.min(A, B)', text: 'Return lowest value of A or B'},
            		{type: 'code', code: 'math.asin(value)', text: 'Arcsin of value'},
            		{type: 'code', code: 'math.acos(value)', text: 'Arccos of value'},
            		{type: 'code', code: 'math.atan(value)', text: 'Arctan of value'},
            		{type: 'code', code: 'math.atan2(y, x)', text: 'Arctan of y/x. NOTE: the order of arguments!'},
            		{type: 'code', code: 'math.random(low, high)', text: 'Random value between low and high inclusive'},
            		{type: 'code', code: 'math.random_integer(low, high)', text: 'Random integer value between low and high inclusive'},
            		{type: 'code', code: 'math.die_roll(num, low, high)', text: 'Returns the sum of \'num\' random numbers, each with a value from low to high. Note: the generated random numbers are not integers like normal dice. For that, use `math.die_roll_integer`.'},
            		{type: 'code', code: 'math.die_roll_integer(num, low, high)', text: 'Returns the sum of \num\ random integer numbers, each with a value from low to high. Note: the generated random numbers are integers like normal dice.'},
            		{type: 'code', code: 'math.hermite_blend(value)', text: 'Useful for simple smooth curve interpolation using one of the Hermite Basis functions: `3t^2 - 2t^3`. Note that while any valid float is a valid input, this function works best in the range [0,1].'},
            		{type: 'code', code: 'math.lerp(start, end, 0_to_1)', text: 'Lerp from start to end via 0_to_1'},
            		{type: 'code', code: 'math.lerprotate(start, end, 0_to_1)', text: 'Lerp the shortest direction around a circle from start degrees to end degrees via 0_to_1'},
            		{type: 'code', code: 'math.ln(value)', text: 'Natural logarithm of value'},
				]
			}
		}
	},
	effect: {
		title: 'File',
		pages: {
			meta: {
				title: 'File',
				inputs: {
					identifier: {
						type: 'text',
						text: [
							'An identifier consists of two parts: The project namespace, and the particle name. The namespace is always separated by a colon',
							'The identifier should be all in lower-case letters and use underscores to separate words. Letters from a-z, numbers, points and underscores are allowed, other characters may cause issues.',
							'Example: snowstorm:fire',
							'The identifier can be used in-game to reference the particle effect, for example in particle commands, scripts, or entities.'
						]
					},
				}
			},
			space: {
				title: 'Space',
				inputs: {
					local_position: {
						type: 'toggle',
						display_input_info: false,
						text: [
							'When enabled, the particle will always move in local space relative to the emitter. When attached to an entity, this means that all particles will move along with the entity.',
							'When disabled, particles are emitted relative to the emitter, then simulate independently from the emitter in the world',
							'Enabling this will prevent collisions with the world from working.',
						]
					},
					local_rotation: {
						type: 'toggle',
						display_input_info: false,
						text: [
							'Rotate the local space along with the entity that it is attached to. See Local Position',
							'Local position needs to be enabled for local rotation to work',
						]
					},
					local_velocity: {
						type: 'toggle',
					}
				}
			}
		}
	},
	emitter: {
		title: 'Emitter',
		pages: {
			rate: {
				title: 'Spawn Amount',
				text: [],
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Steady'},
							'Particles are spawned steadily during the lifetime of the emitter',
							{type: 'h3', text: 'Instant'},
							'All particles are spawned instantly at the start of the emitter\'s lifetime',
							{type: 'h3', text: 'Manual'},
							'Particles are spawned manually, independent from the emitter. This is used for some vanilla effects, and for particle effects that are triggered by events using the "particle" type.'
						]
					},
					rate: {
						type: 'molang',
						evaluation: 'per_tick'
					},
					amount: {
						type: 'molang',
						evaluation: 'once'
					},
					maximum: {
						type: 'molang',
						evaluation: 'per_tick'
					},
				}
			},
			lifetime: {
				title: 'Emitter Lifetime',
				text: 'Control how long the emitter lasts and whether it should loop.',
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Looping'},
							'Emitter will loop until it is removed.',
							{type: 'h3', text: 'Once'},
							'Emitter will execute once, and once the lifetime ends or the number of particles allowed to emit have emitted, the emitter expires.',
							{type: 'h3', text: 'Expression'},
							'Emitter will turn "on" when the activation expression is non-zero, and will turn "off" when it\'s zero. This is useful for situations like driving an entity-attached emitter from an entity variable.'
						]
					},
					active_time: {
						type: 'molang',
						evaluation: 'per_loop'
					},
					sleep_time: {
						type: 'molang',
						evaluation: 'per_loop'
					},
					activation: {
						type: 'molang',
						evaluation: 'per_tick'
					},
					expiration: {
						type: 'molang',
						evaluation: 'per_tick'
					},
				}
			},
			shape: {
				title: 'Spawn Shape',
				text: 'Control at which position and in which shape particles are spawned.',
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Point'},
							'Emit particles at a single point at the position of the emitter.',
							{type: 'h3', text: 'Sphere'},
							'Emit particle in a spherical shape.',
							{type: 'h3', text: 'Box'},
							'Emit particles in a box shape',
							{type: 'h3', text: 'Disc'},
							'Emit particles in a disc shape.',
							{type: 'h3', text: 'Entity Bounding Box'},
							'Emit particles in a box which size adapts to the collision box of the entity that the particle is played on. Only works on particles that are played client-side.',
						]
					},
					offset: {
						type: 'molang',
						evaluation: 'once',
						context: 'particle'
					},
					radius: {
						type: 'molang',
						evaluation: 'once',
						context: 'particle'
					},
					half_dimensions: {
						type: 'molang',
						evaluation: 'once',
						context: 'particle'
					},
					plane_normal: {
						type: 'molang',
						evaluation: 'once',
						context: 'particle'
					},
					surface_only: {
						type: 'toggle',
					},
				}
			}
		}
	},
	motion: {
		title: 'Motion',
		overview: [

		],
		pages: {
			motion: {
				title: 'Motion',
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Dynamic'},
							'The particle moves dynamically, based on initial speed, acceleration, and drag.',
							{type: 'h3', text: 'Parametric'},
							'The particle position is calculated each tick using the offset vector. Note: This only works in local space and does not support collisions and block tests.',
							{type: 'h3', text: 'Static'},
							'The particle does not move.',
						]
					},
					direction_mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Outwards'},
							'Particle direction is set to move away from the emitter',
							{type: 'h3', text: 'Inwards'},
							'Particle direction is set to move towards the emitter',
							{type: 'h3', text: 'Custom'},
							'Set a custom direction vector in the direction field'
						]
					},
					direction: {
						type: 'molang',
						context: 'particle',
						evaluation: 'once'
					},
					linear_speed: {
						type: 'molang',
						context: 'particle',
						evaluation: 'once'
					},
					linear_acceleration: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
					linear_drag_coefficient: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
						text: [
							'Drag slows the particle down over time. You can also use negative values to accelerate the particle over time.'
						]
					},
					relative_position: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
					relative_direction: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
				}
			},
			rotation: {
				title: 'Rotation',
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Dynamic'},
							'The particle rotates dynamically, based on initial speed, acceleration, and drag.',
							{type: 'h3', text: 'Parametric'},
							'The particle rotation is calculated each tick from a Molang expression.',
						]
					},
					initial_rotation: {
						type: 'molang',
						context: 'particle',
						evaluation: 'once',
					},
					rotation_rate: {
						type: 'molang',
						context: 'particle',
						evaluation: 'once',
					},
					rotation_acceleration: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					rotation_drag_coefficient: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					rotation: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
						text: 'This is used for parametric rotation.'
					},
				}
			},
			collision: {
				title: 'Collision',
				text: [
					'Enable collision to allow particles to collide with blocks in your world.',
					'Collision only works if the particles are moving in world space and are using dynamic motion.',
					'On collision, particles can be set to bounce back, or to expire on contact. It is also possible to execute events.',
					'For preview inside Snowstorm, particles collide with the ground plane that is visualized by the grid. This can be turned on or off using the Preview Collisions button in the toolbar below the viewport.'
				],
				inputs: {
					toggle: {
						type: 'toggle',
					},
					collision_radius: {
						type: 'number',
					},
					collision_drag: {
						type: 'number',
						text: [
							'Useful for emulating friction/drag when colliding, e.g a particle that hits the ground would slow to a stop.',
							'The particle is slowed down by the drag amount in blocks/sec.'
						]
					},
					coefficient_of_restitution: {
						type: 'number',
						text: [
							'Also known as the coefficient of restitution.'
						]
					},
					condition: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
					events: {
						type: 'event_trigger'
					},
					expire_on_contact: {
						type: 'toggle',
					},
				}
			}
		}
	},
	appearance: {
		title: 'Appearance',
		pages: {
			appearance: {
				title: 'Appearance',
				inputs: {
					size: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					material: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Alpha Test'},
							'Alpha test materials allow opaque and transparent pixels, but no in-between.',
							{type: 'h3', text: 'Blend'},
							'Blend supports partial transparency in pixels. Note that with this material, particles of different colors, even from different effect, can cause visual flickering in-game when viewed behind each other.',
							{type: 'h3', text: 'Additive'},
							'Partial transparency is supported. Particles are rendered additive blending. This is ideal for creating light effects.',
							{type: 'h3', text: 'Opaque'},
							'The particle is fully opaque, no transparent pixels are supported.',
							{type: 'h3', text: 'Custom:'},
							'Enter a custom material identifier.',
						]
					},
					facing_camera_mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Rotate XYZ'},
							'Rotate the particle to be parallel with the camera on all axes.',
							{type: 'h3', text: 'Rotate Y'},
							'Rotate the particle to be parallel with the camera on all the Y axis.',
							{type: 'h3', text: 'Look at XYZ'},
							'Rotate the particle to point at the camera on all axes.',
							{type: 'h3', text: 'Look at Y'},
							'Rotate the particle to point at the camera on the Y axis.',
							{type: 'h3', text: 'Look at Direction'},
							'Rotate the particle to point at the camera around the axis of its own direction vector.',
							{type: 'h3', text: 'Direction X'},
							'Rotate the particle to face towards the X direction of its own direction vector.',
							{type: 'h3', text: 'Direction Y'},
							'Rotate the particle to face towards the Y direction of its own direction vector.',
							{type: 'h3', text: 'Direction Z'},
							'Rotate the particle to face towards the Z direction of its own direction vector.',
							{type: 'h3', text: 'Emitter XY-Plane'},
							'Rotate the particle along the XY-plane of the emitter',
							{type: 'h3', text: 'Emitter XZ-Plane'},
							'Rotate the particle along the XZ-plane of the emitter',
							{type: 'h3', text: 'Emitter YZ-Plane'},
							'Rotate the particle along the YZ-plane of the emitter',
						]
					},
					direction_mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'From Motion'},
							'Derive the direction of the particle from its motion vector if the speed of the particle is above a custom threshold.',
							{type: 'h3', text: 'Custom'},
							'Set a custom direction vector.',
						]
					},
					speed_threshold: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					direction: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					light: {
						type: 'toggle',
					},
				}
			},
			color: {
				title: 'Color',
				text: [
					'Tint the particles using specific colors. Transparency is supported if the material supports blending.',
					'Colors are applied via multiplication, which means a white texture is the ideal base for tinting.'
				],
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Static'},
							'Set a static color to tint the particle.',
							{type: 'h3', text: 'Gradient'},
							'Determine the color of the particle using a gradient.',
							{type: 'h3', text: 'Expression'},
							'Calculate the tint color using an expression for each RGBA color channel.',
						]
					},
					picker: {
						type: 'color',
					},
					interpolant: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
						text: [
							'Example: At a range of 1, the expression "variable.particle_age / variable.particle_lifetime" will map the gradient along the lifetime of the particle.'
						]
					},
					range: {
						type: 'number',
					},
					gradient: {
						type: 'color',
					},
					expression: {
						label: 'Color Expression',
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
				}
			},
		}
	},
	texture: {
		title: 'Texture & UV',
		pages: {
			texture: {
				title: 'Texture',
				inputs: {
					path: {
						type: 'text',
						text: [
							'The path should always use forward slashes, and should not include the file extension.'
						]
					},
					image: {
						type: 'image',
						label: 'Image',
						text: [
							'In VS Code, the image gets loaded from the provided texture path automatically. To use this, ensure that you open the entire texture pack folder as a project in VSCode, not just the individual particle file.',
							'In the web app, you need to upload your PNG file to preview it, unless you are using one of the included vanilla particle files.',
							'Painting on the texture is supported using the provided editing tools.'
						]
					}
				}
			},
			uv: {
				title: 'UV',
				text: 'UV mapping determines which part of the texture gets mapped onto the particle billboard. UV mapping is also responsible for creating animated textures.',
				inputs: {
					mode: {
						type: 'select',
						text: [
							{type: 'h3', text: 'Static'},
							'Set a static UV map, optionally with Molang expressions.',
							{type: 'h3', text: 'Full Size'},
							'Set the UV map to the full size of the texture.',
							{type: 'h3', text: 'Animated'},
							'Create a UV map with flipbook texture animations.',
						]
					},
					size: {
						type: 'number',
						text: 'This size is used to set a base size for the UV map. This does not have to be identical to the actual texture resolution, but the aspect ratio should match.'
					},
					uv: {
						type: 'number',
						context: 'particle',
						evaluation: 'per_tick',
					},
					uv_size: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					uv_step: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					frames_per_second: {
						type: 'number',
					},
					max_frame: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick',
					},
					stretch_to_lifetime: {
						type: 'toggle',
					},
					loop: {
						type: 'toggle',
					},
				}
			},
		}
	},
	lifetime: {
		title: 'Time',
		pages: {
			lifetime: {
				title: 'Particle Lifetime',
				inputs: {
					max_lifetime: {
						type: 'molang',
						context: 'particle',
						evaluation: 'once',
						text: [
							'This will set the particle_lifetime variable on the particle, and once the particle_age reaches the lifetime, the particle will expire.'
						]
					},
					expiration_expression: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
					kill_plane: {
						type: 'number'
					},
					expire_in: {
						type: 'list'
					},
					expire_outside: {
						type: 'list'
					},
				}
			},
		}
	},
	events: {
		title: 'Events',
		pages: {
			events: {
				title: 'Events',
				text: [
					'Create events that can be triggered from the emitter or a particle. Events can be used to trigger additional particle effects, play sounds, or run Molang expressions.',
					'Events can be created with event subparts, which can be randomized or played in sequence. Subparts can be nested.',
					{type: 'h2', text: 'Sequence'},
					'A sequence can be used to trigger multiple event subparts after one another.',
					{type: 'h2', text: 'Randomize'},
					'Randomly picks one of the subparts of the randomized list. Subparts can be weighted using the Weight field. The higher the weight, the more likely it is that the option will be selected.',
					'You can leave a random subpart empty to add a chance that nothing happens.',

					{type: 'h2', text: 'Particle'},
					'Trigger a new particle effect at the location where the event was fired.',
					{
						type: 'input_list',
						inputs: {
							identifier: {
								type: 'text',
								label: 'Identifier',
								text: [
									'Enter the identifier of the particle effect to trigger.',
								]
							},
							type: {
								type: 'select',
								label: 'Type',
								text: 'Select how the particle effect is played.',
								text: [
									{type: 'h3', text: 'Emitter'},
									'Create an emitter of the specified particle effect at the event\'s world location.',
									{type: 'h3', text: 'Emitter Bound'},
									'Create an emitter of the specified particle effect at the event\'s location. If the firing emitter is bound to an entity or locator, the new emitter will be bound to the same entity or locator.',
									{type: 'h3', text: 'Particle'},
									'Manually emit a particle on an emitter of the specified type at the event location, creating the emitter if it doesn\'t already exist.',
									'Make sure to use the Spawn Amount mode "Manual" on the child particle effect.',
									{type: 'h3', text: 'Particle with Velocity'},
									'The same as "Particle" except the new particle will inherit the spawning particle\'s velocity.',
								]
							},
							expression: {
								label: 'Expression',
								type: 'molang',
								context: 'spawned_emitter',
								evaluation: 'once',
								text: [
									'A Molang expression to run on the newly spawned emitter. Note that you do not have access to the variable scope of the event firing emitter.'
								]
							}
						}
					},

					{type: 'h2', text: 'Sound'},
					'Play a sound effect at the location where the event was fired.',
					{
						type: 'input_list',
						inputs: {
							identifier: {
								type: 'text',
								label: 'Sound Event',
								text: [
									'Enter the identifier of the sound effect to trigger. Only vanilla sound events are supported due to a Minecraft bug.',
								]
							}
						}
					},

					{type: 'h2', text: 'Expression'},
					'Run a molang expression on the emitter that fired the event. This can be used to change the value or variables.',
					{
						type: 'input_list',
						inputs: {
							expression: {
								label: 'Expression',
								type: 'molang',
								context: 'emitter',
								evaluation: 'once',
								text: [
									'A Molang expression to run on the firing emitter.'
								]
							}
						}
					},
				],
				inputs: {
				}
			},
			emitter_events: {
				title: 'Emitter Event Triggers',
				text: [
					'Fire events on the emitter at certain points during its lifetime.'
				],
				inputs: {
					creation: {
						type: 'event_trigger'
					},
					expiration: {
						type: 'event_trigger'
					},
					travel_distance: {
						type: 'event_trigger'
					},
					looping_travel_distance: {
						type: 'event_trigger'
					},
					timeline: {
						type: 'event_trigger'
					},
				}
			},
			particle_events: {
				title: 'Particle Event Triggers',
				text: [
					'Fire events on particles at certain points during their lifetime.'
				],
				inputs: {
					creation: {
						type: 'event_trigger'
					},
					expiration: {
						type: 'event_trigger'
					},
					timeline: {
						type: 'event_trigger'
					},
				}
			},
		}
	},
	variables: {
		title: 'Variables & Curves',
		pages: {
			variables: {
				title: 'Variables',
				inputs: {
					creation_vars: {
						type: 'molang',
						context: 'emitter',
						evaluation: 'once'
					},
					tick_vars: {
						type: 'molang',
						context: 'emitter',
						evaluation: 'per_tick'
					},
					particle_update: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_tick'
					},
					particle_render: {
						type: 'molang',
						context: 'particle',
						evaluation: 'per_render'
					},
				}
			},
			curves: {
				title: 'Curves',
				text: [
					'Curves are a method of mapping an output to a value using a curve.',
					'For example, you can create a curve that is mapped to the lifetime of a particle. You can then reference the curve in the particle size fields to animate the size of the particle using the curve.',
					'Curves can be accessed multiple times and can be used both in the emitter and particle context, as long as the variables used in Input and Range are available.'
				],
				inputs: {
					id: {
						label: 'Name',
						type: 'text',
						text: 'The Molang variable to be used later in Molang expressions. Must begin with "variable.".',
					},
					mode: {
						type: 'select',
						label: 'Mode',
						info: 'Curve interpolation type',
						text: [
							{type: 'h3', text: 'Catmull Rom'},
							'A smooth curve along 4 or more control points. The first and last point are just for controlling, and are not part of the curve.',
							{type: 'h3', text: 'Linear'},
							'A linear curve along 3 or more control points.',
							{type: 'h3', text: 'Bézier'},
							'A single bezier curve, using a start and end point and two control points.',
							{type: 'h3', text: 'Bézier Chain'},
							'A chain of individual bezier curves to make up a larger curve.',
						]
					},
					input: {
						type: 'molang',
						context: 'curve',
						evaluation: 'per_use',
						label: 'Input',
						text: [
							'Horizontal input',
						]
					},
					range: {
						type: 'molang',
						context: 'curve',
						evaluation: 'per_use',
						label: 'Range',
						text: [
							'Horizontal range that the input is mapped to',
						]
					},
				}
			},
		}
	},
}