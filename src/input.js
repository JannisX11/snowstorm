import registerEdit from './edits'

import {ExpandedInput} from './components/ExpressionBar'
import { Config, updateMaterial } from './emitter'

export default class Input {
	constructor(data) {
		this.type = data.type||'molang';
		this.isInput = true;
		this.id = data.id;
		this.label = data.label;
		this.info = data.info;
		this.placeholder = data.placeholder;
		this.axis_count = data.axis_count||1;
		this.required = data.required == true;
		this.expanded = data.expanded == true;
		this.expandable = ['molang', 'text', 'number'].includes(this.type) && this.axis_count != -1;
		if (this.type === 'gradient') this.value = data.value || [];

		this.options = data.options;
		this.mode_groups = data.mode_groups;
		if (this.mode_groups && !(this.mode_groups[0] instanceof Array)) {
			this.mode_groups = [this.mode_groups];
		}
		this.enabled_modes = data.enabled_modes;

		this.updatePreview = data.updatePreview;
		this.onchange = data.onchange;
		if (this.type === 'image') {			
			this.image = {
				name: '',
				data: '',
				hidden: false,
			}
			this.image_element = Emitter.config.texture.image;
			this.allow_upload = data.allow_upload;

		}
		if (this.id) {
			this.value = Config[this.id];
		} else if (data.value != undefined) {
			this.value = data.value;
		} else if (['molang', 'text'].includes(this.type)) {
			this.value = '';
		}

	}
	get value() {
		return this._value;
	}
	set value(v) {
		this._value = v;
		if (this.type == 'number') {
			if (v instanceof Array) {
				v.forEach((n, i) => {v[i] = parseFloat(n)})
			} else {
				v = parseFloat(v);
			}
		}
		if (this.id) Config.set(this.id, v);
		if (this.type == 'select') {
			this.meta_value = this.options[v];
		}
	}
	toggleExpand() {
		if (this.expandable) {
			this.expanded = !this.expanded;
		}
	}
	update(Data) {
		var scope = this;
		if (this.type === 'select') {
			if (this.mode_groups instanceof Array) {

				this.mode_groups.forEach((group, i) => {
					if (group instanceof Array) {
						group = scope.mode_groups[i] = Data[group[0]][group[1]]
					}
					group._selected_mode = scope.value
				})
			}
		}
		return this;
	}
	emitInput(value) {
		this.change(event)
	}
	change(e, node) {
		var scope = this;
		if (this.type === 'image' && e) {
			var file = e.target.files[0];
			if (file) {
				var reader = new FileReader()
				reader.onloadend = function() {
					scope.image.name = file.name;
					scope.image.data = reader.result;
					scope.image.loaded = true;
					scope.image.hidden = true;
					scope.image.hidden = false;
					updateMaterial();
				}
				reader.readAsDataURL(file)
			}
		}
		if (this.type === 'select') {
			if (e) {
				this.value = e.target.selectedOptions[0].id;
			}
			this.update()
		}
		if (this.type === 'color') {
			if (typeof this.value == 'object') this.value = this.value.hex8;
		}
		if (typeof this.onchange === 'function') {
			this.onchange(e)
		}
		if (typeof this.updatePreview === 'function') {
			this.updatePreview(this.value)
		}
		let color_input_sliding = this.type == 'color' && node && node.querySelector('.input_wrapper[input_type="color"]:active');
		if (e instanceof Event || (this.type == 'color' && node))	{
			// User Input
			if (ExpandedInput.setup && ['molang', 'text'].includes(this.type)) {
				this.updateExpressionBar(false);
			}
			registerEdit('change input', e, this.type == 'color' && node)
		}
		return this;
	}
	set(value) {
		var scope = this;
		if (value === undefined) return;
		if (this.type === 'select') {
			this.value = value
			this.meta_value = this.options[this.value]
		} else {
			if (this.value instanceof Array) {
				if (value instanceof Array) this.value.splice(0, Infinity, ...value);
			} else {
				this.value = value;
			}
		}
		scope.change()
		return this;
	}
	reset() {
		if (this.type == 'image') {
			this.image.data = '';
			this.image.name = '';
			this.image.loaded = false;
			this.image.hidden = true;
			this.image.hidden = false;
		}
		if (typeof this.updatePreview === 'function') {
			this.updatePreview(this.value)
		}
		return this;
	}
	updateExpressionBar(focusing) {
		var val = this.axis_count == 1 ? this.value : this.value[ExpandedInput.axis];
		ExpandedInput.updateText(val, this.type == 'molang' ? 'molang' : 'generic', focusing);
		return this;
	}
	focus(axis) {
		ExpandedInput.input = this;
		if (axis !== undefined) ExpandedInput.axis = axis;
		this.updateExpressionBar(true);
		return this;
	}
}
