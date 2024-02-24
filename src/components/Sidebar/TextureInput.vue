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
			@pointerenter="onMouseEnter($event)"
			@pointermove="onMouseMove($event)"
			@pointerleave="onMouseLeave($event)"
			@pointerdown="onMouseDown($event)"
			@contextmenu.prevent
			:style="{'--zoom': zoom, '--size': size+'px', '--height': height+'px', '--offset-x': offset[0]+'px', '--offset-y': offset[1]+'px'}"
			@mousewheel="onMouseWheel($event)"
		>
			<div class="input_texture_wrapper checkerboard"
				:style="{left: offset[0]+'px', top: offset[1]+'px', height: height + 'px'}"
				ref="texture_wrapper"
			>
				<div id="canvas_wrapper" ref="canvas_wrapper"></div>
				<template v-if="UVDefinitionMode() != 'full'">
					<div class="uv_preview uv_perimeter_preview" title="UV Perimeter" @pointerdown="dragUV($event)" :style="calculateUVPerimeter()"></div>
					<div class="uv_preview uv_sample_preview" title="UV Sample" @pointerdown="dragUV($event)" :style="calculateUVSample()">
						<div class="uv_preview_size_handle" @pointerdown.stop="dragUV($event, true)" v-if="tool == 'select'" />
					</div>
				</template>
				<div v-if="cursor_position.active && ['brush', 'eraser', 'color_picker'].includes(tool)" id="brush_outline" :style="getBrushOutlineStyle()"></div>
			</div>
			<div v-if="!viewportIsCentered() && zoom > 1" class="viewport_scrollbar horizontal" @pointerdown="slideScrollBar(0, $event)" :style="{left: getScrollBarOffset(0), width: (30 / zoom) + '%'}"></div>
			<div v-if="(zoom/ratio) > 1" class="viewport_scrollbar vertical" @pointerdown="slideScrollBar(1, $event)" :style="{top: getScrollBarOffset(1), height: (30 / (zoom/ratio)) + '%'}"></div>
		</div>
		<div class="texture_info_bar">
			<div class="info">{{ input.image_element.naturalWidth }} x {{ input.image_element.naturalHeight }} px</div>
			<div class="info">{{ cursor_position.active ? (cursor_position.x + ' x ' + cursor_position.y) : '' }}</div>
			<div class="info">{{ Math.round(zoom * 100) + '%' }}</div>
			<template v-if="UVDefinitionMode() == 'animated'">
				<div class="tool" @click="moveByFrame(-1)" title="Previous Frame">
					<ArrowBigLeft :size="20" />
				</div>
				<div class="tool" @click="moveByFrame(1)" title="Next Frame">
					<ArrowBigRight :size="20" />
				</div>
			</template>
			<div class="tool" @click="maximizeViewport()" title="Center Viewport">
				<Maximize :size="20" />
			</div>
		</div>
		<div class="meta toolbar">
			<template v-if="input.allow_upload">
				<div class="tool" v-on:click="Texture.reset()"><X /></div>
				<input id="particle-texture-image" type="file" accept=".png" v-on:change="input.change($event)">
			</template>
			<template v-if="!input.allow_upload">
				<div class="tool" style="width: auto;" v-on:click="reloadTexture()" title="Reload"><i class="unicode_icon" style="display: inline;">⟳</i> Reload</div>
			</template>
			<div class="tool" @click="newTexture()" title="New Texture">
				<PlusSquare />
			</div>
			<div class="tool" v-if="Texture.internal_changes" @click="saveTexture()" title="Save">
				<Save />
			</div>
		</div>

		<dialog id="new_texture_dialog" ref="new_texture_dialog" class="modal_dialog">
			<div class="form_bar"><label>Width</label><input type="number" v-model.number="new_texture_size[0]"></div>
			<div class="form_bar"><label>Height</label><input type="number" v-model.number="new_texture_size[1]"></div>
			<div class="button_bar">
				<button @click="newTextureConfirm()">Confirm</button>
				<button @click="$refs.new_texture_dialog.close()">Cancel</button>
			</div>
		</dialog>
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
	Maximize,
	ArrowBigLeft,
	ArrowBigRight,
	X,
	Undo,
	Redo,

} from 'lucide-vue'
import Input from '../../input'
import Molang from 'molangjs'
import { Texture } from '../../texture_edit';
import { trimFloatNumber } from '../../util'
import registerEdit from '../../edits'
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
		Maximize,
		ArrowBigLeft,
		ArrowBigRight,
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
		log: '',
		new_texture_size: [16, 16],
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
			let dialog = this.$refs.new_texture_dialog;
			dialog.showModal();
		},
		newTextureConfirm() {
			this.$refs.new_texture_dialog.close();
			Texture.createEmpty(this.new_texture_size[0], this.new_texture_size[1]);
		},
		saveTexture() {
			if (!Texture.source) return;
			Texture.save();
		},
		reloadTexture() {
			if (!Texture.source) return;
			Texture.reload();
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
			if (event.target.classList.contains('viewport_scrollbar')) return;

			/*pointer_cache.push(event);
			if (pointer_cache.length > 1) {
				return;
			}
			let last_pointer_events = [];
			let initial_distance;
			let initial_zoom = this.zoom;*/

			if (event.button == 2 || event.button == 1 || (this.tool == 'select' && event.pointerType == 'touch')) {

				let initial_offset = this.offset.slice();
				event.preventDefault();
				let onMove = (e2) => {
					e2.preventDefault();

					let offset = [
						initial_offset[0] + (e2.clientX - event.clientX),
						initial_offset[1] + (e2.clientY - event.clientY),
					];
					this.offset.splice(0, 2, ...offset);

					/*
					let index = pointer_cache.findIndex((cachedEv) => cachedEv.pointerId === e2.pointerId);
					if (index >= 0) last_pointer_events[index] = e2;
					if (index == 1) return;
					if (pointer_cache.length == 2 && last_pointer_events[1]) {
						let e2_other = last_pointer_events[1];
						let distance = Math.sqrt(Math.pow(e2.clientX - e2_other.clientX, 2) + Math.pow(e2.clientY - e2_other.clientY, 2));

						if (!initial_distance) {
							initial_distance = distance;
						} else {
							this.setZoom(initial_zoom * (distance / initial_distance));
						}
					};
					*/

				}
				let onEnd = (e2) => {
					document.removeEventListener('pointermove', onMove);
					document.removeEventListener('pointerup', onEnd);
					//pointer_cache.splice(0);
				}
				document.addEventListener('pointermove', onMove);
				document.addEventListener('pointerup', onEnd);
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
			let img_width = this.input.image_element.naturalWidth || Texture.canvas.width;
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

			if (event.ctrlKey || event.metaKey) {
				let zoom = this.zoom;
				if (event.deltaY > 1) {
					zoom = zoom / 1.1;
				} else {
					zoom = zoom * 1.1;
				}
				this.setZoom(zoom);

			} else {

				this.offset.splice(0, 2, this.offset[0], this.offset[1] - Math.sign(event.deltaY) * 50);
			}
		},
		setZoom(zoom) {
			let initial_zoom = this.zoom;
			if (zoom > 1 / 1.1 && zoom < 1.1) zoom = 1;
			zoom = Math.clamp(zoom, Math.min(0.5, this.ratio), 8);

			if (zoom != this.zoom) {
				this.zoom = zoom;
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
		viewportIsCentered() {
			return this.zoom == 1 && !this.offset[0] && !this.offset[1];
		},
		maximizeViewport() {
			if (this.viewportIsCentered()) {
				this.zoom = Math.min(1, this.ratio);
			} else {
				this.offset.splice(0, 2, 0, 0);
				this.zoom = 1;
			}
		},
		getScrollBarOffset(axis) {
			let position;
			if (axis == 1) {
				position =  (this.viewport_size-this.height) / 2;
				let factor = this.zoom / this.ratio;
				position = (position - this.offset[axis]) * 2 / factor;
			} else {
				let is_wider_than_viewport = this.$refs.texture_wrapper.clientWidth > this.$refs.texture_viewport.clientWidth;
				if (is_wider_than_viewport) {
					position = (this.$refs.texture_viewport.clientWidth -this.width) / 2;
				} else {
					position = 0;
				}
				let factor = this.$refs.texture_wrapper.clientWidth / this.$refs.texture_viewport.clientWidth;
				position = (position - this.offset[axis]) * 2 / factor;
			}
			return position + 'px';
		},
		slideScrollBar(axis, event) {
			let initial_offset = this.offset[axis];
			let pos_key = axis ? 'clientY' : 'clientX';
			let onMove = (e2) => {
				let factor = axis ? this.zoom / this.ratio : this.$refs.texture_wrapper.clientWidth / this.$refs.texture_viewport.clientWidth;
				let val = initial_offset - (e2[pos_key] - event[pos_key]) * factor;
				this.offset.splice(axis, 1, val);
			}
			let onEnd = (e2) => {
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onEnd);
			}
			document.addEventListener('pointermove', onMove);
			document.addEventListener('pointerup', onEnd);
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
			if (e1.button == 1 || e1.button == 2) return;
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
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onEnd);
				registerEdit('edit uv')
			}
			document.addEventListener('pointermove', onMove);
			document.addEventListener('pointerup', onEnd);
		},
		calculateUVSample() {
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			let offset = uv_inputs.uv.value.map(v => parser.parse(v));
			let size = uv_inputs.uv_size.value.map(v => parser.parse(v));
			let frame_width = this.width;
			let frame_height = this.height;
			/*if (this.isVertical()) {
				frame_height /= this.input.image_element.naturalWidth / this.input.image_element.naturalHeight
			}*/

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
		},
		moveByFrame(steps) {
			let uv_inputs = this.data.texture.uv.inputs;
			let step = uv_inputs.uv_step.value.map(v => parser.parse(v));
			let [uv_width, uv_height] = uv_inputs.size.value;
			let frame_width = this.width;
			let frame_height = this.height;
			step[0] *= (frame_width / uv_width) * steps;
			step[1] *= (frame_height / uv_height) * steps;
			this.offset.splice(0, 2, this.offset[0]-step[0], this.offset[1]-step[1]);
		},
		getBrushOutlineStyle() {
			let frame_width = this.width;
			let frame_height = this.height;
			let img_width = this.input.image_element.naturalWidth || Texture.canvas.width;
			let img_height = this.input.image_element.naturalHeight || Texture.canvas.height;

			return {
				left: (this.pixel_position.x * (frame_width / img_width)) + 'px',
				top: (this.pixel_position.y * (frame_height / img_height)) + 'px',
				width: (frame_width / img_width) + 'px',
				height: (frame_height / img_height) + 'px',
			}
		},
		UVDefinitionMode() {
			return this.data.texture.uv.inputs.mode.value
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
			if (this.UVDefinitionMode() == 'full') return this.image_ratio;
			let uv_inputs = this.data.texture.uv.inputs;
			let [uv_width, uv_height] = uv_inputs.size.value;
			return uv_width / uv_height;
		},
		image_ratio() {
			if (this.inputs && this.inputs.image_element && this.inputs.image_element.naturalWidth) {
				return this.input.image_element.naturalWidth / this.input.image_element.naturalHeight;
			} else if (Texture.canvas) {
				return Texture.canvas.width / Texture.canvas.height;
			} else {
				return 1;
			}
		},
		height() {
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
		position: relative;
		touch-action: none;
		background-color: var(--color-dark);
		margin-left: -12px;
		width: auto;
		margin-right: -6px;
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
	#canvas_wrapper {
		height: 100%;
	}
	.uv_preview {
		position: absolute;
		top: 0;
		outline: 1px solid var(--color-border);
		touch-action: none;
		cursor: move;
	}
	.texture_input:not([tool="select"]) .uv_preview {
		pointer-events: none;
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
		touch-action: none;
	}
	.texture_viewport:hover .uv_preview_size_handle {
		display: block;
	}
	.viewport_scrollbar {
		border-radius: 8px;
		height: 12px;
		width: 12px;
		position: absolute;
		margin: auto;
		background-color: var(--color-bar);
		border: 1px solid var(--color-border);
		touch-action: none;
	}
	.portrait_view .viewport_scrollbar {
		height: 16px;
		width: 16px;
	}
	.viewport_scrollbar:hover, .viewport_scrollbar:active {
		background-color: var(--color-accent);
	}
	.viewport_scrollbar.horizontal {
		bottom: 4px;
		right: 0;
		left: 0;
		min-width: 25px;
		max-width: 100px;
	}
	.viewport_scrollbar.vertical {
		right: 3px;
		top: 0;
		bottom: 0;
		min-height: 25px;
		max-height: 100px;
	}
	.texture_info_bar {
		display: flex;
	}
	.texture_info_bar > div.info {
		flex: 1 1 80px;
		text-align: center;
		padding-top: 5px;
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
	#brush_outline {
		position: absolute;
		border: 1px solid #fff;
		outline: 1px solid var(--color-border);
		mix-blend-mode: difference;
	}
</style>
<style>
	.input_texture_wrapper canvas {
		width: 100%;
		height: 100%;
		background-size: contain;
		background-repeat: no-repeat;
		pointer-events: none;
	}
</style>