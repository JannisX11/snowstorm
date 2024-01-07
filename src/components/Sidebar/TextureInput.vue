<template>
	<div class="texture_input">
		<div class="meta">
			<template v-if="input.allow_upload">
				<div class="tool" v-on:click="input.reset()"><i class="unicode_icon">{{'\u2A09'}}</i></div>
				<input id="particle-texture-image" type="file" accept=".png" v-on:change="input.change($event)">
			</template>
			<template v-if="!input.allow_upload">
				<div class="tool" style="width: auto;" v-on:click="input.updatePreview()" title="Reload"><i class="unicode_icon" style="display: inline;">⟳</i> Reload</div>
			</template>
		</div>
		<div class="input_texture_wrapper checkerboard" :class="{vertical: isVertical()}" ref="texture_wrapper" @mouseenter="onMouseEnter($event)" @mousemove="onMouseMove($event)" @mouseleave="onMouseLeave($event)">
			<div v-html="input.image_element.outerHTML"></div>
			<div class="uv_preview uv_perimeter_preview" :style="calculateUVPerimeter()"></div>
			<div class="uv_preview uv_sample_preview" :style="calculateUVSample()"></div>
		</div>
		<div class="texture_info_bar">
			<div>{{ input.image_element.naturalWidth }} x {{ input.image_element.naturalHeight }} px</div>
			<div>{{ cursor_position.active ? (cursor_position.x + ' x ' + cursor_position.y) : '' }}</div>
		</div>
	</div>
</template>

<script>

import Input from '../../input'
import Molang from 'molangjs'
let parser = new Molang();

export default {
	name: 'texture-input',
	components: {
	},
	props: {
		input: Input,
		data: Object
	},
	data() {return {
		cursor_position: {
			x: 0,
			y: 0,
			active: false
		}
	}},
	methods: {
		onMouseEnter(event) {
			this.cursor_position.active = true;
		},
		onMouseLeave(event) {
			this.cursor_position.active = false;
		},
		onMouseMove(event) {
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			let frame_width = 256;
			let frame_height = 256;
			let rect = this.$refs.texture_wrapper.getBoundingClientRect();
			this.cursor_position.x = Math.floor((event.clientX-1-rect.left) / frame_width * uv_width);
			this.cursor_position.y = Math.floor((event.clientY-1-rect.top) / frame_height * uv_height);
		},
		isVertical() {
			return this.input.image_element.naturalWidth < this.input.image_element.naturalHeight;
		},
		calculateUVSample() {
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			let offset = uv_inputs.uv.value.map(v => parser.parse(v));
			let size = uv_inputs.uv_size.value.map(v => parser.parse(v));
			let frame_width = 256;
			let frame_height = 256;
			if (this.isVertical()) {
				frame_height /= this.input.image_element.naturalWidth / this.input.image_element.naturalHeight
			}

			return {
				left: (offset[0] / uv_width * frame_width)+'px',
				top: (offset[1] / uv_height * frame_height)+'px',
				width: (size[0] / uv_width * frame_width)+'px',
				height: (size[1] / uv_height * frame_height)+'px',
			};
		},
		calculateUVPerimeter() {
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			let bounding_box = [uv_width, uv_height, 0, 0];
			for (let random = 0; random < 1; random += 0.249999999) {
				let vars = {
					'variable.particle_random_1': random,
					'variable.particle_random_2': random,
					'variable.particle_random_3': random,
					'variable.particle_random_4': random,
					'variable.emitter_random_1': random,
					'variable.emitter_random_2': random,
					'variable.emitter_random_3': random,
					'variable.emitter_random_4': random,
				}
				let offset = uv_inputs.uv.value.map(v => parser.parse(v, vars));
				let size = uv_inputs.uv_size.value.map(v => parser.parse(v, vars));
				bounding_box[0] = Math.min(bounding_box[0], offset[0], offset[0] + size[0]);
				bounding_box[1] = Math.min(bounding_box[1], offset[1], offset[1] + size[1]);
				bounding_box[2] = Math.max(bounding_box[2], offset[0], offset[0] + size[0]);
				bounding_box[3] = Math.max(bounding_box[3], offset[1], offset[1] + size[1]);
			}
			let frame_width = 256;
			let frame_height = 256;
			if (this.isVertical()) {
				frame_height /= this.input.image_element.naturalWidth / this.input.image_element.naturalHeight
			}

			return {
				left: (bounding_box[0] / uv_width * frame_width)+'px',
				top: (bounding_box[1] / uv_height * frame_height)+'px',
				width: ((bounding_box[2] - bounding_box[0]) / uv_width * frame_width)+'px',
				height: ((bounding_box[3] - bounding_box[1]) / uv_height * frame_height)+'px',
			};
		}
	}
}
</script>


<style scoped>
	.texture_input {
		width: 100%;
	}
	input#image {
		width: calc(100% - 40px);
	}
	.input_right.image {
		flex-direction: column;
	}
	.input_texture_wrapper {
		--size: 256px;
		display: block;
		height: var(--size);
		width: var(--size);
		margin: auto;
		margin-top: 8px;
		flex-shrink: 0;
		border: 1px solid var(--color-border);
		box-sizing: content-box;
		position: relative;
		overflow: hidden;
		cursor: crosshair;
	}
	.input_texture_wrapper.vertical {
		width: calc(var(--size) + 8px);
		overflow-y: auto;
	}
	.uv_preview {
		position: absolute;
		top: 0;
		outline: 1px solid var(--color-border);
	}
	.uv_preview:hover {
		outline-color: var(--color-highlight);
	}
	.uv_sample_preview {
		border: 1px solid var(--color-accent);
	}
	.uv_perimeter_preview {
		border: 1px solid var(--color-text);
	}
	.texture_info_bar {
		display: flex;
	}
	.texture_info_bar > * {
		flex: 1 1 80px;
		text-align: center;
		padding: 2px;
	}
</style>
<style>
	.input_texture_wrapper img {
		width: 100%;
		background-size: contain;
		background-repeat: no-repeat;
	}
</style>