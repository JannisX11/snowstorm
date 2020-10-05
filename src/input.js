import * as THREE from 'three'
import Molang from './molang'
import tinycolor from 'tinycolor2'
import $ from 'jquery'
import registerEdit from './edits'

import {ExpandedInput} from './components/ExpressionBar'

export default class Input {
	constructor(data) {
		this.type = data.type||'molang';
		this.isInput = true;
		this.label = data.label;
		this.info = data.info;
		this.placeholder = data.placeholder;
		this.required = data.required == true;
		this.expanded = data.expanded == true;
		this.expandable = ['molang', 'text', 'number'].includes(this.type);
		this.value = data.value;
		if (this.type === 'gradient') this.value = data.value || [];

		this.options = data.options;
		this.mode_groups = data.mode_groups;
		if (this.mode_groups && !(this.mode_groups[0] instanceof Array)) {
			this.mode_groups = [this.mode_groups];
		}
		this.enabled_modes = data.enabled_modes;
		this.axis_count = data.axis_count||1;

		this.updatePreview = data.updatePreview;
		this.onchange = data.onchange;
		if (this.type === 'select') {
			if (!this.value) {
				this.value = Object.keys(this.options)[0]
			}
			this.meta_value = this.options[this.value]

		} else if (this.type === 'color' && !this.value) {
			this.value = '#ffffff';

		} else if (this.axis_count > 1 && !this.value) {
			this.value = []
		} else if (this.type === 'list' && !this.value) {
			this.value = []
		} else if (this.type === 'image') {
			this.value = '';
			this.image = {
				name: '',
				data: '',
				width: 0,
				height: 0,
			}
			this.allow_upload = data.allow_upload;
		} else if ((this.type === 'text' || this.type === 'molang') && !this.value) {
			this.value = '';
		} else if (this.type === 'checkbox' && !this.value) {
			this.value = '';
		} else if (this.type === 'number' && !this.value) {
			this.value = 0;
		}
		this.default_value = JSON.parse(JSON.stringify(this.value));
	}
	toggleExpand() {
		if (this.expandable) {
			this.expanded = !this.expanded;
		}
	}
	updateImageWidth(event, th) {
		let img = event.path[0];
		this.image.width = img.naturalWidth;
		this.image.height = img.naturalHeight;
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
	change(e, node) {
		var scope = this;
		if (this.type === 'image' && e) {
			var file = e.target.files[0];
			if (file) {
				var reader = new FileReader()
				reader.onloadend = function() {
					scope.image.name = file.name;
					scope.image.data = reader.result;
					scope.image.width = 0;
					scope.image.height = 0;
					scope.image.loaded = true;
					scope.updatePreview(scope.image)
				}
				reader.readAsDataURL(file)
			}
		}
		if (this.type === 'select') {
			if (e) {
				this.value = $(e.target).find('option:selected').attr('id')
			}
			this.update()
		}
		if (typeof this.onchange === 'function') {
			this.onchange(e)
		}
		if (typeof this.updatePreview === 'function' && this.type !== 'image') {
			var data = this.calculate()
			this.updatePreview(data)
		}
		let color_input_sliding = this.type == 'color' && node && node.querySelector('.input_wrapper[input_type="color"]:active') 
		if (e instanceof Event || (this.type == 'color' && node && !color_input_sliding))	{
			// User Input
			if (ExpandedInput.setup && ['molang', 'text', 'list'].includes(this.type)) {
				this.focus()
			}
			registerEdit('change input', event)
		}
		return this;
	}
	calculate(opts) {
		var scope = this;
		function getV(v) {
			if (scope.type === 'molang') {
				return Molang.parse(v, opts)
			} else if (scope.type === 'number') {
				return parseFloat(v)||0;
			}
		}
		var data;
		if (this.type === 'molang' || this.type === 'number') {
			if (this.axis_count === 4) {
				var data = new THREE.Plane().setComponents(
					getV(this.value[0]),
					getV(this.value[1]),
					getV(this.value[2]),
					getV(this.value[3])
				)
			} else if (this.axis_count === 3) {
				var data = new THREE.Vector3(
					getV(this.value[0]),
					getV(this.value[1]),
					getV(this.value[2])
				)
			} else if (this.axis_count === 2) {
				var data = new THREE.Vector2(
					getV(this.value[0]),
					getV(this.value[1])
				)
			} else {
				var data = getV(this.value)
			}
		} else if (this.type === 'color') {
			var val = (this.value && this.value.hsl) ? this.value.hex : this.value;
			var c = tinycolor(val).toHex();
			var data = new THREE.Color('#'+c)

		} else {
			var data = this.value
		}
		return data;
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
		this.set(this.default_value);
		if (this.type == 'image') {
			this.image.data = '';
			this.image.name = '';
			this.image.loaded = false;
			this.image.width = 0;
			this.image.height = 0;
			$('#particle-texture-image .input_texture_preview').css('background-image', `none`)
			this.updatePreview()
		}
		return this;
	}
	focus(axis) {
		ExpandedInput.input = this;
		if (axis !== undefined) ExpandedInput.axis = axis;
		var val = (this.axis_count > 1 || this.type == 'list') ? this.value[ExpandedInput.axis] : this.value
		ExpandedInput.updateText(val, this.type == 'molang' ? 'molang' : 'none');
		return this;
	}
}
