import Vue from 'vue'
import Molang from 'molangjs'
import * as THREE from 'three'
import {Emitter} from './emitter'
import Data from './input_structure'
import Input from './input'
import {guid} from './util'
import $ from 'jquery'
import registerEdit from './edits'

class Curve {
	constructor() {
		var scope = this;
		this.uuid = guid();
		this.svg_needs_update = false;

		this.inputs = {
			id: new Input({
				label: 'Name',
				info: 'The MoLang variable to be used later in MoLang expressions. Must begin with "variable."',
				placeholder: 'variable.curve1',
				type: 'text',
				onchange() {
					Emitter.curves[this.value] = scope;
				}
			}),
			mode: new Input({
				type: 'select',
				label: 'Mode',
				info: 'Curve interpolation type',
				options: {
					catmull_rom: 'Catmull Rom',
					linear: 'Linear',
					//bezier: 'Bezier',
				},
				onchange() {
					scope.updateSVG();
				}
			}),
			input: new Input({
				label: 'Input',
				info: 'Horizontal input',
				type: 'molang'
			}),
			range: new Input({
				label: 'Range',
				info: 'Horizontal range that the input is mapped to',
				type: 'molang'
			})
		}
		this.nodes = [0, 1, 0]
		this.svg_data = '';
		this.vertical_line_data = '';
		this.horizontal_line_data = '';

		this.min = 0;
		this.max = 1;

		setTimeout(() => {
			Vue.nextTick(() => this.updateSVG())
		}, 20);
	}
	updateSVG() {
		this.svg_needs_update = true;
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
		this.updateSVG();
	}
	addNode(index, event) {
		var value = 0;
		if (this.nodes[index-1] != undefined && this.nodes[index] != undefined) {
			value = (this.nodes[index-1] + this.nodes[index])/2
		}
		this.nodes.splice(index, 0, Math.round(value*100)/100);
		this.updateSVG();
		registerEdit('add curve node')
	}
	removeNode(index, event) {
		if (this.nodes.length <= 2) return;
		this.nodes.splice(index, 1);
		this.updateSVG();
		registerEdit('remove curve node')
	}

	setNode(index, value) {
		value = Math.round(value*100)/100;
		this.nodes.splice(index, 1, value);
		this.updateMinMax();
	}
	calculate(params) {
		var position = Molang.parse(this.inputs.input.value, params);
		var range = Molang.parse(this.inputs.range.value, params);
		position = (position/range) || 0;
		if (position === Infinity) position = 0;
		if (this.inputs.mode.value == 'linear') {

			var segments = this.nodes.length-1;
			position *= segments
			var index = Math.floor(position);
			var blend = position%1;
			var difference = this.nodes[index+1] - this.nodes[index];
			var value = this.nodes[index] + difference * blend;
			return value;

		} else if (this.inputs.mode.value == 'catmull_rom') {
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
	remove() {
		Data.effect.curves.curves.remove(this);
		registerEdit('remove curve')
	}
}



function updateCurvesPanel() {
	if (Data.effect.curves._folded) return;
	Vue.nextTick(() => {
		Data.effect.curves.curves.forEach(curve => {
			curve.svg_needs_update = true;
		})
	})
}

export default Curve
export {Curve, updateCurvesPanel}
