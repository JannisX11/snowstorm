<template>
	<div class="color_gradient">
		<div class="gradient_container checkerboard">
			<div class="gradient_inner" :style="{background: getCSSString(input.value)}"></div>
			<div class="gradient_point"
				v-for="point in input.value" :key="point.id"
				:class="{selected: point == input.selected}"
				@mousedown="dragPoint(input, point, $event)"
				@touchstart="dragPoint(input, point, $event)"
				:style="{left: point.percent+'%', background: point.color}"
				:title="point.percent + '%'"
			></div>
		</div>
		<div v-if="input.selected && input.selected.color">
			<div class="tool" style="float: right;" v-on:click="input.removePoint()"><i class="unicode_icon">{{'\u2A09'}}</i></div>
			<div class="tool" style="float: right;" v-on:click="input.addPoint()"><i class="unicode_icon plus">{{'\uFF0B'}}</i></div>
			<color-picker v-model="input.selected.color" v-on:input="input.change($event, $el)"></color-picker>
		</div>
	</div>
</template>

<script>
import VueColor from 'vue-color'
import Gradient from './../../gradient'
import {convertTouchEvent} from './../../util'

export default {
	name: 'gradient',
	components: {
		'color-picker': VueColor.Chrome
	},
	props: {
		input: Gradient
	},
	methods: {
		getCSSString(points) {
			let stations = ['to right']
			for (var point of points) {
				stations.push(`${point.color} ${point.percent}%`)
			}
			return `linear-gradient(${stations.join(', ')})`;
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
		}
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
		border-color: #fff;
		box-shadow: 0 0 2px #000;
		z-index: 4;
	}
	.gradient_inner {
		height: 100%;
		width: 100%;
	}
	div.vc-chrome {
		float: left;
	}
</style>