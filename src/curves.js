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
				value: data ? '' : 'variable.',
				onchange() {
					scope.updateName(this.value);
				}
			}),
			mode: new Input({
				type: 'select',
				label: 'Mode',
				info: 'Curve interpolation type',
				value: ['catmull_rom', 'linear', 'bezier', 'bezier_chain'].includes(data.mode) ? data.mode : 'linear',
				options: {
					catmull_rom: 'Catmull Rom',
					linear: 'Linear',
					bezier: 'Bézier',
					bezier_chain: 'Bézier Chain',
				},
				onchange() {
					scope.updateSVG();
					if (scope.inputs.mode.value == 'bezier') {
						scope.nodes.splice(4, Infinity, 0, 0, 0, 0);
						scope.nodes.splice(4);
					}
					if (scope.inputs.mode.value == 'bezier_chain') {
						scope.nodes.splice(0, Infinity,
							{time: 0, left_value: 0, right_value: 0, left_slope: 0, right_slope: 0},
							{time: 1, left_value: 1, right_value: 1, left_slope: 0, right_slope: 0},
						);
					} else if (scope.nodes.find(n => typeof n == 'object')) {
						scope.nodes.forEach((n, i) => {
							if (typeof n == 'object') scope.nodes[i] = n.left_value || 0;
						})
					}
				}
			}),
			input: new Input({
				label: 'Input',
				info: 'Horizontal input',
				type: 'molang',
				value: data ? data.input : 'v.particle_age'
			}),
			range: new Input({
				label: 'Range',
				info: 'Horizontal range that the input is mapped to',
				type: 'molang',
				value: data ? data.range : 'v.particle_lifetime',
				condition(curve) {
					return curve.inputs.mode.value !== 'bezier_chain'
				}
			})
		}
		this.nodes = data.nodes instanceof Array ? data.nodes : [0, 1, 0];
		this.selected_point = -1;
		this.svg_data = '';
		this.bezier_handles = '';
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
			this.min = Math.min(this.min, typeof v == 'object' ? Math.min(v.right_value, v.left_value) : v);
			this.max = Math.max(this.max, typeof v == 'object' ? Math.max(v.right_value, v.left_value) : v);
		})
		this.min = Math.clamp(Math.round(this.min*100)/100, -256, 0);
		this.max = Math.clamp(Math.round(this.max*100)/100, 0, 256);
		this.updateSVG();
	}
	updateName(new_name) {
		let valid_name = new_name;
		let i = 2;
		while (Config.curves[valid_name] && Config.curves[valid_name] !== this.config) {
			valid_name = new_name + i;
			i++;
		}
		Config.curves[valid_name] = this.config;
		for (var key in Config.curves) {
			if (key !== valid_name && !Data.effect.curves.curves.find(curve => curve.inputs.id.value == key)) {
				delete Config.curves[key];
			}
		}
		return this;
	}
	removeNode(index, event) {
		if (this.nodes.length <= 2) return;
		let node = this.nodes[index];
		this.nodes.splice(index, 1);
		if (this.inputs.mode.value == 'bezier_chain') {
			let nearest = this.nodes.slice().sort((a, b) => Math.abs(a.time - node.time) - Math.abs(b.time - node.time))[0];
			this.selected_point = this.nodes.indexOf(nearest);
		} else {
			this.selected_point--;
		}
		this.updateSVG();
		registerEdit('remove curve node')
	}

	setNode(index, value) {
		value = Math.round(parseFloat(value)*100)/100;
		if (this.inputs.mode.value == 'bezier_chain') {
			this.nodes[index].left_value = this.nodes[index].right_value = value;
		} else {
			this.nodes.splice(index, 1, value);
		}
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
