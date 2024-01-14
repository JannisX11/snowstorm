<template>
	<div class="texture_input">
		<div class="toolbar">
			<div class="tool" @click="selectTool('select')" :class="{selected: tool == 'select'}" title="Select">
				<MousePointer />
			</div>
			<div class="tool" @click="selectTool('brush')" :class="{selected: tool == 'brush'}" title="Brush">
				<Brush />
			</div>
			<div class="tool" @click="selectTool('eraser')" :class="{selected: tool == 'eraser'}" title="Eraser">
				<Eraser />
			</div>
			<div class="tool" @click="selectTool('fill_tool')" :class="{selected: tool == 'fill_tool'}" title="Paint Bucket">
				<PaintBucket />
			</div>
			<div class="tool" @click="selectTool('color_picker')" :class="{selected: tool == 'color_picker'}" title="Color Picker">
				<Pipette />
			</div>

			<div class="color_preview" @click.stop="color_picker_open = !color_picker_open">
				<div class="color_preview_color" :style="{backgroundColor: paint_color.hex8}"></div>
			</div>
		</div>
		<div id="color_picker_overlay" v-if="color_picker_open" @click.stop>
			<color-picker v-model="paint_color" @change="paint_color = $event" />
		</div>
		<div class="input_texture_wrapper checkerboard" :class="{vertical: isVertical()}"
			ref="texture_wrapper"
			@mouseenter="onMouseEnter($event)"
			@mousemove="onMouseMove($event)"
			@mouseleave="onMouseLeave($event)"
			@mousedown="onMouseDown($event)"
		>
			<div ref="canvas_wrapper"></div>
			<div class="uv_preview uv_perimeter_preview" @mousedown="dragUV($event)" :style="calculateUVPerimeter()"></div>
			<div class="uv_preview uv_sample_preview" @mousedown="dragUV($event)" :style="calculateUVSample()">
				<div class="uv_preview_size_handle" @mousedown.stop="dragUV($event, true)" v-if="tool == 'select'" />
			</div>
		</div>
		<div class="texture_info_bar">
			<div>{{ input.image_element.naturalWidth }} x {{ input.image_element.naturalHeight }} px</div>
			<div>{{ cursor_position.active ? (cursor_position.x + ' x ' + cursor_position.y) : '' }}</div>
		</div>
		<div class="meta toolbar">
			<template v-if="input.allow_upload">
				<div class="tool" v-on:click="input.reset()"><X /></div>
				<input id="particle-texture-image" type="file" accept=".png" v-on:change="input.change($event)">
			</template>
			<template v-if="!input.allow_upload">
				<div class="tool" style="width: auto;" v-on:click="input.updatePreview()" title="Reload"><i class="unicode_icon" style="display: inline;">⟳</i> Reload</div>
			</template>
			<div class="tool" @click="newTexture()" title="New Texture">
				<PlusSquare />
			</div>
			<div class="tool" v-if="Texture.internal_changes" @click="saveTexture()" title="Save">
				<Save />
			</div>
		</div>
	</div>
</template>

<script>

import VueColor from 'vue-color'
import {
	MousePointer,
	Brush,
	Eraser,
	PaintBucket,
	Pipette,
	PlusSquare,
	Save,
	X,

} from 'lucide-vue'
import Input from '../../input'
import Molang from 'molangjs'
import { Texture } from '../../texture_edit';
let parser = new Molang();

/*
	New
	Import
	Save
	Tools
		Select
		Paint
		Erase
		Bucket
	Color Picker

*/

export default {
	name: 'texture-input',
	components: {
		'color-picker': VueColor.Chrome,
		MousePointer,
		Brush,
		Eraser,
		PaintBucket,
		Pipette,
		PlusSquare,
		Save,
		X,
	},
	props: {
		input: Input,
		data: Object
	},
	data() {return {
		Texture,
		paint_color: {
			hex8: '#ffffffff'
		},
		tool: 'select',
		color_picker_open: false,
		cursor_position: {
			x: 0,
			y: 0,
			active: false
		},
		pixel_position: {
			x: 0,
			y: 0
		}
	}},
	methods: {
		newTexture() {
			Texture.createEmpty();
		},
		saveTexture() {
			if (!Texture.source) return;
			Texture.save();
		},
		selectTool(tool) {
			this.tool = tool;
		},
		onMouseEnter(event) {
			this.cursor_position.active = true;
		},
		onMouseLeave(event) {
			this.cursor_position.active = false;
		},
		onMouseDown(event) {
			console.log(this.tool)
			let context = {
				wrapper: this.$refs.texture_wrapper,
				position: this.pixel_position,
				tool: this.tool,
				color: this.paint_color.hex8
			};
			console.log(event, event.altKey, this.tool)
			if (event.altKey || this.tool == 'color_picker') {
				let color = Texture.pickColor(event, context);
				this.paint_color.hex8 = color;

			} else if (this.tool == 'brush' || this.tool == 'eraser') {
				Texture.usePaintTool(event, context);
			} else if (this.tool == 'fill_tool') {
				Texture.useFillTool(event, context);
			}
		},
		onMouseMove(event) {
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			let frame_width = 256;
			let frame_height = 256;
			let rect = this.$refs.texture_wrapper.getBoundingClientRect();
			this.cursor_position.x = Math.floor((event.clientX-1-rect.left) / frame_width * uv_width);
			this.cursor_position.y = Math.floor((event.clientY-1-rect.top) / frame_height * uv_height);
			this.pixel_position.x = Math.floor((event.clientX-1-rect.left) / frame_width * this.input.image_element.naturalWidth);
			this.pixel_position.y = Math.floor((event.clientY-1-rect.top) / frame_height * this.input.image_element.naturalHeight);
		},
		isVertical() {
			return this.input.image_element.naturalWidth < this.input.image_element.naturalHeight;
		},
		offsetUVValue(value, amount) {
			//let value = '100 * 2';
			if (!value || value === '0') {
				return amount.toString();
			}
			if (typeof value == 'string' && !isNaN(value)) {
				value = parseFloat(value);
			}
			if (typeof value === 'number') {
				return value+amount
			}
			let start = value.match(/^-?\s*\d+(\.\d+)?\s*(\+|-)/);
			if (start) {
				let number = parseFloat( start[0].substr(0, start[0].length-1) ) + amount;
				if (number == 0) {
					value = value.substr(start[0].length + (value[start[0].length-1] == '+' ? 0 : -1));
					return value.trim();
				} else {
					return trimFloatNumber(number) + (start[0].substr(-2, 1) == ' ' ? ' ' : '') + value.substr(start[0].length-1);
				}
			} else {

				let end = value.match(/(\+|-)\s*\d*(\.\d+)?\s*$/)
				if (end) {
					let number = (parseFloat( end[0] ) + amount)
					return value.substr(0, end.index) + ((number.toString()).substr(0,1)=='-'?'':'+') + trimFloatNumber(number)
				} else {
					return trimFloatNumber(amount) +(value.substr(0,1)=='-'?'':'+')+ value
				}
			}
		},
		dragUV(e1, size) {
			if (this.tool != 'select') return;
			let target_input = this.data.texture.uv.inputs[size ? 'uv_size' : 'uv'];
			let initial_value = target_input.value.slice();
			let initial_coords = {
				x: this.cursor_position.x,
				y: this.cursor_position.y,
			};
			let last_coords = {
				x: this.cursor_position.x,
				y: this.cursor_position.y,
			};
			let onMove = (e2) => {
				let coords = this.cursor_position;
				if (last_coords.x == coords.x && last_coords.y == coords.y) return;

				let offset = [
					coords.x - initial_coords.x,
					coords.y - initial_coords.y,
				];
				target_input.set([
					this.offsetUVValue(initial_value[0], offset[0]).toString(),
					this.offsetUVValue(initial_value[1], offset[1]).toString(),
				]);

				last_coords.x = coords.x;
				last_coords.y = coords.y;
			}
			let onEnd = (e2) => {
				document.removeEventListener('mousemove', onMove);
				document.removeEventListener('mouseup', onEnd);
			}
			document.addEventListener('mousemove', onMove);
			document.addEventListener('mouseup', onEnd);
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
	},
	mounted() {
		document.addEventListener('click', () => {
			if (this.color_picker_open) this.color_picker_open = false;
		}, {passive: true});
		this.$refs.canvas_wrapper.append(Texture.canvas);
	}
}
</script>


<style scoped>
	.texture_input {
		width: 100%;
		position: relative;
		margin-top: 8px;
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
	.uv_preview_size_handle {
		position: absolute;
		bottom: -10px;
		right: -10px;
		width: 10px;
		height: 10px;
		outline: 1px solid var(--color-border);
		background-color: var(--color-text);
		cursor: se-resize;
	}
	.texture_info_bar {
		display: flex;
	}
	.texture_info_bar > * {
		flex: 1 1 80px;
		text-align: center;
		padding: 2px;
	}
	.toolbar {
		height: 34px;
		display: flex;
		margin-top: 6px;
		display: flex;
		align-items: center;
	}
	.tool {
		cursor: pointer;
		padding: 4px 4px;
		width: 40px;
		text-align: center;
		border-radius: 2px;
	}
	.tool.selected {
		background-color: var(--color-title);
		color: var(--color-highlight);
	}
	.tool:hover {
		outline-color: var(--color-highlight);
	}
	.color_preview {
		height: 100%;
		width: 34px;
		height: 34px;
		cursor: pointer;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		overflow: hidden;
		margin-left: auto;
		position: relative;
		background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==');
	}
	.color_preview_color {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
	#color_picker_overlay {
		position: absolute;
		z-index: 4;
		right: 0;
	}
</style>
<style>
	.input_texture_wrapper canvas {
		width: 100%;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
	}
</style>