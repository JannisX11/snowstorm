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

//String
*/
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
			out += '"' + o.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r\n/g, '\\n').replace(/\t/g, '\\t') + '"'
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
		} else if (typeof o === 'object' && o instanceof Array) {
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

function convertTouchEvent(event) {
	if (event && event.changedTouches && event.changedTouches.length && event.offsetX == undefined) {
		event.preventDefault();
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		event.offsetX = event.changedTouches[0].clientX;
		event.offsetY = event.changedTouches[0].clientY;

		let offset = calculateOffset(event.target);
		if (offset) {
			event.offsetX -= offset[0];
			event.offsetY -= offset[1];
		}
	}
	return event;
}

function calculateOffset(element) {
	var rect = element.getBoundingClientRect();
	return [
		rect.left + window.scrollX,
		rect.top + window.scrollY,
	]
}

const IO = {
	import: function (options, cb) {
		if (typeof options !== 'object') {options = {}}
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = options.extensions ? '.' + options.extensions.join(',.') : '';
		input.multiple = options.multiple === true;
		input.onchange = function(e) {

			window.input = input;
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
		}
		input.click();
	},
	export: function(options, cb) {
		if (!options) return;

		var file_name = options.name + (options.extensions ? '.'+options.extensions[0] : '')
		var callback_used;

		if (window.chooseFile) {}
		if (options.custom_writer) {
			options.custom_writer(options.content, file_name)
			
		} else if (options.savetype === 'image') {

			var element = document.createElement('a');
			element.href = options.content
			element.download = file_name;
			element.style.display = 'none';
			if (Blockbench.browser === 'firefox') document.body.appendChild(element);
			element.click();
			if (Blockbench.browser === 'firefox') document.body.removeChild(element);

		} else if (options.savetype === 'zip') {
			saveAs(options.content, file_name)

		} else {
			//var blob = new Blob([options.content], {type: "text/plain;charset=utf-8"});

			var element = document.createElement('a');
			element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(options.content);
			element.download = file_name
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);


			//saveAs(blob, file_name, {autoBOM: true})
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
	bbuid, guid,
	compileJSON,
	IO,
	pathToExtension,
	pathToName,
	convertTouchEvent,
	calculateOffset,
}
