import Vue from 'vue'
import {Emitter} from './preview'

class Curve {
	constructor() {
		var scope = this;
		this.uuid = guid();
		this.id = new Input({
			label: 'Name',
			info: 'The MoLang variable to be used later in MoLang expressions. Must begin with "variable."',
			placeholder: 'variable.curve1',
			type: 'text',
			onchange() {
				Emitter.curves[this.value] = scope;
			}
		})
		this.mode = new Input({
			type: 'select',
			label: 'Mode',
			info: 'Curve interpolation type',
			options: {
				catmull_rom: 'Catmull Rom',
				linear: 'Linear',
				//bezier: 'Bezier',
			},
			onchange() {
				Vue.nextTick(() => scope.updateSVG());
			}
		})
		this.input = new Input({
			label: 'Input',
			info: 'Horizontal input',
			type: 'text'
		})
		this.range = new Input({
			label: 'Range',
			info: 'Horizontal range that the input is mapped to',
			type: 'text'
		})
		this.nodes = [0, 1, 0]
		this.svg_data = '';
		this.vertical_line_data = '';
		this.horizontal_line_data = '';

		this.min = 0;
		this.max = 1;

		setTimeout(() => {
			Vue.nextTick(() => scope.updateSVG());
		}, 20);
	}
	updateMinMax() {
		this.min = 0;
		this.max = 1;
		this.nodes.forEach(v => {
			this.min = Math.min(this.min, v);
			this.max = Math.max(this.max, v);
		})
		this.min = Math.clamp(Math.round(this.min*100)/100, -100, 0);
		this.max = Math.clamp(Math.round(this.max*100)/100, 0, 100);
		Vue.nextTick(() => this.updateSVG());
	}
	addNode(index, event) {
		var value = 0;
		if (this.nodes[index-1] != undefined && this.nodes[index] != undefined) {
			value = (this.nodes[index-1] + this.nodes[index])/2
		}
		this.nodes.splice(index, 0, Math.round(value*100)/100);
		Vue.nextTick(() => this.updateSVG());
	}
	removeNode(index, event) {
		if (this.nodes.length <= 2) return;
		this.nodes.splice(index, 1);
		Vue.nextTick(() => this.updateSVG());
	}
	slideValue(index, event) {
		var scope = this;
		var start = event.clientY;
		var start_value = this.nodes[index];
		function slide(event) {
			var value = start_value + (start - event.clientY) / 140 * (scope.max - scope.min);
			//snap
			if (value > 0.94 && value < 1.1) value = 1;
			if (value > -0.1 && value < 0.06) value = 0;

			scope.setNode(index, value);
		}
		function stopSlide() {
			document.removeEventListener('mousemove', slide, false);
			document.removeEventListener('mouseup', stopSlide, false);
		}
		document.addEventListener('mousemove', slide, false);
		document.addEventListener('mouseup', stopSlide, false);
	}
	setNode(index, value) {
		value = Math.round(value*100)/100;
		this.nodes.splice(index, 1, value);
		this.updateMinMax();
		//Vue.nextTick(() => this.updateSVG());
	}
	calculate(params) {
		var position = Molang.parse(this.input.value, params);
		var range = Molang.parse(this.range.value, params);
		position = (position/range) || 0;
		if (this.mode.value == 'linear') {

			var segments = this.nodes.length-1;
			position *= segments
			var index = Math.floor(position);
			var blend = position%1;
			var difference = this.nodes[index+1] - this.nodes[index];
			var value = this.nodes[index] + difference * blend;
			return value;

		} else if (this.mode.value == 'catmull_rom') {
			var vectors = [];
			this.nodes.forEach((val, i) => {
				vectors.push(new THREE.Vector2(i-1, val))
			})
			var curve = new THREE.SplineCurve(vectors);

			var segments = this.nodes.length-3;
			position *= segments
			var pso = (position+1)/(segments+2)
			return curve.getPoint(pso).y;
		}
	}
	updateSVG() {
		var scope = this;
		this.svg_data = '';
		this.vertical_line_data = '';

		var points = $(`.curve[uuid=${this.uuid}] .curve_node .curve_point`)
		if (!points.length) return this;


		var parent_offset = $(`.curve[uuid=${this.uuid}] .curve_display`).offset().left + 1;
		var start = points.first().offset().left+5 - parent_offset;
		var end = points.last().offset().left+5 - parent_offset;
		var width = end-start;
		var gap = width / (scope.nodes.length-1);
		if (!width) return;
		$(`.curve[uuid=${this.uuid}] .curve_display > svg`)
			//.css('margin-left', (start-parent_offset-3)+'px')
			//.css('width', (width+4)+'px')

		function getPoint(index, raw) {
			var point = [
				index * gap + (start),
				145 - ((scope.nodes[index]-scope.min) / (scope.max-scope.min)) * 140
			]
			return raw ? point : point.join(' ');
		}

		var ground = 145 - (-scope.min / (scope.max-scope.min)) * 140;
		var ceiling = 145 - ((1-scope.min) / (scope.max-scope.min)) * 140;
		this.horizontal_line_data = `M${0} ${ground} L${2000} ${ground} M${0} ${ceiling} L${2000} ${ceiling}`;

		this.svg_data += `M${getPoint(0)}`;

		if (this.mode.value == 'linear') {

			for (var i = 1; i < this.nodes.length; i++) {
				this.svg_data += ` L${getPoint(i)}`;
			}
			this.vertical_line_data = `M${start} 150 L${start} 0 M${end} 150 L${end} 0`;

		} else if (this.mode.value == 'bezier') {

		} else if (this.mode.value == 'catmull_rom') {

			var points = [];
			this.nodes.forEach((node, i) => {
				points.push(getPoint(i, true));
			})
			this.svg_data = toCatmullRomBezier(points);

			this.vertical_line_data = `M${start+gap} 150 L${start+gap} 0 M${end-gap} 150 L${end-gap} 0`;

		}
	}
	remove() {
		Data.general.curves.curves.remove(this);
	}
}

function toCatmullRomBezier( points, tension = 0.5, closing = false) {
	// sets tension [0.0, 1.0] +/-
	let tens = (tension !== 0) ? tension * 12 : 0.5 * 12
	// duplicate First point to the end if the Path is not closed
	const PointList = (closing) ? [...copyFirstPointToLast(points)] : [...points]
	// Make sure Points have correct type
	const floats = PointList.map(x => x.map(x => parseFloat(x)))
	// Set starting point for SVG
	const firstMoveto = ['M' + floats[0][0] + ' ' + floats[0][1] + ' ']
	// Generate Point Matrix from points
	const matrixPoints = floats.map((point, i, arr) => {
		if (i == 0) {
			return getMatrix([arr[i],arr[i],arr[i+1],arr[i+2]])
		} else if (i == arr.length - 2) {
			return getMatrix([arr[i-1],arr[i],arr[i+1],arr[i+1]])
		} else {
			return getMatrix([arr[i-1],arr[i],arr[i+1],arr[i+2]])
		}
	}).filter(mx => mx[3] !== undefined)
	// some Matrix Multiplication for the Bezier points
	const matrixMathToBezier = matrixPoints.map(p => {
		return [
			{ x: p[1].x,	y: p[1].y },
			{ x: ((-p[0].x + tens * p[1].x + p[2].x) / tens), y: ((-p[0].y + tens * p[1].y + p[2].y) / tens)},
			{ x: ((p[1].x + tens * p[2].x - p[3].x) / tens),	y: ((p[1].y + tens * p[2].y - p[3].y) / tens) },
			{ x: p[2].x,	y: p[2].y }
		]
	})
	
	const toSVGNotation = matrixMathToBezier.map(bp => {
		return "C" + bp[1].x + "," + bp[1].y + " " + bp[2].x + "," + bp[2].y + " " + bp[3].x + "," + bp[3].y + " "
	})
	
	// Add the Moveto comand and join to string
	return firstMoveto.concat(toSVGNotation).join(' ')
	
	// Functions:
	// Seperate X and Y values from Point Array for clarity -> eg. [[x,y],[x,y],[x,y]]
	function getMatrix(arr) {
		return arr.map(p => {
			if (p !== undefined) { return { x : p[0], y : p[1] }}
		}) 
	}
	// Duplicate first element to the end
	function copyFirstPointToLast(arr) {
		return (arr[0] !== arr[arr.length - 1]) ? [...arr, arr[0]] : arr
	}
}

function updateCurvesPanel() {
	if (Data.general.curves._folded) return;
	Vue.nextTick(() => {
		Data.general.curves.curves.forEach(curve => {
			curve.updateSVG();
		})
	})
}

Vue.component('curve', {
	props: {
		curve: Object,
		group_key: String,
		subject_key: String,
	},
	template: `
		<div>
			<input-group :group.sync="curve" :group_key.sync="group_key" :subject_key.sync="subject_key"></input-group>

			<div class="curve_display">
				<svg>
					<path class="curve_path" :d="curve.svg_data"/>
					<path class="vertical_line_path" :d="curve.vertical_line_data"/>
					<path class="horizontal_line_path" :d="curve.horizontal_line_data"/>
				</svg>
				<ul class="curve_controls">
					<li class="curve_add" :key="'add_0'" @click="curve.addNode(0, $event)"></li>
					<template v-for="(value, index) in curve.nodes">
						<li class="curve_node" :key="'node_'+index" @mousedown="curve.slideValue(index, $event)">
							<div class="curve_point" :style="{bottom: ((value-curve.min)/(curve.max-curve.min))*140 + 'px'}"><label>{{value}}</label></div>
							<div class="curve_node_remover tool" @click="curve.removeNode(index, $event)">
								<i class="fas fa-minus-circle"></i>
							</div>
						</li>
						<li class="curve_add" :key="'add_'+index+1" @click="curve.addNode(index+1, $event)"></li>
					</template>
				</ul>
				<div class="curve_max_num">{{curve.max}}</div>
				<div class="curve_min_num">{{curve.min}}</div>
			</div>
			<div class="curve_footer">
				<div class="fill_line"></div>
				<div class="tool" v-on:click="curve.remove()">Remove Curve</div>
			</div>
		</div>
	`
})

export {Curve, updateCurvesPanel}
