import {IO, pathToExtension} from './util'
import Molang from 'molangjs'
import Data, {forEachInput} from './input_structure'
import {startAnimation, updateMaterial, Flipbook} from './emitter'
import tinycolor from 'tinycolor2'
import vscode from './vscode_extension'

import FireSample from '../examples/fire.particle.json'
import LoadingSample from '../examples/loading.particle.json'
import MagicSample from '../examples/magic.particle.json'
import RainSample from '../examples/rain.particle.json'
import SnowSample from '../examples/snow.particle.json'
import TrailSample from '../examples/trail.particle.json'

const Samples = {
	fire: FireSample,
	loading: LoadingSample,
	magic: MagicSample,
	rain: RainSample,
	snow: SnowSample,
	trail: TrailSample,
}


function loadFile(data) {

	if (data && data.particle_effect && startNewProject()) {

		var comps = data.particle_effect.components;
		var curves = data.particle_effect.curves;
		var desc = data.particle_effect.description;
		if (desc && desc.identifier) {
			Data.effect.meta.inputs.identifier.set(desc.identifier)
		}
		if (desc && desc.basic_render_parameters) {
			Data.particle.texture.inputs.path.set(desc.basic_render_parameters.texture)

			Data.particle.appearance.inputs.material.set(desc.basic_render_parameters.material)
		}
		if (curves) {
			for (var key in curves) {
				var json_curve = curves[key];
				var new_curve = new Curve();
				new_curve.inputs.id.set(key);
				new_curve.inputs.mode.set(json_curve.type);
				new_curve.inputs.input.set(json_curve.input);
				new_curve.inputs.range.set(json_curve.horizontal_range);
				new_curve.nodes.splice(0);
				if (json_curve.nodes && json_curve.nodes.length) {
					json_curve.nodes.forEach(value => {
						value = parseFloat(value)||0;
						new_curve.nodes.push(value);
					})
					new_curve.updateMinMax();
				}
				Data.effect.curves.curves.push(new_curve);
			}
		}

		if (comps) {
			function comp(id) {
				return comps[`minecraft:${id}`]
			}
			if (comp('emitter_initialization')) {
				var cr_v = comp('emitter_initialization').creation_expression;
				var up_v = comp('emitter_initialization').per_update_expression;
				if (typeof cr_v == 'string') {
					Data.effect.variables.inputs.creation_vars.set(cr_v.replace(/;+$/, '').split(';'))
				}
				if (typeof up_v == 'string') {
					Data.effect.variables.inputs.tick_vars.set(up_v.replace(/;+$/, '').split(';'))
				}
			}
			if (comp('emitter_local_space')) {
				Data.effect.space.inputs.local_position.set(comp('emitter_local_space').position)
				Data.effect.space.inputs.local_rotation.set(comp('emitter_local_space').rotation)
			}
			if (comp('emitter_rate_steady')) {
				Data.emitter.rate.inputs.mode.set('steady')
				Data.emitter.rate.inputs.rate.set(comp('emitter_rate_steady').spawn_rate)
				Data.emitter.rate.inputs.maximum.set(comp('emitter_rate_steady').max_particles)
			}
			if (comp('emitter_rate_instant')) {
				Data.emitter.rate.inputs.mode.set('instant')
				Data.emitter.rate.inputs.amount.set(comp('emitter_rate_instant').num_particles)
			}
			if (comp('emitter_lifetime_once')) {
				Data.emitter.lifetime.inputs.mode.set('once')
				Data.emitter.lifetime.inputs.active_time.set(comp('emitter_lifetime_once').active_time)
			}
			if (comp('emitter_lifetime_looping')) {
				Data.emitter.lifetime.inputs.mode.set('looping')
				Data.emitter.lifetime.inputs.active_time.set(comp('emitter_lifetime_looping').active_time)
				Data.emitter.lifetime.inputs.sleep_time.set(comp('emitter_lifetime_looping').sleep_time)
			}
			if (comp('emitter_lifetime_expression')) {
				Data.emitter.lifetime.inputs.mode.set('expression')
				Data.emitter.lifetime.inputs.activation.set(comp('emitter_lifetime_expression').activation_expression)
				Data.emitter.lifetime.inputs.expiration.set(comp('emitter_lifetime_expression').expiration_expression)
			}
			var shape_component = comp('emitter_shape_point') || comp('emitter_shape_custom');
			if (shape_component) {
				Data.emitter.shape.inputs.mode.set('point')
				Data.emitter.shape.inputs.offset.set(shape_component.offset)
			}
			if (comp('emitter_shape_sphere')) {
				shape_component = comp('emitter_shape_sphere');
				Data.emitter.shape.inputs.mode.set('sphere')
				Data.emitter.shape.inputs.offset.set(shape_component.offset)
				Data.emitter.shape.inputs.radius.set(shape_component.radius)
				Data.emitter.shape.inputs.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_box')) {
				shape_component = comp('emitter_shape_box');
				Data.emitter.shape.inputs.mode.set('box')
				Data.emitter.shape.inputs.offset.set(shape_component.offset)
				Data.emitter.shape.inputs.half_dimensions.set(shape_component.half_dimensions)
				Data.emitter.shape.inputs.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_disc')) {
				shape_component = comp('emitter_shape_disc');
				Data.emitter.shape.inputs.mode.set('disc')
				Data.emitter.shape.inputs.offset.set(shape_component.offset)
				switch (shape_component.plane_normal) {
					case 'x': Data.emitter.shape.inputs.plane_normal.set([1, 0, 0]); break;
					case 'y': Data.emitter.shape.inputs.plane_normal.set([0, 1, 0]); break;
					case 'z': Data.emitter.shape.inputs.plane_normal.set([0, 0, 1]); break;
					default:  Data.emitter.shape.inputs.plane_normal.set(shape_component.plane_normal); break;
				}
				Data.emitter.shape.inputs.radius.set(shape_component.radius)
				Data.emitter.shape.inputs.surface_only.set(shape_component.surface_only)
			}
			if (comp('emitter_shape_entity_aabb')) {
				Data.emitter.shape.inputs.mode.set('entity_aabb')
				Data.emitter.shape.inputs.surface_only.set(comp('emitter_shape_entity_aabb').surface_only)
				shape_component = comp('emitter_shape_entity_aabb');
			}
			if (shape_component && shape_component.direction) {
				if (shape_component.direction == 'inwards' || shape_component.direction == 'outwards') {
					Data.particle.direction.inputs.mode.set(shape_component.direction)
				} else {
					Data.particle.direction.inputs.mode.set('direction')
					Data.particle.direction.inputs.direction.set(shape_component.direction)
				}
			}

			if (comp('particle_initial_spin')) {
				Data.particle.rotation.inputs.initial_rotation.set(comp('particle_initial_spin').rotation)
				Data.particle.rotation.inputs.rotation_rate.set(comp('particle_initial_spin').rotation_rate)
			}
			if (comp('particle_kill_plane')) {
				Data.particle.lifetime.inputs.kill_plane.set(comp('particle_kill_plane'))
			}

			if (comp('particle_motion_dynamic')) {
				Data.particle.motion.inputs.mode.set('dynamic')
				Data.particle.motion.inputs.linear_acceleration.set(comp('particle_motion_dynamic').linear_acceleration)
				Data.particle.motion.inputs.linear_drag_coefficient.set(comp('particle_motion_dynamic').linear_drag_coefficient)
				Data.particle.rotation.inputs.rotation_acceleration.set(comp('particle_motion_dynamic').rotation_acceleration)
				Data.particle.rotation.inputs.rotation_drag_coefficient.set(comp('particle_motion_dynamic').rotation_drag_coefficient)
				Data.particle.motion.inputs.linear_speed.set(1)
			}
			if (comp('particle_motion_parametric')) {
				Data.particle.motion.inputs.mode.set('parametric')
				Data.particle.motion.inputs.relative_position.set(comp('particle_motion_parametric').relative_position)
				Data.particle.motion.inputs.direction.set(comp('particle_motion_parametric').direction)
				Data.particle.rotation.inputs.rotation.set(comp('particle_motion_parametric').rotation)
			}
			if (comp('particle_motion_collision')) {
				Data.particle.collision.inputs.collision_drag.set(comp('particle_motion_collision').collision_drag)
				Data.particle.collision.inputs.coefficient_of_restitution.set(comp('particle_motion_collision').coefficient_of_restitution)
				Data.particle.collision.inputs.collision_radius.set(comp('particle_motion_collision').collision_radius)
				Data.particle.collision.inputs.expire_on_contact.set(comp('particle_motion_collision').expire_on_contact)
			}
			if (comp('particle_initial_speed') !== undefined) {
				var c = comp('particle_initial_speed')
				if (typeof c !== 'object') {
					Data.particle.motion.inputs.linear_speed.set(c)
				} else {
					Data.particle.direction.inputs.mode.set('direction')
					Data.particle.direction.inputs.direction.set(comp('particle_initial_speed'))
					Data.particle.motion.inputs.linear_speed.set(1)
				}
			}

			if (comp('particle_lifetime_expression')) {
				Data.particle.lifetime.inputs.mode.set('expression')
				if (comp('particle_lifetime_expression').expiration_expression) {
					Data.particle.lifetime.inputs.mode.set('expression')
					Data.particle.lifetime.inputs.expiration_expression.set(comp('particle_lifetime_expression').expiration_expression)
				} else {
					Data.particle.lifetime.inputs.mode.set('time')
					Data.particle.lifetime.inputs.max_lifetime.set(comp('particle_lifetime_expression').max_lifetime)
				}
			}
			if (comp('particle_expire_if_in_blocks') instanceof Array) {
				Data.particle.lifetime.inputs.expire_in.set(comp('particle_expire_if_in_blocks'))
			}
			if (comp('particle_expire_if_not_in_blocks') instanceof Array) {
				Data.particle.lifetime.inputs.expire_outside.set(comp('particle_expire_if_not_in_blocks'))
			}
			
			if (comp('particle_appearance_billboard')) {
				Data.particle.appearance.inputs.size.set(comp('particle_appearance_billboard').size)
				Data.particle.appearance.inputs.facing_camera_mode.set(comp('particle_appearance_billboard').facing_camera_mode)
				var uv_tag = comp('particle_appearance_billboard').uv;
				if (uv_tag) {
					if (uv_tag.texture_width) Flipbook.width = uv_tag.texture_width;
					if (uv_tag.texture_height) Flipbook.height = uv_tag.texture_height;
					if (uv_tag.flipbook) {
						Data.particle.texture.inputs.mode.set('animated')
						Data.particle.texture.inputs.uv.set(uv_tag.flipbook.base_UV)
						Data.particle.texture.inputs.uv_size.set(uv_tag.flipbook.size_UV)
						Data.particle.texture.inputs.uv_step.set(uv_tag.flipbook.step_UV)
						Data.particle.texture.inputs.frames_per_second.set(uv_tag.flipbook.frames_per_second)
						Data.particle.texture.inputs.max_frame.set(uv_tag.flipbook.max_frame)
						Data.particle.texture.inputs.stretch_to_lifetime.set(uv_tag.flipbook.stretch_to_lifetime)
						Data.particle.texture.inputs.loop.set(uv_tag.flipbook.loop)
					} else {
						Data.particle.texture.inputs.mode.set('static')
						Data.particle.texture.inputs.uv.set(uv_tag.uv)
						Data.particle.texture.inputs.uv_size.set(uv_tag.uv_size)
					}
				}
			}
			if (comp('particle_appearance_lighting')) {
				Data.particle.color.inputs.light.set(true)
			}
			if (comp('particle_appearance_tinting')) {
				var c = comp('particle_appearance_tinting').color

				if (c instanceof Array && c.length >= 3) {

					if ((typeof c[0] + typeof c[1] + typeof c[1]).includes('string')) {
						Data.particle.color.inputs.mode.set('expression')
						Data.particle.color.inputs.expression.set(c)

					} else {
						Data.particle.color.inputs.mode.set('static')
						var color = {
							r: Molang.parse(c[0])*255,
							g: Molang.parse(c[1])*255,
							b: Molang.parse(c[2])*255
						}
						Data.particle.color.inputs.picker.set(color)
					}
				} else if (typeof c == 'object') {
					// Gradient
						Data.particle.color.inputs.mode.set('gradient')
					Data.particle.color.inputs.interpolant.set(c.interpolant)
					Data.particle.color.inputs.gradient.value.empty()
					if (c.gradient instanceof Array) {
						let distance = 100 / (c.gradient.length-1);
						c.gradient.forEach((color, i) => {
							color = new tinycolor(color).toHexString();
							var percent = distance * i;
							Data.particle.color.inputs.gradient.value.push({percent, color})
						})
					} else if (typeof c.gradient == 'object') {
						let max_time = 0;
						for (var time in c.gradient) {
							max_time = Math.max(parseFloat(time), max_time)
						}
						Data.particle.color.inputs.range.set(max_time)
						for (var time in c.gradient) {
							var color = new tinycolor(c.gradient[time]).toHexString();
							var percent = (parseFloat(time) / max_time) * 100;
							Data.particle.color.inputs.gradient.value.push({color, percent})
						}
					}
					Data.particle.color.inputs.gradient.selected = Data.particle.color.inputs.gradient.value[0]
				}
			}
		}
		if (Data.particle.texture.inputs.path.value) {
			updateMaterial(startAnimation)
		} else {
			startAnimation()
		}
	}
}
function startNewProject() {
	if (vscode || confirm('This action may clear your current work. Do you want to continue?')) {
		forEachInput(input => {
			input.reset()
		})
		Data.effect.curves.curves.splice(0);
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

document.ondragover = function(event) {
	event.preventDefault()
}
document.body.ondrop = function(event) {
	var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
	if (file) {
		if (pathToExtension(file.name) === 'json') {
			var reader = new FileReader()
			reader.onloadend = function() {

				loadFile(JSON.parse(reader.result))
				startAnimation()
			}
			reader.readAsText(file)
			event.preventDefault()
		}
	}
}

function loadPreset(id) {
	loadFile(Samples[id])
}

export {
	importFile,
	loadFile,
	loadPreset,
	startNewProject
}
