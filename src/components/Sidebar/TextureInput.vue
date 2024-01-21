<template>
	<div class="texture_input" :tool="tool">
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

			<span class="undo_controls">
				<div class="tool" @click="Texture.undo()" title="Undo">
					<Undo />
				</div>
				<div class="tool" @click="Texture.redo()" title="Redo">
					<Redo />
				</div>
			</span>

			<div class="color_preview" @click.stop="color_picker_open = !color_picker_open">
				<div class="color_preview_color" :style="{backgroundColor: paint_color.hex8}"></div>
			</div>
		</div>
		<div id="color_picker_overlay" v-if="color_picker_open" @click.stop>
			<color-picker v-model="paint_color" @change="paint_color = $event" />
		</div>

		<div class="texture_viewport"
			ref="texture_viewport"
			@mouseenter="onMouseEnter($event)"
			@mousemove="onMouseMove($event)"
			@mouseleave="onMouseLeave($event)"
			@mousedown="onMouseDown($event)"
			@contextmenu.prevent
			:style="{'--zoom': zoom, '--size': size+'px', '--offset-x': offset[0]+'px', '--offset-y': offset[1]+'px'}"
			@mousewheel="onMouseWheel($event)"
		>
			<div class="input_texture_wrapper checkerboard" :class="{vertical: isVertical()}"
				:style="{left: offset[0]+'px', top: offset[1]+'px', height: height + 'px'}"
				ref="texture_wrapper"
			>
				<div ref="canvas_wrapper"></div>
				<div class="uv_preview uv_perimeter_preview" title="UV Perimeter" @mousedown="dragUV($event)" :style="calculateUVPerimeter()"></div>
				<div class="uv_preview uv_sample_preview" title="UV Sample" @mousedown="dragUV($event)" :style="calculateUVSample()">
					<div class="uv_preview_size_handle" @mousedown.stop="dragUV($event, true)" v-if="tool == 'select'" />
				</div>
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
	Undo,
	Redo,

} from 'lucide-vue'
import Input from '../../input'
import Molang from 'molangjs'
import { Texture } from '../../texture_edit';
import { trimFloatNumber } from '../../util'
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
		Undo,
		Redo,
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
		zoom: 1,
		viewport_size: 256,
		offset: [0, 0],
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
			let initial_offset = this.offset.slice();
			if (event.button == 2 || event.button == 1) {
				event.preventDefault();
				let onMove = (e2) => {
					e2.preventDefault();
					let offset = [
						initial_offset[0] + (e2.clientX - event.clientX),
						initial_offset[1] + (e2.clientY - event.clientY),
					];
					this.offset.splice(0, 2, ...offset);
				}
				let onEnd = (e2) => {
					document.removeEventListener('mousemove', onMove);
					document.removeEventListener('mouseup', onEnd);
				}
				document.addEventListener('mousemove', onMove);
				document.addEventListener('mouseup', onEnd);
				return;
			}

			let context = {
				wrapper: this.$refs.texture_wrapper,
				position: this.pixel_position,
				tool: this.tool,
				color: this.paint_color.hex8
			};
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
			let frame_width = this.width;
			let frame_height = this.height;
			let img_width = this.input.image_element.naturalWidt || Texture.canvas.width;
			let img_height = this.input.image_element.naturalHeight || Texture.canvas.height;
			let rect = this.$refs.texture_wrapper.getBoundingClientRect();
			this.cursor_position.x = Math.floor((event.clientX-1-rect.left) / frame_width * uv_width);
			this.cursor_position.y = Math.floor((event.clientY-1-rect.top) / frame_height * uv_height);
			this.pixel_position.x = Math.floor((event.clientX-1-rect.left) / frame_width * img_width);
			this.pixel_position.y = Math.floor((event.clientY-1-rect.top) / frame_height * img_height);
		},
		onMouseWheel(event) {
			event.preventDefault();
			this.onMouseMove(event);

			let initial_zoom = this.zoom;
			if (event.deltaY > 1) {
				this.zoom = this.zoom / 1.1;
			} else {
				this.zoom = this.zoom * 1.1;
			}
			this.zoom = Math.clamp(this.zoom, 0.5, 8);

			if (this.zoom != initial_zoom) {
				let rect = this.$refs.texture_wrapper.getBoundingClientRect();
				let mouse_pos = [
					(event.clientX-1-rect.left),
					(event.clientY-1-rect.top),
				];
				let zoom_offset = 1 - (this.zoom / initial_zoom);
				let is_wider_than_viewport = this.$refs.texture_wrapper.clientWidth > this.$refs.texture_viewport.clientWidth;
				this.offset.splice(0, 2, 
					this.offset[0] + mouse_pos[0] * zoom_offset * (is_wider_than_viewport ? 1 : 0),
					this.offset[1] + mouse_pos[1] * zoom_offset,
				)
			}
		},
		isVertical() {
			return false;
			return this.input.image_element.naturalWidth < this.input.image_element.naturalHeight;
		},
		offsetUVValue(value, amount) {
			if (!amount) {
				return value;
			}
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
				} else if (amount) {
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
			let frame_width = this.width;
			let frame_height = this.height;
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
			let frame_width = this.width;
			let frame_height = this.height;

			return {
				left: (bounding_box[0] / uv_width * frame_width)+'px',
				top: (bounding_box[1] / uv_height * frame_height)+'px',
				width: ((bounding_box[2] - bounding_box[0]) / uv_width * frame_width)+'px',
				height: ((bounding_box[3] - bounding_box[1]) / uv_height * frame_height)+'px',
			};
		}
	},
	computed: {
		size() {
			return this.viewport_size * this.zoom;
		},
		width() {
			return this.viewport_size * this.zoom;
		},
		ratio() {
			if (this.inputs && this.inputs.image_element && this.inputs.image_element.naturalWidth) {
				return this.input.image_element.naturalWidth / this.input.image_element.naturalHeight;
			} else if (Texture.canvas) {
				return Texture.canvas.width / Texture.canvas.height;
			} else {
				return 1;
			}
		},
		height() {
			console.log(this.ratio)
			return this.viewport_size * this.zoom / this.ratio;
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
	.texture_viewport {
		display: block;
		--size: 256px;
		width: 100%;
		overflow: hidden;
		height: 258px;
		margin-top: 8px;
		flex-shrink: 0;
	}
	.input_texture_wrapper {
		height: auto;
		height: -webkit-fill-available;
		width: var(--size);
		margin: auto;
		border: 1px solid var(--color-border);
		box-sizing: content-box;
		position: relative;
		overflow: visible;
		cursor: crosshair;
	}
	.texture_input[tool="select"] .input_texture_wrapper {
		cursor: default;
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
	.texture_input[tool="select"] .uv_preview:hover {
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
		display: none;
	}
	.texture_viewport:hover .uv_preview_size_handle {
		display: block;
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
	.undo_controls {
		margin: auto;
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