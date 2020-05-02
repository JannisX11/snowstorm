import * as THREE from 'three';
import Molang from 'molangjs';

const Normals = {
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
	n: new THREE.Vector3(0, 0, 0),
};


function calculate(path, params) {

} 

class Wintersky {
	constructor() {
		this.parameters = {
			'effect.curves': [],
			'effect.space.local_position': false,
			'effect.space.local_rotation': false,
			'effect.variable.creation_vars': [],
			'effect.variable.tick_vars': [],

			'emitter.rate.mode': '',
			'emitter.rate.rate': '',
			'emitter.rate.amount': '',
			'emitter.rate.maximum': '',
			'emitter.lifetime.mode': '',
			'emitter.lifetime.active_time': '',
			'emitter.lifetime.sleep_time': '',
			'emitter.lifetime.activation': '',
			'emitter.lifetime.expiration': '',
			'emitter.shape.mode': '',
			'emitter.shape.offset': '',
			'emitter.shape.radius': '',
			'emitter.shape.half_dimensions': '',
			'emitter.shape.plane_normal': '',
			'emitter.shape.surface_only': false,
			'particle.appearance.size': '',
			'particle.appearance.facing_camera_mode': '',
			'particle.appearance.material': '',
			'particle.direction.mode': '',
			'particle.direction.direction': '',
			'particle.motion.mode': '',
			'particle.motion.linear_speed': '',
			'particle.motion.linear_acceleration': '',
			'particle.motion.linear_drag_coefficient': '',
			'particle.motion.relative_position': '',
			'particle.motion.direction': '',
			'particle.rotation.mode': '',
			'particle.rotation.initial_rotation': '',
			'particle.rotation.rotation_rate': '',
			'particle.rotation.rotation_acceleration': '',
			'particle.rotation.rotation_drag_coefficient': '',
			'particle.rotation.rotation': '',
			'particle.lifetime.mode': '',
			'particle.lifetime.max_lifetime': '',
			'particle.lifetime.kill_plane': 0,
			'particle.lifetime.expiration_expression': '',
			'particle.lifetime.expire_in': [],
			'particle.lifetime.expire_outside': [],
			'particle.texture.path': '',
			'particle.texture.image': '',
			'particle.texture.mode': '',
			'particle.texture.uv': '',
			'particle.texture.uv_size': '',
			'particle.texture.uv_step': '',
			'particle.texture.frames_per_second': 0,
			'particle.texture.max_frame': '',
			'particle.texture.stretch_to_lifetime': false,
			'particle.texture.loop': false,
			'particle.color.mode': '',
			'particle.color.picker': '#fffff',
			'particle.color.interpolant': '',
			'particle.color.range': 0,
			'particle.color.gradient': [],
			'particle.color.expression': '',
			'particle.color.light': false,
			'particle.collision.enabled': false,
			'particle.collision.collision_drag': 0,
			'particle.collision.coefficient_of_restitution': 0,
			'particle.collision.collision_radius': 0,
			'particle.collision.expire_on_contact': false,
		}
		this.object = new THREE.Object3D()
		this.particles = [];
		this.dead_particles = [];

		this.Flipbook = {
			width: 0,
			height: 0
		}
		

		this.material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			alphaTest: 0.2
		});
		this.updateMaterial()
	

		Molang.variableHandler = function (key, params) {
			// todo
			return Emitter.creation_values[key]
				|| Emitter.tick_values[key]
				|| (Emitter.curves[key] && Emitter.curves[key].calculate(params))
		}
	
	}
	calculate(...args) {
		return calculate(this, ...args)
	}
	params() {
		var obj = {
			"variable.entity_scale": 1
		};
		obj["variable.emitter_lifetime"] = this.lifetime;
		obj["variable.emitter_age"] = this.age;
		obj["variable.emitter_random_1"] = this.random_vars[0];
		obj["variable.emitter_random_2"] = this.random_vars[1];
		obj["variable.emitter_random_3"] = this.random_vars[2];
		obj["variable.emitter_random_4"] = this.random_vars[3];
		return obj;
	}
	updateMaterial() {
		var url;
		var path = Data.particle.texture.inputs.path.value;
		if (Data.particle.texture.inputs.image.image) {
			url = Data.particle.texture.inputs.image.image.data;
		} else {
			if (path == 'textures/particle/particles') {
				url = 'assets/default_particles.png';
	
			} else if (path == 'textures/flame_atlas' || path == 'textures/particle/flame_atlas') {
				url = 'assets/flame_atlas.png';
	
			} else if (path == 'textures/particle/campfire_smoke') {
				url = 'assets/campfire_smoke.png';
			} else {
				url = 'assets/missing.png';
			}
		}
		var tex = new THREE.TextureLoader().load(url, function(a, b) {
			function factorize(input, axis, factor) {
				if (!input.value || !input.value[axis]) return;
				var arr = input.value.slice()
				var val = arr[axis]
				if (isNaN(val)) {
					arr[axis] = `${factor} * (${val})`
				} else {
					arr[axis] = factor * parseFloat(val);
				}
				input.value = arr;
			}
	
			tex.magFilter = THREE.NearestFilter
			tex.minFilter = THREE.NearestFilter
			System.material.map = tex
			var x_factor = System.material.map.image.naturalWidth / this.Flipbook.width;
			var y_factor = System.material.map.image.naturalHeight / this.Flipbook.height;
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
			this.Flipbook.width = System.material.map.image.naturalWidth;
			this.Flipbook.height = System.material.map.image.naturalHeight;
			if (typeof cb === 'function') {
				cb()
			}
		})
	}
	start() {
		this.age = 0;
		this.enabled = true;
		var params = this.params()
		this.active_time = this.calculate('emitter.lifetime.inputs.active_time', params)
		this.sleep_time = this.calculate('emitter.lifetime.inputs.sleep_time', params)
		this.random_vars = [Math.random(), Math.random(), Math.random(), Math.random()]
		this.creation_values = {};
		for (var key in this.creation_variables) {
			var s = this.creation_variables[key];
			this.creation_values[key] = Molang.parse(s)
		}
		if (this.calculate('emitter.rate.inputs.mode') === 'instant') {
			this.spawnParticles(this.calculate('emitter.rate.inputs.amount', params))
		}
		return this;
	}
	tick() {
		var params = this.params()
		this.tick_values = {};
		for (var key in this.tick_variables) {
			var s = this.tick_variables[key];
			this.tick_values[key] = Molang.parse(s, params)
		}
		if (this.enabled && this.calculate('emitter.rate.inputs.mode') === 'steady') {
			var p_this_tick = this.calculate('emitter.rate.inputs.rate', params)/30
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
			if (this.enabled && this.calculate('emitter.lifetime.inputs.expiration', params)) {
				this.stop()
			}
			if (!this.enabled && this.calculate('emitter.lifetime.inputs.activation', params)) {
				this.start()
			}
		}
		return this;
	}
	tickParticleRotation() {
		this.particles.forEach(p => {

			switch (this.calculate('particle.appearance.inputs.facing_camera_mode')) {
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
					var q = new THREE.Quaternion().setFromUnitVectors(Normals.x, new THREE.Vector3().copy(p.speed).normalize())
					p.mesh.rotation.setFromQuaternion(q);
					break;
				case 'direction_y':
					var q = new THREE.Quaternion().setFromUnitVectors(Normals.y, new THREE.Vector3().copy(p.speed).normalize())
					p.mesh.rotation.setFromQuaternion(q);
					break;
				case 'direction_z':
					var q = new THREE.Quaternion().setFromUnitVectors(Normals.z, new THREE.Vector3().copy(p.speed).normalize())
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

		if (this.calculate('emitter.rate.inputs.mode') == 'steady') {
			var max = this.calculate('emitter.rate.inputs.maximum', this.params())||0;
			max = Math.clamp(max, 0, this.max_particles)
			count = Math.clamp(count, 0, max-this.particles.length);
		} else {
			count = Math.clamp(count, 0, this.max_particles-this.particles.length);
		}
		for (var i = 0; i < count; i++) {
			if (this.dead_particles.length) {
				var p = this.dead_particles.pop()
			} else {
				var p = new Wintersky.Particle(this)
			}
			p.add()
		}
		return count;
	}
}

Wintersky.Particle = class {
	constructor(emitter, data) {
		if (!data) data = 0;

		this.emitter = emitter;

		this.geometry = new THREE.PlaneGeometry(1, 1)
		this.material = System.material.clone();
		this.mesh = new THREE.Mesh(this.geometry, this.material)
		this.position = this.mesh.position;

		this.speed = data.speed||new THREE.Vector3();
		this.direction = new THREE.Vector3();
		this.acceleration = data.acceleration||new THREE.Vector3();

		this.add()
	}
	calculate(...args) {
		return this.emitter.calculate(...args);
	}
	params() {
		var obj = this.emitter.params();
		obj["variable.particle_lifetime"] = this.lifetime;
		obj["variable.particle_age"] = this.age;
		obj["variable.particle_random_1"] = this.random_vars[0];
		obj["variable.particle_random_2"] = this.random_vars[1];
		obj["variable.particle_random_3"] = this.random_vars[2];
		obj["variable.particle_random_4"] = this.random_vars[3];
		return obj;
	}
	add() {
		if (!this.emitter.particles.includes(this)) {
			this.emitter.particles.push(this);
			this.emitter.object.add(this.mesh)
		}

		this.age = this.loop_time = 0;
		this.current_frame = 0;
		this.random_vars = [Math.random(), Math.random(), Math.random(), Math.random()]
		this.material.copy(this.emitter.material)
		this.material.needsUpdate = true;
		var params = this.params()

		this.position.set(0, 0, 0)
		this.lifetime = this.calculate('particle.lifetime.inputs.max_lifetime', params);
		this.initial_rotation = this.calculate('particle.rotation.inputs.initial_rotation', params);
		this.rotation_rate = this.calculate('particle.rotation.inputs.rotation_rate', params);
		this.rotation = 0;

		//Init Position:
		var surface = this.calculate('emitter.shape.inputs.surface_only');
		if (this.calculate('emitter.shape.inputs.mode') === 'box') {
			var size = this.calculate('emitter.shape.inputs.half_dimensions', params);

			this.position.x = Math.randomab(-size.x, size.x);
			this.position.y = Math.randomab(-size.y, size.y);
			this.position.z = Math.randomab(-size.z, size.z);

			if (surface) {
				var face = Math.floor(Math.randomab(0, 3))
				var side = Math.floor(Math.randomab(0, 2))
				this.position.setComponent(face, size.getComponent(face) * (side?1:-1))
			}
		} else if (this.calculate('emitter.shape.inputs.mode') === 'entity_aabb') {
			var size = new THREE.Vector3(0.5, 1, 0.5);

			this.position.x = Math.randomab(-size.x, size.x);
			this.position.y = Math.randomab(-size.y, size.y);
			this.position.z = Math.randomab(-size.z, size.z);

			if (surface) {
				var face = Math.floor(Math.randomab(0, 3))
				var side = Math.floor(Math.randomab(0, 2))
				this.position.setComponent(face, size.getComponent(face) * (side?1:-1))
			}
		} else if (this.calculate('emitter.shape.inputs.mode') === 'sphere') {

			var radius = this.calculate('emitter.shape.inputs.radius', params)
			if (surface) {
				this.position.x = radius
			} else {
				this.position.x = radius * Math.random()
			}
			this.position.applyEuler(getRandomEuler())
			
		} else if (this.calculate('emitter.shape.inputs.mode') === 'disc') {
			var radius = this.calculate('emitter.shape.inputs.radius', params)
			var ang = Math.random()*Math.PI*2
			var dis = surface ? radius : radius * Math.sqrt(Math.random())

			this.position.x = dis * Math.cos(ang)
			this.position.z = dis * Math.sin(ang)

			var normal = this.calculate('emitter.shape.inputs.plane_normal', params)
			if (!normal.equals(Normals.n)) {
				var q = new THREE.Quaternion().setFromUnitVectors(Normals.y, normal.normalize())
				this.position.applyQuaternion(q)
			}
		}
		//Speed
			//this.speed = this.calculate('particle.motion.inputs.direction_speed', params);
		this.speed = new THREE.Vector3()
		var dir = this.calculate('particle.direction.inputs.mode');
		if (dir == 'inwards' || dir == 'outwards') {

			if (this.calculate('emitter.shape.inputs.mode') === 'point') {
				this.speed.set(1, 0, 0).applyEuler(getRandomEuler())
			} else {
				this.speed.copy(this.position).normalize()
				if (dir == 'inwards') {
					this.speed.negate()
				}
			}
		} else {
			this.speed = this.calculate('particle.direction.inputs.direction', params).normalize()
		}
		this.direction.copy(this.speed);

		var speed = this.calculate('particle.motion.inputs.linear_speed', params);
		this.speed.multiplyScalar(speed);

		this.position.add(this.calculate('emitter.shape.inputs.offset', params))

		//UV
		this.setFrame(0)

		return this.tick();
	}
	tick() {
		var params = this.params()

		//Lifetime
		this.age += 1/30;
		this.loop_time += 1/30;
		if (this.calculate('particle.lifetime.inputs.mode') === 'time') {
			if (this.age > this.lifetime) {
				this.remove();
			}
		} else {
			if (this.calculate('particle.lifetime.inputs.expiration_expression', params)) {
				this.remove();
			}
		}
		//Movement
		if (this.calculate('particle.motion.inputs.mode') === 'dynamic') {
			//Position
			var drag = this.calculate('particle.motion.inputs.linear_drag_coefficient', params);
			this.acceleration = this.calculate('particle.motion.inputs.linear_acceleration', params);
			this.acceleration.addScaledVector(this.speed, -drag)
			this.speed.addScaledVector(this.acceleration, 1/30);
			this.position.addScaledVector(this.speed, 1/30);
			if (this.calculate('particle.lifetime.inputs.kill_plane')) {
				var plane = this.calculate('particle.lifetime.inputs.kill_plane', );
				var start_point = new THREE.Vector3().copy(this.position).addScaledVector(this.speed, -1/30);
				var line = new THREE.Line3(start_point, this.position)
				if (plane.intersectsLine(line)) {
					this.remove();
				}
			}

		} else if (this.calculate('particle.motion.inputs.mode') === 'parametric') {
			if (this.calculate('particle.motion.inputs.relative_position').join('').length) {
				this.position.copy(this.calculate('particle.motion.inputs.relative_position', params));
			}
			if (this.calculate('particle.motion.inputs.direction').join('').length) {
				this.speed.copy(this.calculate('particle.motion.inputs.direction', params));
			}
		}

		// Rotation
		if (this.calculate('particle.rotation.inputs.mode') === 'dynamic') {
			var rot_drag = this.calculate('particle.rotation.inputs.rotation_drag_coefficient', params)
			var rot_acceleration = this.calculate('particle.rotation.inputs.rotation_acceleration', params)
				rot_acceleration += -rot_drag * this.rotation_rate;
			this.rotation_rate += rot_acceleration*1/30;
			this.rotation = Math.degToRad(this.initial_rotation + this.rotation_rate*this.age);

		} else if (this.calculate('particle.rotation.inputs.mode') === 'parametric') {

			this.rotation = Math.degToRad(this.calculate('particle.rotation.inputs.rotation', params));
		}

		//Size
		var size = this.calculate('particle.appearance.inputs.size', params);
		this.mesh.scale.x = size.x*2 || 0.0001;
		this.mesh.scale.y = size.y*2 || 0.0001;

		//UV
		if (this.calculate('particle.texture.inputs.mode') === 'animated') {
			var max_frame = this.calculate('particle.texture.inputs.max_frame', params);
			if (this.calculate('particle.texture.inputs.stretch_to_lifetime') && max_frame) {
				var fps = max_frame/this.lifetime;
			} else {
				var fps = this.calculate('particle.texture.inputs.frames_per_second', params);
			}
			if (Math.floor(this.loop_time*fps) > this.current_frame) {
				this.current_frame = Math.floor(this.loop_time*fps);
				if (max_frame && this.current_frame > max_frame) {
					if (this.calculate('particle.texture.inputs.loop')) {
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
		if (this.calculate('particle.color.inputs.mode') === 'expression') {
			var c = this.calculate('particle.color.inputs.expression', params)
			this.material.color.r = c.x;
			this.material.color.g = c.y;
			this.material.color.b = c.z;
		} else if (this.calculate('particle.color.inputs.mode') === 'gradient') {
			var i = this.calculate('particle.color.inputs.interpolant', params)
			var r = this.calculate('particle.color.inputs.range', params)
			var c = this.calculate('particle.color.inputs.gradient', (i/r) * 100)

			this.material.color.copy(c)
		}

		return this;
	}
	remove() {
		this.emitter.particles.remove(this)
		this.emitter.object.remove(this.mesh)
		this.emitter.dead_particles.push(this)
		return this;
	}
	setFrame(n) {
		var params = this.params()
		var uv = this.calculate('particle.texture.inputs.uv', params)
		var size = this.calculate('particle.texture.inputs.uv_size', params)
		if (n) {
			var offset = this.calculate('particle.texture.inputs.uv_step', params)
			uv.addScaledVector(offset, n)
		}
		this.setUV(uv.x, uv.y, size.x||this.emitter.Flipbook.width, size.y||this.emitter.Flipbook.height)
	}
	setUV(x, y, w, h) {
		var epsilon = 0.05
		var vertex_uvs = this.geometry.faceVertexUvs[0]

		w = (x+w - 2*epsilon) / this.emitter.Flipbook.width;
		h = (y+h - 2*epsilon) / this.emitter.Flipbook.height;
		x = (x + (w>0 ? epsilon : -epsilon)) / this.emitter.Flipbook.width;
		y = (y + (h>0 ? epsilon : -epsilon)) / this.emitter.Flipbook.height;

		vertex_uvs[0][0].set(x, 1-y)
		vertex_uvs[0][1].set(x, 1-h)
		vertex_uvs[0][2].set(w, 1-y)
		vertex_uvs[1][1].set(w, 1-h)

		vertex_uvs[1][0] = vertex_uvs[0][1];
		vertex_uvs[1][2] = vertex_uvs[0][2];
		this.geometry.uvsNeedUpdate = true
	}
}