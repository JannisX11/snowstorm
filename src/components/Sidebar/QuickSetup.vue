<template>
	<div class="quick_setup">
		<div class="input_group">
			<h4>Shape & Motion</h4>
			<ul class="preset_option_list">
				<li @click="set('shape', 'sphere')" :class="{selected: shape == 'sphere'}">
					<Loader :size="38" :stroke-width="1" />
					Sphere
				</li>
				<li @click="set('shape', 'rain')" :class="{selected: shape == 'rain'}">
					<CloudRain :size="38" :stroke-width="1" />
					Rain
				</li>
				<li @click="set('shape', 'ring')" :class="{selected: shape == 'ring'}">
					<Torus :size="38" :stroke-width="1" />
					Ring
				</li>
				<li @click="set('shape', 'gravitate')" :class="{selected: shape == 'gravitate'}">
					<Magnet :size="38" :stroke-width="1" />
					Gravitate to Center
				</li>
			</ul>
			<div class="input_bar">
				<label>Speed</label>
				<input type="range" v-model="speed" min="0" max="20" step="0.5" >
				<label class="range_number_label">{{ speed }}</label>
			</div>
		</div>

		<div class="input_group">
			<h4>Timing</h4>
			<ul class="preset_option_list">
				<li @click="set('timing', 'burst')" :class="{selected: timing == 'burst'}">
					<Bomb :size="38" :stroke-width="1" />
					Burst
				</li>
				<li @click="set('timing', 'steady')" :class="{selected: timing == 'steady'}">
					<Timer :size="38" :stroke-width="1" />
					Steady
				</li>
			</ul>
			<div class="input_bar">
				<label>Amount</label>
				<input type="range" v-model="amount" min="1" max="120" step="1" >
				<label class="range_number_label">{{ amount }}</label>
			</div>
			<div class="input_bar">
				<label>Particle Lifetime</label>
				<input type="range" v-model="particle_lifetime" min="0.1" max="10" step="0.1" >
				<label class="range_number_label">{{ particle_lifetime }}</label>
			</div>
		</div>

		<div class="input_group">
			<h4>Physics</h4>
			<ul class="preset_option_list">
				<li @click="set('collision', 'none')" :class="{selected: collision == 'none'}">
					<CircleSlash :size="38" :stroke-width="1" />
					None
				</li>
				<li @click="set('collision', 'solid')" :class="{selected: collision == 'solid'}">
					<Cuboid :size="38" :stroke-width="1" />
					Solid
				</li>
				<li @click="set('collision', 'smoke')" :class="{selected: collision == 'smoke'}">
					<Cloud :size="38" :stroke-width="1" />
					Smoke
				</li>
				<li @click="set('collision', 'ball')" :class="{selected: collision == 'ball'}">
					<Aperture :size="38" :stroke-width="1" />
					Ball
				</li>
				<li @click="set('collision', 'paper')" :class="{selected: collision == 'paper'}">
					<Scroll :size="38" :stroke-width="1" />
					Paper
				</li>
			</ul>
		</div>

		<div class="input_group">
			<h4>Sprite</h4>
			<ul class="preset_option_list">
				<li @click="set('sprite', 'ball')" :class="{selected: sprite == 'ball'}">
					<img :src="sprites.SpriteBall" height="45" />
					Ball
				</li>
				<li @click="set('sprite', 'dirt')" :class="{selected: sprite == 'dirt'}">
					<img :src="sprites.SpriteDirt" height="45" />
					Dirt
				</li>
				<li @click="set('sprite', 'leaves')" :class="{selected: sprite == 'leaves'}">
					<img :src="sprites.SpriteLeaves" height="45" />
					Leaves
				</li>
				<li @click="set('sprite', 'smoke')" :class="{selected: sprite == 'smoke'}">
					<img :src="sprites.SpriteSmoke" height="45" class="frames_8" />
					Smoke
				</li>
				<li @click="set('sprite', 'dust')" :class="{selected: sprite == 'dust'}">
					<img :src="sprites.SpriteDust" height="45" class="frames_8" />
					Dust
				</li>
				<li @click="set('sprite', 'sparkle')" :class="{selected: sprite == 'sparkle'}">
					<img :src="sprites.SpriteSparkle" height="45" class="frames_4" />
					Sparkle
				</li>
				<li @click="set('sprite', 'magic')" :class="{selected: sprite == 'magic'}">
					<img :src="sprites.SpriteMagic" height="45" class="frames_8" />
					Magic
				</li>
			</ul>
			<div class="input_bar">
				<label for="quick_rotation_checkbox">Random Rotation</label>
				<checkbox id="quick_rotation_checkbox" v-model="random_rotation" />
			</div>
			<div class="input_bar">
				<label for="quick_lighting_checkbox">Glow in the dark</label>
				<checkbox id="quick_lighting_checkbox" v-model="lighting" />
			</div>
		</div>
	</div>
</template>

<script>

import {
	CircleSlash,
	Aperture,
	Scroll,
	Cloud,
	Cuboid,
	Loader,
	CloudRain,
	Torus,
	Magnet,
	Bomb,
	Timer,
} from 'lucide-vue'
import Checkbox from '../Form/Checkbox.vue'
import { Texture } from '../../texture_edit';

import SpriteBall from '../../../assets/ball.png'
import SpriteDirt from '../../../assets/dirt.png'
import SpriteLeaves from '../../../assets/leaves.png'
import SpriteSmoke from '../../../assets/smoke.png'
import SpriteDust from '../../../assets/dust.png'
import SpriteSparkle from '../../../assets/sparkle.png'
import SpriteMagic from '../../../assets/magic.png'
import { QuickSetup } from '../../emitter';
//SpriteBall = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAw0lEQVQ4ja2RsQ3CMBREzxaioU+DaBkDRmAQKiTGoGUQJBaAKSKKuEBIVio3NDRQnfX9bSdIcJVj/3d3doAfZWoHu3P/5rprA077ZXE22yQ4X0wBAI/7K5oAyIyMhglSNKiZ2CG4ps3hFq9nhwZlek2W6WMw6wfnEZyPLaw8rCVKWGvybTL17Pv8CqXBrg3JXnA+gwHxG+XLarE6DWZNg8txZZIGclB+a7jagC3GAJmeGWgTXRtAAhcNqPX2mryJBv+mD2GrgcizxUizAAAAAElFTkSuQmCC`

const PRESETS = {
	shape: {
		sphere: {
			'emitter.shape.mode': 'sphere',
			'emitter.shape.radius': '1',
			'emitter.shape.surface_only': false,
			'motion.motion.direction_mode': 'outwards',
			'emitter.shape.offset': ['0', '0', '0'],
			'motion.motion.linear_acceleration': ['0', '0', '0'],
			'motion.motion.linear_speed': '3',
		},
		rain: {
			'emitter.shape.mode': 'disc',
			'emitter.shape.radius': '6',
			'emitter.shape.surface_only': false,
			'motion.motion.direction_mode': 'direction',
			'motion.motion.direction': ['0', '-1', '0'],
			'emitter.shape.offset': ['0', '6', '0'],
			'motion.motion.linear_acceleration': ['0', '-6', '0'],
			'motion.motion.linear_speed': '5',
		},
		ring: {
			'emitter.shape.mode': 'disc',
			'emitter.shape.radius': '3',
			'emitter.shape.surface_only': true,
			'motion.motion.direction_mode': 'direction',
			'motion.motion.direction': ['0', '1', '0'],
			'emitter.shape.offset': ['0', '0.5', '0'],
			'motion.motion.linear_acceleration': ['0', '0', '0'],
			'motion.motion.linear_speed': 'math.random(1, 4)',
		},
		gravitate: {
			'emitter.shape.mode': 'sphere',
			'emitter.shape.radius': '2',
			'emitter.shape.surface_only': true,
			'motion.motion.direction_mode': 'inwards',
			'motion.motion.linear_speed': '2',
			'emitter.shape.offset': ['0', '0', '0'],
			'motion.motion.linear_acceleration': ['0', '0', '0'],
			'lifetime.lifetime.max_lifetime': '1',
		}
	},
	timing: {
		burst: {
			'emitter.rate.mode': 'instant',
			'emitter.rate.amount': '100',
			'emitter.lifetime.mode': 'once',
			'emitter.lifetime.active_time': '1',
		},
		steady: {
			'emitter.rate.mode': 'steady',
			'emitter.rate.rate': '60',
			'emitter.rate.maximum': '400',
			'emitter.lifetime.mode': 'once',
			'emitter.lifetime.active_time': '1',
		}
	},
	sprite:{
		ball: {
			'appearance.appearance.size': ['0.4', '0.4'],
			'texture.uv.size': [16, 16],
			'texture.uv.uv': [0, 0],
			'texture.uv.uv_size': [16, 16],
			'texture.uv.mode': 'full',
		},
		dirt: {
			'appearance.appearance.size': ['0.5', '0.5'],
			'texture.uv.size': [16, 16],
			'texture.uv.uv': [0, 0],
			'texture.uv.uv_size': [16, 16],
			'texture.uv.mode': 'full',
		},
		leaves: {
			'appearance.appearance.size': ['0.25', '0.25'],
			'texture.uv.size': [16, 16],
			'texture.uv.uv': ['Math.floor(v.particle_random_3 * 2) * 8' , 'Math.floor(v.particle_random_4 * 2) * 8'],
			'texture.uv.uv_size': [8, 8],
			'texture.uv.mode': 'static',
		},
		smoke: {
			'appearance.appearance.size': ['0.5', '0.5'],
			'texture.uv.size': [16, 128],
			'texture.uv.uv': [0, 0],
			'texture.uv.uv_size': [16, 16],
			'texture.uv.uv_size': [16, 16],
			'texture.uv.mode': 'animated',
			'texture.uv.uv_step': [0, 16],
			'texture.uv.frames_per_second': '12',
			'texture.uv.max_frame': '8',
			'texture.uv.stretch_to_lifetime': true,
			'texture.uv.loop': false,
		},
		dust: {
			'appearance.appearance.size': ['0.3', '0.3'],
			'texture.uv.size': [8, 64],
			'texture.uv.uv': [0, 0],
			'texture.uv.uv_size': [8, 8],
			'texture.uv.uv_size': [8, 8],
			'texture.uv.mode': 'animated',
			'texture.uv.uv_step': [0, 8],
			'texture.uv.frames_per_second': '12',
			'texture.uv.max_frame': '8',
			'texture.uv.stretch_to_lifetime': true,
			'texture.uv.loop': false,
		},
		sparkle: {
			'appearance.appearance.size': ['0.5', '0.5'],
			'texture.uv.size': [16, 64],
			'texture.uv.uv': [0, 0],
			'texture.uv.uv_size': [16, 16],
			'texture.uv.mode': 'animated',
			'texture.uv.uv_step': [0, 16],
			'texture.uv.frames_per_second': '15',
			'texture.uv.max_frame': '4',
			'texture.uv.stretch_to_lifetime': false,
			'texture.uv.loop': true,
		},
		magic: {
			'appearance.appearance.size': ['0.25', '0.25'],
			'texture.uv.size': [16, 128],
			'texture.uv.uv': ['Math.floor(v.particle_random_3 * 2) * 8' , 'Math.floor(v.particle_random_4 * 2) * 8'],
			'texture.uv.uv_size': [8, 8],
			'texture.uv.mode': 'animated',
			'texture.uv.uv_step': [0, 16],
			'texture.uv.frames_per_second': '12',
			'texture.uv.max_frame': '8',
			'texture.uv.stretch_to_lifetime': true,
			'texture.uv.loop': false,
		}
	},
	collision: {
		none: {
			'motion.motion.linear_acceleration': ['', '', ''],
			'motion.motion.linear_drag_coefficient': 0,
			'motion.collision.collision_radius': 0,
			'motion.collision.collision_drag': 0,
			'motion.collision.coefficient_of_restitution': 0,
			'motion.collision.enabled': '',
			'motion.collision.expire_on_contact': false,
		},
		solid: {
			'motion.motion.linear_acceleration': [0, -10, 0],
			'motion.motion.linear_drag_coefficient': 0.1,
			'motion.collision.collision_radius': 0.2,
			'motion.collision.collision_drag': 1,
			'motion.collision.coefficient_of_restitution': 0.3,
			'motion.collision.enabled': '',
			'motion.collision.expire_on_contact': false,
		},
		smoke: {
			'motion.motion.linear_acceleration': [0, 1, 0],
			'motion.motion.linear_drag_coefficient': 4,
			'motion.collision.collision_radius': 0.2,
			'motion.collision.collision_drag': 0.4,
			'motion.collision.coefficient_of_restitution': 0,
			'motion.collision.enabled': '',
			'motion.collision.expire_on_contact': false,
		},
		ball: {
			'motion.motion.linear_acceleration': [0, -10, 0],
			'motion.motion.linear_drag_coefficient': 0.2,
			'motion.collision.collision_radius': 0.2,
			'motion.collision.collision_drag': 0.2,
			'motion.collision.coefficient_of_restitution': 0.6,
			'motion.collision.enabled': '',
			'motion.collision.expire_on_contact': false,
		},
		paper: {
			'motion.motion.linear_acceleration': ["math.sin(v.particle_age * 90)", -10, "math.cos(v.particle_age * 40)"],
			'motion.motion.linear_drag_coefficient': 5,
			'motion.collision.collision_radius': 0.2,
			'motion.collision.collision_drag': 10,
			'motion.collision.coefficient_of_restitution': 0,
			'motion.collision.enabled': '',
			'motion.collision.expire_on_contact': false,
		},
	}
};

const DEFAULTS = {
	shape: '',
	timing: '',
	speed: 0,
	amount: 4,
	particle_lifetime: 2,
	sprite: '',
	lighting: true,
	random_rotation: false,
	collision: 'none',
}

export default {
	name: 'quick-setup',
	components: {
		Checkbox,
		CircleSlash,
		Aperture,
		Scroll,
		Cloud,
		Cuboid,
		Loader,
		CloudRain,
		Torus,
		Magnet,
		Bomb,
		Timer,
	},
	props: {
		input: Object,
		data: Object
	},
	data() {return {
		sprites: {
			SpriteBall,
			SpriteDirt,
			SpriteLeaves,
			SpriteSmoke,
			SpriteDust,
			SpriteSparkle,
			SpriteMagic
		},
		
		shape: DEFAULTS.shape,
		timing: DEFAULTS.timing,
		speed: DEFAULTS.speed,
		amount: DEFAULTS.amount,
		particle_lifetime: DEFAULTS.particle_lifetime,
		sprite: DEFAULTS.sprite,
		lighting: DEFAULTS.lighting,
		random_rotation: DEFAULTS.random_rotation,
		collision: DEFAULTS.collision,
	}},
	watch: {
		speed(value) {
			this.setInput('motion.motion.linear_speed', value);
		},
		amount(value) {
			let steady = this.timing != 'burst';
			this.setInput('emitter.rate.'+(steady?'rate':'amount'), value);
		},
		particle_lifetime(value) {
			this.setInput('lifetime.lifetime.max_lifetime', value);
		},
		lighting(value) {
			this.setInput('appearance.appearance.light', !value);
		},
		random_rotation(value) {
			this.setInput('motion.rotation.initial_rotation', value ? 'math.random(-180, 180)' : '');
		}
	},
	methods: {
		setInput(path, value) {
			path = path.split('.');
			let input = this.data[path[0]][path[1]].inputs[path[2]];
			if (input) {
				if (input.type == 'molang') {
					if (value instanceof Array) {
						value.forEach((v, i) => {
							value[i] = v.toString();
						})
					} else if (typeof value == 'number') {
						value = value.toString();
					}
				}
				input.set(value);
			}
		},
		set(key, value) {
			this[key] = value;
			let preset = PRESETS[key][value];
			for (let preset_path in preset) {
				let path = preset_path.split('.');
				let input = this.data[path[0]][path[1]].inputs[path[2]];
				let value = preset[preset_path];

				if (preset_path == 'motion.motion.linear_speed' && !isNaN(value)) this.speed = value;
				if (preset_path == 'emitter.rate.rate') this.amount = value;
				if (preset_path == 'emitter.rate.amount') this.amount = value;
				if (preset_path == 'lifetime.lifetime.max_lifetime') this.particle_lifetime = value;
				if (preset_path == 'appearance.appearance.light') this.lighting = value;

				if (input) {
					if (input.type == 'molang') {
						if (value instanceof Array) {
							value.forEach((v, i) => {
								value[i] = v.toString();
							})
						} else if (typeof value == 'number') {
							value = value.toString();
						}
					}
					input.set(value);
				}
			}

			if (key == 'sprite') {
				let source = '';
				switch (value) {
					case 'ball': source = SpriteBall; break;
					case 'dirt': source = SpriteDirt; break;
					case 'leaves': source = SpriteLeaves; break;
					case 'smoke': source = SpriteSmoke; break;
					case 'dust': source = SpriteDust; break;
					case 'sparkle': source = SpriteSparkle; break;
					case 'magic': source = SpriteMagic; break;
				}
				Texture.source = source;
				Texture.internal_changes = true;
				Texture.update();
				Texture.updateCanvasFromSource();
			}
		},
		resetAll() {
			this.shape = DEFAULTS.shape;
			this.timing = DEFAULTS.timing;
			this.speed = DEFAULTS.speed;
			this.amount = DEFAULTS.amount;
			this.particle_lifetime = DEFAULTS.particle_lifetime;
			this.sprite = DEFAULTS.sprite;
			this.lighting = DEFAULTS.lighting;
			this.random_rotation = DEFAULTS.random_rotation;
			this.collision = DEFAULTS.collision;
		}
	},
	mounted() {
		QuickSetup.resetAll = () => {
			this.resetAll();
		}
	}
}
</script>


<style scoped>
	.preset_option_list {
		display: flex;
		gap: 2px;
		overflow-x: auto;
	}
	.preset_option_list > li {
		width: 80px;
		padding: 8px;
		text-align: center;
		cursor: pointer;
	}
	.preset_option_list > li:hover {
		color: var(--color-highlight);
	}
	.preset_option_list > li.selected {
		background-color: var(--color-bar);
	}
	.preset_option_list > li > svg {
		display: block;
		margin: auto;
	}
	.preset_option_list > li > img {
		pointer-events: none;
		aspect-ratio: 1/1;
		object-fit: cover;
		object-position: bottom;
	}
	.preset_option_list > li:hover > img.frames_8 {
		animation: 1s step-end 0s infinite normal thumb_animation;
	}
	.preset_option_list > li:hover > img.frames_4 {
		animation: 300ms step-end 0s infinite normal thumb_animation_4;
	}
	@keyframes thumb_animation {
		0% {
			object-position: 0 0;
		}
		12.5% {
			object-position: 0 calc(100% / 7 * 1);
		}
		25% {
			object-position: 0 calc(100% / 7 * 2);
		}
		37.5% {
			object-position: 0 calc(100% / 7 * 3);
		}
		50% {
			object-position: 0 calc(100% / 7 * 4);
		}
		62.5% {
			object-position: 0 calc(100% / 7 * 5);
		}
		75% {
			object-position: 0 calc(100% / 7 * 6);
		}
		87.5% {
			object-position: 0 calc(100% / 7 * 7);
		}
		100% {
			object-position: 0 0;
		}
	}
	@keyframes thumb_animation_4 {
		0% {
			object-position: 0 0;
		}
		25% {
			object-position: 0 calc(100% / 3 * 1);
		}
		50% {
			object-position: 0 calc(100% / 3 * 2);
		}
		75% {
			object-position: 0 calc(100% / 3 * 3);
		}
		100% {
			object-position: 0 0;
		}
	}
	.input_bar {
		display: flex;
		align-items: center;
		margin: 10px 14px;
		gap: 8px;
	}
	.input_bar label {
		display: flex;
		align-items: center;
		margin-block: 0;
	}
	.input_bar input[type=range] {
		flex-grow: 1;
	}
	.input_bar label.range_number_label {
		width: 46px;
		text-align: center;
		display: block;
	}
</style>