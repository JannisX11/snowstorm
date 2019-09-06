function loadFile(data) {

	if (data && data.particle_effect && startNewProject()) {

		

		var comps = data.particle_effect.components;
		var desc = data.particle_effect.description;
		if (desc && desc.identifier) {
			Data.general.general.identifier.set(desc.identifier)
		}
		if (desc && desc.basic_render_parameters) {
			Data.particle.texture.path.set(desc.basic_render_parameters.texture)
		}

		if (comps) {
			function comp(id) {
				return comps[`minecraft:${id}`]
			}
			if (comp('emitter_initialization')) {
				var cr_v = comp('emitter_initialization').creation_expression;
				var up_v = comp('emitter_initialization').per_update_expression;
				if (typeof cr_v == 'string') {
					Data.general.variables.creation_vars.set(cr_v.replace(/;+$/, '').split(';'))
				}
				if (typeof up_v == 'string') {
					Data.general.variables.tick_vars.set(up_v.replace(/;+$/, '').split(';'))
				}
			}
			if (comp('emitter_local_space')) {
				Data.general.position.local_position.set(comp('emitter_local_space').position)
				Data.general.position.local_rotation.set(comp('emitter_local_space').rotation)
			}
			if (comp('emitter_rate_steady')) {
				Data.emitter.rate.mode.set('steady')
				Data.emitter.rate.rate.set(comp('emitter_rate_steady').spawn_rate)
				Data.emitter.rate.maximum.set(comp('emitter_rate_steady').max_particles)
			}
			if (comp('emitter_rate_instant')) {
				Data.emitter.rate.mode.set('instant')
				Data.emitter.rate.amount.set(comp('emitter_rate_instant').num_particles)
			}
			if (comp('emitter_lifetime_once')) {
				Data.emitter.lifetime.mode.set('once')
				Data.emitter.lifetime.active_time.set(comp('emitter_lifetime_once').active_time)
			}
			if (comp('emitter_lifetime_looping')) {
				Data.emitter.lifetime.mode.set('looping')
				Data.emitter.lifetime.active_time.set(comp('emitter_lifetime_looping').active_time)
				Data.emitter.lifetime.sleep_time.set(comp('emitter_lifetime_looping').sleep_time)
			}
			if (comp('emitter_lifetime_expression')) {
				Data.emitter.lifetime.mode.set('expression')
				Data.emitter.lifetime.activation.set(comp('emitter_lifetime_expression').activation_expression)
				Data.emitter.lifetime.expiration.set(comp('emitter_lifetime_expression').expiration_expression)
			}
			var shape_component = comp('emitter_shape_point') || comp('emitter_shape_custom');
			if (shape_component) {
				Data.emitter.shape.mode.set('point')
				Data.emitter.shape.offset.set(shape_component.offset)
			}
			if (comp('emitter_shape_sphere')) {
				shape_component = comp('emitter_shape_sphere');
				Data.emitter.shape.mode.set('sphere')
				Data.emitter.shape.offset.set(shape_component.offset)
				Data.emitter.shape.radius.set(shape_component.radius)
				Data.emitter.shape.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_box')) {
				shape_component = comp('emitter_shape_box');
				Data.emitter.shape.mode.set('box')
				Data.emitter.shape.offset.set(shape_component.offset)
				Data.emitter.shape.half_dimensions.set(shape_component.half_dimensions)
				Data.emitter.shape.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_disc')) {
				shape_component = comp('emitter_shape_disc');
				Data.emitter.shape.mode.set('disc')
				Data.emitter.shape.offset.set(shape_component.offset)
				Data.emitter.shape.plane_normal.set(shape_component.plane_normal)
				Data.emitter.shape.radius.set(shape_component.radius)
				Data.emitter.shape.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_entity_aabb')) {
				Data.emitter.shape.mode.set('entity_aabb')
				Data.emitter.shape.surface_only.set(comp('emitter_shape_entity_aabb').surface_only)
				shape_component = comp('emitter_shape_entity_aabb');
			}
			if (shape_component && shape_component.direction) {
				if (shape_component.direction == 'inwards' || shape_component.direction == 'outwards') {
					Data.particle.direction.mode.set(shape_component.direction)
				} else {
					Data.particle.direction.mode.set('direction')
					Data.particle.direction.direction.set(shape_component.direction)
				}
			}

			if (comp('particle_initial_spin')) {
				Data.particle.rotation.initial_rotation.set(comp('particle_initial_spin').rotation)
				Data.particle.rotation.rotation_rate.set(comp('particle_initial_spin').rotation_rate)
			}
			if (comp('particle_initial_speed')) {
				var c = comp('particle_initial_speed')
				if (typeof c !== 'object') {
					Data.particle.motion.linear_speed.set(c)
				} else {
					Data.particle.direction.mode.set('direction')
					Data.particle.direction.direction.set(comp('particle_initial_speed'))
					Data.particle.motion.linear_speed.set(1)
				}
			}

			if (comp('particle_motion_dynamic')) {
				Data.particle.motion.mode.set('dynamic')
				Data.particle.motion.linear_acceleration.set(comp('particle_motion_dynamic').linear_acceleration)
				Data.particle.motion.linear_drag_coefficient.set(comp('particle_motion_dynamic').linear_drag_coefficient)
				Data.particle.rotation.rotation_acceleration.set(comp('particle_motion_dynamic').rotation_acceleration)
				Data.particle.rotation.rotation_drag_coefficient.set(comp('particle_motion_dynamic').rotation_drag_coefficient)
			}
			if (comp('particle_motion_parametric')) {
				Data.particle.motion.mode.set('parametric')
				Data.particle.motion.relative_position.set(comp('particle_motion_parametric').relative_position)
				Data.particle.motion.direction.set(comp('particle_motion_parametric').direction)
				Data.particle.rotation.rotation.set(comp('particle_motion_parametric').rotation)
			}
			if (comp('particle_motion_collision')) {
				Data.particle.collision.collision_drag.set(comp('particle_motion_collision').collision_drag)
				Data.particle.collision.coefficient_of_restitution.set(comp('particle_motion_collision').coefficient_of_restitution)
				Data.particle.collision.collision_radius.set(comp('particle_motion_collision').collision_radius)
				Data.particle.collision.expire_on_contact.set(comp('particle_motion_collision').expire_on_contact)
			}

			if (comp('particle_lifetime_expression')) {
				Data.particle.lifetime.mode.set('expression')
				if (comp('particle_lifetime_expression').expiration_expression) {
					Data.particle.lifetime.mode.set('expression')
					Data.particle.lifetime.expiration_expression.set(comp('particle_lifetime_expression').expiration_expression)
				} else {
					Data.particle.lifetime.mode.set('time')
					Data.particle.lifetime.max_lifetime.set(comp('particle_lifetime_expression').max_lifetime)
				}
			}
			if (comp('particle_expire_if_in_blocks') instanceof Array) {
				Data.particle.lifetime.expire_in.set(comp('particle_expire_if_in_blocks'))
			}
			if (comp('particle_expire_if_not_in_blocks') instanceof Array) {
				Data.particle.lifetime.expire_outside.set(comp('particle_expire_if_not_in_blocks'))
			}
			
			if (comp('particle_appearance_billboard')) {
				Data.particle.appearance.size.set(comp('particle_appearance_billboard').size)
				Data.particle.appearance.facing_camera_mode.set(comp('particle_appearance_billboard').facing_camera_mode)
				var uv_tag = comp('particle_appearance_billboard').uv;
				if (uv_tag) {
					if (uv_tag.texture_width) Flipbook.width = uv_tag.texture_width;
					if (uv_tag.texture_height) Flipbook.height = uv_tag.texture_height;
					if (uv_tag.flipbook) {
						Data.particle.texture.mode.set('animated')
						Data.particle.texture.uv.set(uv_tag.flipbook.base_UV)
						Data.particle.texture.uv_size.set(uv_tag.flipbook.size_UV)
						Data.particle.texture.uv_step.set(uv_tag.flipbook.step_UV)
						Data.particle.texture.frames_per_second.set(uv_tag.flipbook.frames_per_second)
						Data.particle.texture.max_frame.set(uv_tag.flipbook.max_frame)
						Data.particle.texture.stretch_to_lifetime.set(uv_tag.flipbook.stretch_to_lifetime)
						Data.particle.texture.loop.set(uv_tag.flipbook.loop)
					} else {
						Data.particle.texture.mode.set('static')
						Data.particle.texture.uv.set(uv_tag.uv)
						Data.particle.texture.uv_size.set(uv_tag.uv_size)
					}
				}
			}
			if (comp('particle_appearance_lighting')) {
				Data.particle.color.light.set(true)
			}
			if (comp('particle_appearance_tinting')) {
				var c = comp('particle_appearance_tinting').color
				if (c instanceof Array && c.length >= 3) {

					if ((typeof c[0] + typeof c[1] + typeof c[1]).includes('string')) {
						Data.particle.color.mode.set('expression')
						Data.particle.color.expression.set(c)

					} else {
						Data.particle.color.mode.set('static')
						var color = {
							r: Molang.parse(c[0])*255,
							g: Molang.parse(c[1])*255,
							b: Molang.parse(c[2])*255
						}
						Data.particle.color.picker.set(color)
					}
				}
			}
		}
		if (Data.particle.texture.path.value) {
			updateMaterial(startAnimation)
		} else {
			startAnimation()
		}
	}
}
function startNewProject() {
	if (confirm('This action may clear your current work. Do you want to continue?')) {
		forEachInput(input => {
			input.reset()
		})
		updateMaterial(startAnimation)
		return true;
	}
}

function importFile() {
	IO.import({
		extensions: ['json']
	}, (files) => {
		if (files[0]) {
			loadFile(JSON.parse(files[0].content))
			startAnimation()
		}
	})
}
function getName() {
	var name = Data.general.general.identifier.value
	if (name) {
		name = name.replace(/^\w+:/, '');
	} else {
		name = 'particles';
	}
	return name;
}
function loadPreset(id) {
	$.getJSON(`./examples/${id}.json`, (data) => {
		loadFile(data)
	})
}
