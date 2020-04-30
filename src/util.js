import $ from 'jquery'

/*//Blockbench
function compareVersions(string1, string2) {
	// Is string1 newer than string2 ?
	var arr1 = string1.split('.')
	var arr2 = string2.split('.')
	var i = 0;
	var num1 = 0;
	var num2 = 0;
	while (i < arr1.length) {
		num1 = parseInt(arr1[i])
		num2 = parseInt(arr2[i])
		if (num1 > num2) {
			return true;
		} else if (num1 < num2) {
			return false
		}
		i++;
	}
	return false;
}
function useBedrockFlipFix(axis) {
	if (Blockbench.entity_mode === false) return false;
	if (typeof axis === 'string') {
		axis = getAxisNumber(axis)
	}
	var group;
	if (selected_group) {
			var group = selected_group
	} else {
		var i = 0;
		while (i < selected.length) {
			if (typeof selected[i].parent === 'object' &&
				selected[i].parent.type === 'group'
			) {
				var group = selected[i].parent
			}
			i++;
		}
	}
	if (group) {
		var rotations = group.rotation.slice()
		rotations.splice(axis, 1)
		rotations.forEach(function(r, i) {
			rotations[i] = (r >= -90 && r <= 90)
		})
		return rotations[0] !== rotations[1]
	} else {
		return false
	}
}
const Condition = function(condition, context) {
	if (condition !== undefined && condition !== null && condition.condition !== undefined) {
		condition = condition.condition
	}
	if (condition === undefined) {
		return true;
	} else if (typeof condition === 'function') {
		return condition(context)
	} else {
		return !!condition
	}
}
class oneLiner {
	constructor(data) {
		if (data !== undefined) {
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					this[key] = data[key]
				}
			}
		}
	}
}
var cl = console.log
var asyncLoop = function(o){
	var i=-1;
	var async_loop = function(){
		i++;
		if(i==o.length){o.callback(); return;}
		o.functionToLoop(async_loop, i);
	} 
	async_loop();//init
}
Date.prototype.getTimestamp = function() {
	var l2 = i => (i.toString().length === 1 ? '0'+i : i);
	return l2(this.getHours()) + ':' + l2(this.getMinutes());
}

//Jquery
$.fn.deepest = function() {
	if (!this.length) return this;
	var opts = []
	this.each((i, node) => {
		var i = 0;
		var obj = $(node)
		while (obj.parent().get(0) instanceof HTMLBodyElement === false) {
			obj = obj.parent()
			i++;
		}
		opts.push({depth: i, o: node})
	})
	opts.sort((a, b) => (a.depth < b.depth));
	return $(opts[0].o)
}

//Math
function isUUID(s) {
	return (s.length === 36 && s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
}
*/
function bbuid(l) {
	l = l || 1
	let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	var s = '';
	while (l > 0) {
		var n = Math.floor(Math.random()*62)
		if (n > 9) {
			n = chars[n-10]
		}
		s += n
		l--;
	}
	return s;
}
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}


Math.clamp = (number, min, max) => {
	if (number > max) number = max;
	if (number < min || isNaN(number)) number = min;
	return number;
}
Math.randomab = function(a, b) {
	return a + Math.random() * (b-a)
}
Math.radToDeg = function(rad) {
	return rad / Math.PI * 180
}
Math.degToRad = function(deg) {
	return Math.PI / (180 /deg)
}
Math.roundTo = function(num, digits) {
	var d = Math.pow(10,digits)
	return Math.round(num * d) / d
}
Math.lerp = function(a,b,m) {
	return (m-a) / (b-a)
}
Math.isBetween = function(n, a, b) {
   return (n - a) * (n - b) <= 0
}
Math.trimDeg = function(a) {
	return (a+180*15)%360-180
}
Math.isPowerOfTwo = function(x) {
	return (x > 1) && ((x & (x - 1)) == 0);
}
/*
function trimFloatNumber(val) {
	if (val == '') return val;
	var string = val.toFixed(4)
	string = string.replace(/0+$/g, '').replace(/\.$/g, '')
	return string;
}
function getAxisLetter(number) {
	switch (number) {
		case 0: return 'x'; break;
		case 1: return 'y'; break;
		case 2: return 'z'; break;
	}
}
function getAxisNumber(letter) {
	switch (letter.toLowerCase()) {
		case 'x': return 0; break;
		case 'y': return 1; break;
		case 'z': return 2; break;
	}
}
function getRectangle(a, b, c, d) {
	var rect = {};
	if (!b && typeof a === 'object') {
		rect = a
	} else if (typeof a === 'object' && a.x) {
		rect.ax = a.x
		rect.ay = a.y

		rect.bx = b.x
		rect.by = b.y
	} else {
		rect.ax = a
		rect.ay = b
		if (typeof c === 'number' && typeof d === 'number') {
			rect.bx = c
			rect.by = d
		} else {
			rect.bx = a
			rect.by = b
		}
	}
	if (rect.ax > rect.bx) {
		[rect.ax, rect.bx] = [rect.bx, rect.ax]
	}
	if (rect.ay > rect.by) {
		[rect.ay, rect.by] = [rect.by, rect.ay]
	}
	rect.x = rect.bx - rect.ax
	rect.y = rect.by - rect.ay
	return rect;
}
function doRectanglesOverlap(rect1, rect2) {
	if (rect1.ax > rect2.bx || rect2.ax > rect1.bx) {
		return false
	}
	if (rect1.ay > rect2.by || rect2.ay > rect1.by) {
		return false
	}
	return true;
}

//Array
*/
Array.prototype.safePush = function(item) {
	if (!this.includes(item)) {
		this.push(item);
		return true;
	}
	return false;
}
Array.prototype.equals = function (array) {
	if (!array)
			return false;

	if (this.length != array.length)
			return false;

	for (var i = 0, l=this.length; i < l; i++) {
			if (this[i] instanceof Array && array[i] instanceof Array) {
					if (!this[i].equals(array[i]))
							return false;			 
			}					 
			else if (this[i] != array[i]) { 
					return false;	 
			}					 
	}			 
	return true;
}
Array.prototype.remove = function (item) { {
	var index = this.indexOf(item)
	if (index > -1) {
		this.splice(index, 1)
		return index;
	}
	return false;
	}		
}
Array.prototype.empty = function() {
	this.splice(0, Infinity)
	return this;
}
Array.prototype.purge = function() {
	this.splice(0, Infinity)
	return this;
}
Array.prototype.findInArray = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][key] === value) return this[i]
	}
	return false;
}
Array.prototype.positiveItems = function() {
	var x = 0, i = 0;
	while (i < this.length) {
		if (this[i]) x++;
		i++;
	}
	return x;
}
Array.prototype.allEqual = function(s) {
	var i = 0;
	while (i < this.length) {
		if (this[i] !== s) {
			return false;
		}
		i++;
	}
	return true;
}
Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)]
}
/*

//Object
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function omitKeys(obj, keys, dual_level) {
	var dup = {};
	for (key in obj) {
		if (keys.indexOf(key) == -1) {
			if (dual_level === true && typeof obj[key] === 'object') {
				dup[key] = {}
				for (key2 in obj[key]) {
					if (keys.indexOf(key2) == -1) {
							dup[key][key2] = obj[key][key2];
					}
				}
			} else {
				dup[key] = obj[key];
			}
		}
	}
	return dup;
}
function get (options, name, defaultValue) {
	return (name in options ? options[name] : defaultValue)
}
function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}

var Objector = {
	equalKeys: function(obj, ref) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (!ref.hasOwnProperty(key)) {
					return false;
				}
			}
		}
		for (var key in ref) {
			if (ref.hasOwnProperty(key)) {
				if (!obj.hasOwnProperty(key)) {
					return false;
				}
			}
		}
		return true;
	},
	keyLength: function(obj) {
		var l = 0;
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				l++;
			}
		}
		return l;
	}
}

var Merge = {
	number: function(obj, source, index) {
		if (source[index] !== undefined) {
			var val = source[index]
			if (typeof val === 'number' && !isNaN(val)) {
				obj[index] = val
			} else {
				val = parseFloat(val)
				if (typeof val === 'number' && !isNaN(val)) {
					obj[index] = val
				}
			}
		}
	},
	string: function(obj, source, index) {
		if (source[index] !== undefined) {
			var val = source[index]
			if (typeof val === 'string') {
				obj[index] = val
			} else {
				obj[index] = val+''
			}
		}
	},
	boolean: function(obj, source, index) {
		if (source[index] !== undefined) {
			obj[index] = source[index]
		}
	}
}

//String
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
function pluralS(arr) {
	if (arr.length === 1 || arr === 1) {
		return '';
	} else {
		return 's';
	}
}
function pathToName(path, extension) {
	var path_array = path.split('/').join('\\').split('\\')
	if (extension === true) {
		return path_array[path_array.length-1]
	} else if (extension === 'mobs_id') {
		var name = path_array[path_array.length-1].split('.').slice(0, -1).join('.')
		if (name === 'mobs' && path_array[path_array.length-3]) {
			name = name + ' (' + path_array[path_array.length-3].substr(0,8) + '...)'
		}
		return name
	} else {
		return path_array[path_array.length-1].replace(/\.\w+$/, '')
	}
}
function pathToExtension(path) {
	var matches = path.match(/\.\w{2,24}$/)
	if (!matches || !matches.length) return '';
	return matches[0].replace('.', '').toLowerCase()
}

//Color
tinycolor.prototype.toInt = function() {
	var rgba = this.toRgb()
	return Jimp.rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a)
}




//JSON
function compileJSON(object, options) {
	var output = ''
	if (typeof options !== 'object') options = {}
	function newLine(tabs) {
		if (options.small === true) {return '';}
		var s = '\n'
		for (var i = 0; i < tabs; i++) {
			s += '\t'
		}
		return s;
	}
	function handleVar(o, tabs) {
		var out = ''
		if (typeof o === 'string') {
			//String
			out += '"' + o.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
		} else if (typeof o === 'boolean') {
			//Boolean
			out += (o ? 'true' : 'false')
		} else if (typeof o === 'number') {
			//Number
			o = (Math.round(o*100000)/100000).toString()
			out += o
		} else if (o === null || o === Infinity || o === -Infinity) {
			//Null
			out += 'null'
		} else if (typeof o === 'object' && o.constructor.name === 'Array') {
			//Array
			var has_content = false
			out += '['
			for (var i = 0; i < o.length; i++) {
				var compiled = handleVar(o[i], tabs+1)
				if (compiled) {
					var breaks = typeof o[i] === 'object'
					if (has_content) {out += ',' + (breaks || options.small?'':' ')}
					if (breaks) {out += newLine(tabs)}
					out += compiled
					has_content = true
				}
			}
			if (typeof o[o.length-1] === 'object') {out += newLine(tabs-1)}
			out += ']'
		} else if (typeof o === 'object') {
			//Object
			var breaks = o.constructor.name !== 'oneLiner';
			var has_content = false
			out += '{'
			for (var key in o) {
				if (o.hasOwnProperty(key)) {
					var compiled = handleVar(o[key], tabs+1)
					if (compiled) {
						if (has_content) {out += ',' + (breaks || options.small?'':' ')}
						if (breaks) {out += newLine(tabs)}
						out += '"' + key + '":' + (options.small === true ? '' : ' ')
						out += compiled
						has_content = true
					}
				}
			}
			if (breaks && has_content) {out += newLine(tabs-1)}
			out += '}'
		}
		return out;
	}
	return handleVar(object, 1)
}
*/
const IO = {
	import: function (options, cb) {
		if (typeof options !== 'object') {options = {}}
		$('<input '+
			'type="file'+
			'" accept=".'+(options.extensions ? options.extensions.join(',.'): '')+
			'" multiple="'+(options.multiple === true)+
		'">').change(function(e) {
			var input = this;
			var results = [];
			var result_count = 0;
			var i = 0;
			while (i < input.files.length) {
				(function() {
					var file = input.files[i]
					var reader = new FileReader()
					reader.i = i
					reader.onloadend = function() {

						if (reader.result.byteLength) {
							var arr = new Uint8Array(reader.result)
							var targa_loader = new Targa()
							targa_loader.load(arr)
							var result = targa_loader.getDataURL()
						} else {
							var result = reader.result
						}
						results[this.i] = {
							name: file.name,
							path: file.name,
							content: result
						}
						result_count++;
						if (result_count === input.files.length) {
							cb(results)
						}
					}
					if (options.readtype === 'image') {
						if (pathToExtension(file.name) === 'tga') {
							reader.readAsArrayBuffer(file)
						} else {
							reader.readAsDataURL(file)
						}
					} else if (options.readtype === 'buffer') {
						reader.readAsArrayBuffer(file)
					} else /*text*/ {
						reader.readAsText(file)
					}
					i++;
				})()
			}
		}).click()
	},
	export: function(options, cb) {
		if (!options) return;

		var file_name = options.name + (options.extensions ? '.'+options.extensions[0] : '')
		var callback_used;
		if (options.custom_writer) {
			options.custom_writer(options.content, file_name)
			
		} else if (options.savetype === 'image') {

			var download = document.createElement('a');
			download.href = options.content
			download.download = file_name;
			if (Blockbench.browser === 'firefox') document.body.appendChild(download);
			download.click();
			if (Blockbench.browser === 'firefox') document.body.removeChild(download);

		} else if (options.savetype === 'zip') {
			saveAs(options.content, file_name)

		} else {
			var blob = new Blob([options.content], {type: "text/plain;charset=utf-8"});
			saveAs(blob, file_name, {autoBOM: true})
		}
		if (options.project_file) {
			Prop.project_saved = true;
			setProjectTitle(options.name)
		}
		if (!callback_used && typeof cb === 'function') {
			cb()
		}
	}
}


export {
	bbuid, guid
}
