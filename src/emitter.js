import * as THREE from 'three'
import Molang from 'molangjs'
import DefaultTex from './default_textures'

import Data, {forEachInput} from './input_structure'

import vscode from './vscode_extension'


const System = {
	max_particles: 10000
}
const Flipbook = {
	width: 16, height: 16
}

var Emitter = {};



setInterval(function() {
	if (Emitter && Emitter.tick && !System.paused) {
		Emitter.tick()
	}
}, 1000/30)


/*

Wintersky Args:
- Camera
	(.setCamera())
- Hook to render look to update particle facing mode

*/


class EmitterClass {
	constructor() {
		this.particles = [];
		this.dead_particles = [];
		this.age = 0;
		this.enabled = false;
		this.mode = 'looping';
		this.shape = 'point';
		this.random_vars = [Math.random(), Math.random(), Math.random(), Math.random()]
		this.tick_variables = {};
		this.tick_values = {};
		this.creation_variables = {};
		this.creation_values = {};
		this.curves = {};
	}
	params() {
		var obj = {
			"variable.entity_scale": 1
		};
		obj["variable.emitter_lifetime"] = this.active_time;
		obj["variable.emitter_age"] = this.age;
		obj["variable.emitter_random_1"] = this.random_vars[0];
		obj["variable.emitter_random_2"] = this.random_vars[1];
		obj["variable.emitter_random_3"] = this.random_vars[2];
		obj["variable.emitter_random_4"] = this.random_vars[3];
		return obj;
	}
	start() {
		this.age = 0;
		this.enabled = true;
		var params = this.params()
		this.active_time = Data.emitter.lifetime.inputs.active_time.calculate(params)
		this.sleep_time = Data.emitter.lifetime.inputs.sleep_time.calculate(params)
		this.random_vars = [Math.random(), Math.random(), Math.random(), Math.random()]
		this.creation_values = {};
		for (var key in this.creation_variables) {
			var s = this.creation_variables[key];
			Emitter.creation_values[key] = Molang.parse(s)
		}
		if (Data.emitter.rate.inputs.mode.value === 'instant') {
			this.spawnParticles(Data.emitter.rate.inputs.amount.calculate(params))
		}
		return this;
	}
	tick() {
		var params = this.params()
		this.tick_values = {};
		for (var key in this.tick_variables) {
			var s = this.tick_variables[key];
			Emitter.tick_values[key] = Molang.parse(s, params)
		}
		if (this.enabled && Data.emitter.rate.inputs.mode.value === 'steady') {
			var p_this_tick = Data.emitter.rate.inputs.rate.calculate(params)/30
			var x = 1/p_this_tick;
			var c_f = Math.round(this.age*30)
			if (c_f % Math.round(x) == 0) {
				p_this_tick = Math.ceil(p_this_tick)
			} else {
				p_this_tick = Math.floor(p_this_tick)
			}
			this.spawnParticles(p_this_tick)
		}
		this.particles.forEach(p => {
			p.tick()
		})

		this.age += 1/30;
		var age = Math.roundTo(this.age, 5);
		if (this.mode == 'looping') {
			//Looping
			if (this.enabled && age >= this.active_time) {
				this.stop()
			}
			if (!this.enabled && age >= this.sleep_time) {
				this.start()
			}
		} else if (this.mode == 'once') {
			//Once
			if (this.enabled && age >= this.active_time) {
				this.stop()
			}
		} else if (this.mode === 'expression') {
			//Expressions
			if (this.enabled && Data.emitter.lifetime.inputs.expiration.calculate(params)) {
				this.stop()
			}
			if (!this.enabled && Data.emitter.lifetime.inputs.activation.calculate(params)) {
				this.start()
			}
		}
		return this;
	}
	tickParticleRotation() {
		this.particles.forEach(p => {

			switch (Data.particle.appearance.inputs.facing_camera_mode.value) {
				case 'lookat_xyz':
					p.mesh.lookAt(View.camera.position)
					break;
				case 'lookat_y':
					var v = new THREE.Vector3().copy(View.camera.position);
					v.y = p.position.y;
					p.mesh.lookAt(v);
					break;
				case 'rotate_xyz':
					p.mesh.rotation.copy(View.camera.rotation);
					break;
				case 'rotate_y':
					p.mesh.rotation.copy(View.camera.rotation);
					p.mesh.rotation.reorder('YXZ');
					p.mesh.rotation.x = p.mesh.rotation.z = 0;
					break;
				case 'direction_x':
					var q = new THREE.Quaternion().setFromUnitVectors(System.xnormal, new THREE.Vector3().copy(p.speed).normalize())
					p.mesh.rotation.setFromQuaternion(q);
					break;
				case 'direction_y':
					var q = new THREE.Quaternion().setFromUnitVectors(System.upnormal, new THREE.Vector3().copy(p.speed).normalize())
					p.mesh.rotation.setFromQuaternion(q);
					break;
				case 'direction_z':
					var q = new THREE.Quaternion().setFromUnitVectors(System.znormal, new THREE.Vector3().copy(p.speed).normalize())
					p.mesh.rotation.setFromQuaternion(q);
					break;
			}
			p.mesh.rotation.z += p.rotation||0;
		})
	}
	stop() {
		this.enabled = false;
		this.age = 0;
		return this;
	}
	spawnParticles(count) {
		if (!count) return this;

		if (Data.emitter.rate.inputs.mode.value == 'steady') {
			var max = Data.emitter.rate.inputs.maximum.calculate(this.params())||0;
			max = Math.clamp(max, 0, System.max_particles)
			count = Math.clamp(count, 0, max-this.particles.length);
		} else {
			count = Math.clamp(count, 0, System.max_particles-this.particles.length);
		}
		for (var i = 0; i < count; i++) {
			if (this.dead_particles.length) {
				var p = this.dead_particles.pop()
			} else {
				var p = new Particle()
			}
			p.add()
		}
		return count;
	}
}

function getRandomEuler() {
	return new THREE.Euler(
		Math.randomab(-Math.PI, Math.PI),
		Math.randomab(-Math.PI, Math.PI),
		Math.randomab(-Math.PI, Math.PI)
	)
}

class Particle {
	constructor(data) {
		if (!data) data = 0;

		this.geometry = new THREE.PlaneGeometry(1, 1)
		this.mesh = new THREE.Mesh(this.geometry, System.material)
		this.position = this.mesh.position;

		this.speed = data.speed||new THREE.Vector3();
		this.direction = new THREE.Vector3();
		this.acceleration = data.acceleration||new THREE.Vector3();


		this.add()
	}
	params() {
		var obj = Emitter.params();
		obj["variable.particle_lifetime"] = this.lifetime;
		obj["variable.particle_age"] = this.age;
		obj["variable.particle_random_1"] = this.random_vars[0];
		obj["variable.particle_random_2"] = this.random_vars[1];
		obj["variable.particle_random_3"] = this.random_vars[2];
		obj["variable.particle_random_4"] = this.random_vars[3];
		return obj;
	}
	add() {
		if (!Emitter.particles.includes(this)) {
			Emitter.particles.push(this);
			System.group.add(this.mesh)
		}

		this.age = this.loop_time = 0;
		this.current_frame = 0;
		this.random_vars = [Math.random(), Math.random(), Math.random(), Math.random()]
		var params = this.params()

		this.position.set(0, 0, 0)
		this.lifetime = Data.particle.lifetime.inputs.max_lifetime.calculate(params);
		this.initial_rotation = Data.particle.rotation.inputs.initial_rotation.calculate(params);
		this.rotation_rate = Data.particle.rotation.inputs.rotation_rate.calculate(params);
		this.rotation = 0;

		//Init Position:
		var surface = Data.emitter.shape.inputs.surface_only.value;
		if (Emitter.shape === 'box') {
			var size = Data.emitter.shape.inputs.half_dimensions.calculate(params);

			this.position.x = Math.randomab(-size.x, size.x);
			this.position.y = Math.randomab(-size.y, size.y);
			this.position.z = Math.randomab(-size.z, size.z);

			if (surface) {
				var face = Math.floor(Math.randomab(0, 3))
				var side = Math.floor(Math.randomab(0, 2))
				this.position.setComponent(face, size.getComponent(face) * (side?1:-1))
			}
		} else if (Emitter.shape === 'entity_aabb') {
			var size = new THREE.Vector3(0.5, 1, 0.5);

			this.position.x = Math.randomab(-size.x, size.x);
			this.position.y = Math.randomab(-size.y, size.y);
			this.position.z = Math.randomab(-size.z, size.z);

			if (surface) {
				var face = Math.floor(Math.randomab(0, 3))
				var side = Math.floor(Math.randomab(0, 2))
				this.position.setComponent(face, size.getComponent(face) * (side?1:-1))
			}
		} else if (Emitter.shape === 'sphere') {

			var radius = Data.emitter.shape.inputs.radius.calculate(params)
			if (surface) {
				this.position.x = radius
			} else {
				this.position.x = radius * Math.random()
			}
			this.position.applyEuler(getRandomEuler())
			
		} else if (Emitter.shape === 'disc') {
			var radius = Data.emitter.shape.inputs.radius.calculate(params)
			var ang = Math.random()*Math.PI*2
			var dis = surface ? radius : radius * Math.sqrt(Math.random())

			this.position.x = dis * Math.cos(ang)
			this.position.z = dis * Math.sin(ang)

			var normal = Data.emitter.shape.inputs.plane_normal.calculate(params)
			if (!normal.equals(System.veczero)) {
				var q = new THREE.Quaternion().setFromUnitVectors(System.upnormal, normal.normalize())
				this.position.applyQuaternion(q)
			}
		}
		//Speed
			//this.speed = Data.particle.motion.inputs.direction_speed.calculate(params);
		this.speed = new THREE.Vector3()
		var dir = Data.particle.direction.inputs.mode.value;
		if (dir == 'inwards' || dir == 'outwards') {

			if (Emitter.shape === 'point') {
				this.speed.set(1, 0, 0).applyEuler(getRandomEuler())
			} else {
				this.speed.copy(this.position).normalize()
				if (dir == 'inwards') {
					this.speed.negate()
				}
			}
		} else {
			this.speed = Data.particle.direction.inputs.direction.calculate(params).normalize()
		}
		this.direction.copy(this.speed);

		var speed = Data.particle.motion.inputs.linear_speed.calculate(params);
		this.speed.multiplyScalar(speed);

		this.position.add(Data.emitter.shape.inputs.offset.calculate(params))

		//UV
		this.setFrame(0)

		return this.tick();
	}
	tick() {
		var params = this.params()

		//Lifetime
		this.age += 1/30;
		this.loop_time += 1/30;
		if (Data.particle.lifetime.inputs.mode.value === 'time') {
			if (this.age > this.lifetime) {
				this.remove();
			}
		} else {
			if (Data.particle.lifetime.inputs.expiration_expression.calculate(params)) {
				this.remove();
			}
		}
		//Movement
		if (Data.particle.motion.inputs.mode.value === 'dynamic') {
			//Position
			var drag = Data.particle.motion.inputs.linear_drag_coefficient.calculate(params);
			this.acceleration = Data.particle.motion.inputs.linear_acceleration.calculate(params);
			this.acceleration.addScaledVector(this.speed, -drag)
			this.speed.addScaledVector(this.acceleration, 1/30);
			this.position.addScaledVector(this.speed, 1/30);
			if (Data.particle.lifetime.inputs.kill_plane.value) {
				var plane = Data.particle.lifetime.inputs.kill_plane.calculate();
				var start_point = new THREE.Vector3().copy(this.position).addScaledVector(this.speed, -1/30);
				var line = new THREE.Line3(start_point, this.position)
				if (plane.intersectsLine(line)) {
					this.remove();
				}
			}

		} else if (Data.particle.motion.inputs.mode.value === 'parametric') {
			if (Data.particle.motion.inputs.relative_position.value.join('').length) {
				this.position.copy(Data.particle.motion.inputs.relative_position.calculate(params));
			}
			if (Data.particle.motion.inputs.direction.value.join('').length) {
				this.speed.copy(Data.particle.motion.inputs.direction.calculate(params));
			}
		}

		// Rotation
		if (Data.particle.rotation.inputs.mode.value === 'dynamic') {
			var rot_drag = Data.particle.rotation.inputs.rotation_drag_coefficient.calculate(params)
			var rot_acceleration = Data.particle.rotation.inputs.rotation_acceleration.calculate(params)
				rot_acceleration += -rot_drag * this.rotation_rate;
			this.rotation_rate += rot_acceleration*1/30;
			this.rotation = Math.degToRad(this.initial_rotation + this.rotation_rate*this.age);

		} else if (Data.particle.rotation.inputs.mode.value === 'parametric') {

			this.rotation = Math.degToRad(Data.particle.rotation.inputs.rotation.calculate(params));
		}

		//Size
		var size = Data.particle.appearance.inputs.size.calculate(params);
		this.mesh.scale.x = size.x*2 || 0.0001;
		this.mesh.scale.y = size.y*2 || 0.0001;

		//UV
		if (Data.particle.texture.inputs.mode.value === 'animated') {
			var max_frame = Data.particle.texture.inputs.max_frame.calculate(params);
			if (Data.particle.texture.inputs.stretch_to_lifetime.value && max_frame) {
				var fps = max_frame/this.lifetime;
			} else {
				var fps = Data.particle.texture.inputs.frames_per_second.calculate(params);
			}
			if (Math.floor(this.loop_time*fps) > this.current_frame) {
				this.current_frame = Math.floor(this.loop_time*fps);
				if (max_frame && this.current_frame > max_frame) {
					if (Data.particle.texture.inputs.loop.value) {
						this.current_frame = 0;
						this.loop_time = 0;
						this.setFrame(this.current_frame);
					}
				} else {
					this.setFrame(this.current_frame);
				}
			}
		}


		//Color
		if (Data.particle.color.inputs.mode.value === 'expression') {
			var c = Data.particle.color.inputs.expression.calculate(params)
			this.setColor(c.x, c.y, c.z);

		} else if (Data.particle.color.inputs.mode.value === 'gradient') {
			var i = Data.particle.color.inputs.interpolant.calculate(params)
			var r = Data.particle.color.inputs.range.calculate(params)
			var c = Data.particle.color.inputs.gradient.calculate((i/r) * 100)

			this.setColor(c.r, c.g, c.b);
		} else {
			var c = Data.particle.color.inputs.picker.calculate()
			this.setColor(c.r, c.g, c.b);
		}

		return this;
	}
	setColor(r, g, b) {
		this.mesh.geometry.faces.forEach(face => {
			face.color.setRGB(r, g, b)
		})
		this.mesh.geometry.colorsNeedUpdate = true;
	}
	remove() {
		Emitter.particles.remove(this)
		System.group.remove(this.mesh)
		Emitter.dead_particles.push(this)
		return this;
	}
	setFrame(n) {
		var params = this.params()
		var uv = Data.particle.texture.inputs.uv.calculate(params)
		var size = Data.particle.texture.inputs.uv_size.calculate(params)
		if (n) {
			var offset = Data.particle.texture.inputs.uv_step.calculate(params)
			uv.addScaledVector(offset, n)
		}
		this.setUV(uv.x, uv.y, size.x||Flipbook.width, size.y||Flipbook.height)
	}
	setUV(x, y, w, h) {
		var epsilon = 0.05
		var vertex_uvs = this.geometry.faceVertexUvs[0]

		w = (x+w - 2*epsilon) / Flipbook.width;
		h = (y+h - 2*epsilon) / Flipbook.height;
		x = (x + (w>0 ? epsilon : -epsilon)) / Flipbook.width;
		y = (y + (h>0 ? epsilon : -epsilon)) / Flipbook.height;

		vertex_uvs[0][0].set(x, 1-y)
		vertex_uvs[0][1].set(x, 1-h)
		vertex_uvs[0][2].set(w, 1-y)
		vertex_uvs[1][1].set(w, 1-h)

		vertex_uvs[1][0] = vertex_uvs[0][1];
		vertex_uvs[1][2] = vertex_uvs[0][2];
		this.geometry.uvsNeedUpdate = true
	}
}
let View = 0;

function initParticles(view_arg) {
	View = view_arg;
	System.material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		transparent: true,
		vertexColors: THREE.FaceColors,
		alphaTest: 0.2
	});
	updateMaterial()

	System.group = new THREE.Group()
	View.scene.add(System.group)
	System.upnormal = new THREE.Vector3(0, 1, 0)
	System.xnormal = new THREE.Vector3(1, 0, 0)
	System.znormal = new THREE.Vector3(0, 0, 1)
	System.veczero = new THREE.Vector3(0, 0, 0)
	System.planezero = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0)
	System.max_particles = 10000;
	System.tick = false;

	forEachInput(input => {
		if (input.updatePreview) {
			var data = input.calculate()
			input.updatePreview(data)
		}
	})
	Molang.variableHandler = function (key, params) {
		return Emitter.creation_values[key]
			|| Emitter.tick_values[key]
			|| (Emitter.curves[key] && Emitter.curves[key].calculate(params))
	}

	Emitter = new EmitterClass().start()

	System.isSetup = true;
	if (System.onSetup instanceof Function) {
		System.onSetup();
	}
}
function startAnimation() {
	if (System.paused) {
		togglePause()
	}
	for (var i = Emitter.particles.length-1; i >= 0; i--) {
		Emitter.particles[i].remove()
	}
	Emitter.start()
}
function togglePause() {
	System.paused = !System.paused;
}

const VanillaTextures = {
	'textures/particle/particles': DefaultTex.default_particles,
	'textures/flame_atlas': DefaultTex.flame_atlas,
	'textures/particle/flame_atlas': DefaultTex.flame_atlas,
	'textures/particle/campfire_smoke': DefaultTex.campfire_smoke,
}
function updateMaterial(cb) {
	var url;
	var path = Data.particle.texture.inputs.path.value;

	if (vscode && path) {

		vscode.postMessage({
            type: 'request_texture',
            path
		});
		function update(event) {
			if (event.data.type == 'provide_texture') {
				let uri = (event.data.url && event.data.url + '?'+Math.floor(Math.random()*1000)) || VanillaTextures[path];
				loadTexture(uri || DefaultTex.missing, cb);
				Data.particle.texture.inputs.image.image.data = uri || '';
				window.removeEventListener('message', update);
			}
		}
		window.addEventListener('message', update, false);

	} else if (Data.particle.texture.inputs.image.image && Data.particle.texture.inputs.image.image.loaded) {

		url = Data.particle.texture.inputs.image.image.data;
		loadTexture(url, cb)

	} else {
		url = VanillaTextures[path];
		Data.particle.texture.inputs.image.image.data = url || '';
		Data.particle.texture.inputs.image.image.loaded = false;
		loadTexture(url || DefaultTex.missing, cb)
	}
}

function loadTexture(url, cb) {
	var tex = new THREE.TextureLoader().load(url, function(a, b) {
		function factorize(input, axis, factor) {
			if (!input.value || !input.value[axis]) return;
			var arr = input.value.slice()
			var val = arr[axis]
			if (isNaN(val)) {
				arr[axis] = `${factor} * (${val})`
			} else {
				arr[axis] = Math.round(factor * parseFloat(val) * 10000) / 10000;
			}
			input.value = arr;
		}

		tex.magFilter = THREE.NearestFilter
		tex.minFilter = THREE.NearestFilter
		System.material.map = tex
		var x_factor = System.material.map.image.naturalWidth / Flipbook.width;
		var y_factor = System.material.map.image.naturalHeight / Flipbook.height;
		if (x_factor && x_factor != 1) {
			factorize(Data.particle.texture.inputs.uv, 0, x_factor)
			factorize(Data.particle.texture.inputs.uv_size, 0, x_factor)
			factorize(Data.particle.texture.inputs.uv_step, 0, x_factor)
		}
		if (y_factor && y_factor != 1) {
			factorize(Data.particle.texture.inputs.uv, 1, y_factor)
			factorize(Data.particle.texture.inputs.uv_size, 1, y_factor)
			factorize(Data.particle.texture.inputs.uv_step, 1, y_factor)
		}
		Flipbook.width = System.material.map.image.naturalWidth;
		Flipbook.height = System.material.map.image.naturalHeight;
		if (typeof cb === 'function') {
			cb()
		}
	})
}


export {System, Flipbook, Emitter, startAnimation, updateMaterial, togglePause, initParticles}
