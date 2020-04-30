<template>
	<div class="color_gradient">
		<div class="gradient_container checkerboard">
			<div class="gradient_inner" :style="{background: input.getCSSString(input.value)}"></div>
			<div class="gradient_point"
				v-for="point in input.value" :key="point.id"
				:class="{selected: point == input.selected}"
				@mousedown="input.dragPoint(point, $event)"
				:style="{left: point.percent+'%', background: point.color}"
				:title="point.percent + '%'"
			></div>
		</div>
		<div v-if="input.selected && input.selected.color">
		<div class="tool" style="float: right;" v-on:click="input.removePoint()"><i class="fas fa-minus-circle"></i></div>
			<div class="tool" style="float: right;" v-on:click="input.addPoint()"><i class="fas fa-plus-circle"></i></div>
			<color-picker v-model="input.selected.color" v-on:input="input.change($event)"></color-picker>
		</div>
	</div>
</template>

<script>
import VueColor from 'vue-color'
import Gradient from './../../gradient'

export default {
	name: 'gradient',
	props: {
		input: Gradient
	},
	components: {
		'color-picker': VueColor.Chrome
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
</style>