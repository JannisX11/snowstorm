import Vue from 'vue'
import {Emitter, Config} from './emitter'
import Data from './input_structure'
import Input from './input'
import {guid} from './util'
import registerEdit from './edits'

class Curve {
	constructor(data = 0) {
		var scope = this;
		this.uuid = guid();
		this.svg_needs_update = false;

		this.inputs = {
			id: new Input({
				label: 'Name',
				info: 'The MoLang variable to be used later in MoLang expressions. Must begin with "variable."',
				placeholder: 'variable.curve1',
				type: 'text',
				value: '',
				onchange() {
					scope.updateName(this.value);
				}
			}),
			mode: new Input({
				type: 'select',
				label: 'Mode',
				info: 'Curve interpolation type',
				value: ['catmull_rom', 'linear'].includes(data.mode) ? data.mode : 'linear',
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
				type: 'molang',
				value: data.input
			}),
			range: new Input({
				label: 'Range',
				info: 'Horizontal range that the input is mapped to',
				type: 'molang',
				value: data.range
			})
		}
		this.nodes = data.nodes instanceof Array ? data.nodes : [0, 1, 0];
		this.svg_data = '';
		this.vertical_line_data = '';
		this.horizontal_line_data = '';

		this.min = 0;
		this.max = 1;

		this.config = {
			get input() {return scope.inputs.input.value;},
			get range() {return scope.inputs.range.value;},
			get mode() {return scope.inputs.mode.value;},
			nodes: this.nodes
		}

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
	updateName(new_name) {
		Config.curves[new_name] = this.config;
		for (var key in Config.curves) {
			if (Config.curves[key] != this && !Data.effect.curves.curves.find(curve => curve.inputs.id.value == key)) {
				delete Config.curves[key];
			}
		}
		return this;
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
	remove() {
		delete Config.curves[this.inputs.id.value];
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
