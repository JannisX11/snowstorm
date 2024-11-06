export default {
	general: {
		title: 'General',
		pages: {
			overview: {
				title: 'Introduction',
				text: [
					
				]
			},
			molang: {
				title: 'MoLang Reference',
				text: [
					
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

            		{type: 'html', content: '<a href="https://docs.microsoft.com/en-us/minecraft/creator/reference/content/molangreference/examples/molangconcepts/molangintroduction" target="_blank" style="margin-top: 12px; display: block;">Full MoLang Documentation</a>'},
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
							'Example: `snowstorm:fire`',
							'The identifier can be used in-game to reference the particle effect, for example in particle commands, scripts, or entities.'
						]
					},
				}
			},
			space: {
				title: 'Space',
				inputs: {
					local_space: {
						text: [
							'When enabled, the particle will always move in local space relative to the emitter. When attached to an entity, this means that all particles will move along with the entity.',
							'When disabled, particles are emitted relative to the emitter, then simulate independently from the emitter in the world',
							'Enabling this will prevent collisions with the world from working.',
						]
					},
					local_rotation: {
						text: [
							'Rotate the local space along with the entity that it is attached to. See #setup.local_space',
							'Local position needs to be enabled for local rotation to work',
						]
					},
					local_velocity: {
						text: 'When enabled, the velocity of the emitter will be added to the particles velocity.'
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
						text: [
							{type: 'h3', text: 'Steady'},
							'Particles are spawned steadily over the lifetime of the emitter',
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
						evaluation: 'per_tick'
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
					},
					active_time: {
						type: 'molang',
						evaluation: 'per_tick'
					},
					sleep_time: {
						type: 'molang',
						evaluation: 'per_tick'
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
					offset: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					radius: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					half_dimensions: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					plane_normal: {
						type: 'molang',
						evaluation: 'per_particle'
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
						type: 'molang',
						evaluation: 'per_particle'
					},
					direction_mode: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					direction: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					linear_speed: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					linear_acceleration: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					linear_drag_coefficient: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					relative_position: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					relative_direction: {
						type: 'molang',
						evaluation: 'per_particle'
					},
				}
			},
			rotation: {
				title: 'Rotation',
				inputs: {
					mode: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					initial_rotation: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					rotation_rate: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					rotation_acceleration: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					rotation_drag_coefficient: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					rotation: {
						type: 'molang',
						evaluation: 'per_particle'
					},
				}
			},
			collision: {
				title: 'Collision',
				inputs: {
					toggle: {
						type: 'toggle',
					},
					collision_radius: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					collision_drag: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					coefficient_of_restitution: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					condition: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					events: {
						type: 'molang',
						evaluation: 'per_particle'
					},
					expire_on_contact: {
						type: 'molang',
						evaluation: 'per_particle'
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
				inputs: {}
			},
			color: {
				title: 'Color',
				inputs: {}
			},
		}
	},
	texture: {
		title: 'Texture & UV',
		pages: {
			texture: {
				title: 'Texture',
				inputs: {}
			},
			uv: {
				title: 'UV',
				inputs: {}
			},
		}
	},
	lifetime: {
		title: 'Time',
		pages: {
			lifetime: {
				title: 'Particle Lifetime',
				inputs: {}
			},
		}
	},
	variables: {
		title: 'Variables',
		pages: {
			
		}
	},
	events: {
		title: 'Events',
		pages: {
			events: {
				title: 'Events',
				inputs: {}
			},
			emitter_events: {
				title: 'Emitter Event Triggers',
				inputs: {}
			},
			particle_events: {
				title: 'Particle Event Triggers',
				inputs: {}
			},
		}
	},
	variables: {
		title: 'Variables & Curves',
		pages: {
			variables: {
				title: 'Variables',
				inputs: {}
			},
			curves: {
				title: 'Curves',
				inputs: {}
			},
		}
	},
}