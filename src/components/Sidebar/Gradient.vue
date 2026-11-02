<template>
	<div class="color_gradient">
		<div class="gradient_container checkerboard">
			<div class="gradient_inner" :style="{background: getCSSString(input.value)}"></div>
			<div class="gradient_point"
				v-for="point in input.value" :key="point.id"
				:class="{selected: point == input.selected}"
				@mousedown="dragPoint(input, point, $event)"
				@touchstart="dragPoint(input, point, $event)"
				:style="{left: point.percent+'%', background: resolveColor(point.color)}"
				:title="point.percent + '%'"
			></div>
		</div>
		<div v-if="input.selected && input.selected.color">
			<div class="gradient_point_controls">
				<label>Color Point</label>
				<select :value="typeof input.selected.color =='string' ? 'static' : 'molang'" @change="changeColorMode(input.selected, $event)">
					<option key="static" value="static">Static</option>
					<option key="molang" value="molang">Molang</option>
				</select>
				<div class="tool" @click="input.addPoint()" title="Add Color Point"><i class="unicode_icon plus">{{'\uFF0B'}}</i></div>
				<div class="tool" @click="input.removePoint()" title="Delete Color Point"><i class="unicode_icon">{{'\u2A09'}}</i></div>
			</div>
			<template v-if="input.selected && typeof input.selected.color == 'string'">
				<color-picker v-model="input.selected.color" @input="input.change($event, $el)"></color-picker>
			</template>
			<div v-else-if="input.selected && (input.selected.color instanceof Array)" class="input_right" :axes="4" :class="{expandable: true, expanded: false, full_width: false}">

				<template>
					<div class="prism_editor_outer_wrapper input_vector" v-for="i in 4" :key="i">
						<prism-editor :highlight="highlightMolang" :line-numbers="false"
							v-model="input.selected.color[i-1]"
							:value="input.selected.color[i-1].toString()"
							:index="i-1"
							:placeholder="'255'"
							:autocomplete="autocomplete"
							v-on:input="input.change($event)"
						/>
					</div>
				</template>
			</div>
		</div>
		<div v-else>
			<div class="tool" style="float: right;" v-on:click="input.addPoint()"><i class="unicode_icon plus">{{'\uFF0B'}}</i></div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import VueColor from 'vue-color'
import Gradient from './../../gradient'
import {convertTouchEvent, InputMolangParser} from './../../util'
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "root/packages/vue-prism-editor";
import Languages from './../../languages';
import { highlightMolang } from '../../molang_highlight';
import getAutocompleteData from '../../molang_autocomplete';
import registerEdit from '../../edits';

export default {
	name: 'gradient',
	components: {
		PrismEditor,
		'color-picker': VueColor.Chrome
	},
	props: {
		input: Gradient
	},
	methods: {
		getCSSString(points) {
			let stations = ['to right']
			for (var point of points) {
				stations.push(`${this.resolveColor(point.color)} ${point.percent}%`)
			}
			return `linear-gradient(${stations.join(', ')})`;
		},
		resolveColor(color) {
			if (color instanceof Array) {
				let arr = color.map(val => InputMolangParser.parse(val));
				return `rgba(${(arr[0]??0) * 255}, ${(arr[1]??0) * 255}, ${(arr[2]??0) * 255}, ${arr[3]??0})`;
			}
			return color;
		},
		changeColorMode(point, event) {
			if (event.target.value == 'static') {
				let color = '#' + point.color.slice(0, 4).map(hex => {
					let channel = InputMolangParser.parse(hex) * 255;
					channel = Math.clamp(Math.round(channel), 0, 255);
					return channel.toString(16);
				}).join('');
				Vue.set(point, 'color', color);
			} else {
				let arr = [
					point.color.substring(1, 3),
					point.color.substring(3, 5),
					point.color.substring(5, 7),
					point.color.substring(7, 9),
				].map(hex => {
					let number = parseInt(hex, 16) / 255;
					number = Math.round(number * 1000) / 1000;
					return number.toString();
				});
				Vue.set(point, 'color', arr);
			}
			registerEdit('change gradient');
		},
		dragPoint(input, point, event1) {
			convertTouchEvent(event1);
			input.selected = point;
			let unlocked = false;
			let original_value = point.percent;
			function onDrag(event2) {
				convertTouchEvent(event2);
				let distance = event2.clientX - event1.clientX
				if (Math.abs(distance) > 4) unlocked = true;
				if (unlocked && event1.target.parentElement) {
					let width = event1.target.parentElement.clientWidth;
					let percent = original_value + (distance/width) * 100;
					point.percent = Math.clamp(Math.round(percent), 0, 100)
					input.sortValues()
				}
			}
			function onDragEnd(event2) {
				document.removeEventListener('mousemove', onDrag)
				document.removeEventListener('mouseup', onDragEnd)
				document.removeEventListener('touchmove', onDrag)
				document.removeEventListener('touchend', onDragEnd)
				input.registerEdit()
			}
			document.addEventListener('mousemove', onDrag)
			document.addEventListener('mouseup', onDragEnd)
			document.addEventListener('touchmove', onDrag)
			document.addEventListener('touchend', onDragEnd)
		},
		autocomplete(text, position) {
			return getAutocompleteData(text, position, 'input')
		},
		highlightMolang
	}
}
</script>


<style scoped>
	.color_gradient {
		width: 100%;
	}
	.gradient_container {
		position: relative;
		width: calc(100% - 10px);
		height: 20px;
		margin: 0 5px 10px 5px;
		border: 1px solid black;
	}
	.gradient_point {
		position: absolute;
		height: 16px;
		width: 10px;
		top: 10px;
		margin-left: -5px;
		border: 1px solid #212529;
		overflow: hidden;
		cursor: pointer;
	}
	.gradient_point.selected {
		border-color: #000;
		z-index: 4;
		outline: 2px solid #fff;
		border-radius: 1px;
	}
	.gradient_inner {
		height: 100%;
		width: 100%;
	}
	div.vc-chrome {
		float: left;
	}
	.gradient_point_controls {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		height: 32px;
	}
	.gradient_point_controls > label {
		flex-grow: 1;
	}
</style>