var header_vue, footer_vue;

$.ajaxSetup({ cache: false });

var OpenOverlay;
class Overlay {
	constructor(el, options) {
		options = options||0;

		this.el = el;
		this.backdrop = options.backdrop;
		this.onopen = options.onopen;
		this.onclose = options.onclose;
	}
	open(d) {
		OpenOverlay = this;
		this.el.fadeIn(200)
		if (this.backdrop) {
			$('#backdrop').fadeIn(200)
		}
		if (this.onopen) {
			this.onopen(d)
		}
	}
	close(d) {
		if (this.onclose) {
			this.onclose(d)
		}
		OpenOverlay = null;
		this.el.fadeOut(200)
		if (this.backdrop) {
			$('#backdrop').fadeOut(200)
		}
	}
}
var ExpandedInput, MolangSheet;
$(document).ready(() => {

	header_vue = new Vue({
		el: 'header',
		data: {
			bar: [
				{
					label: 'File',
					children: [
						{label: 'Start Over', click: () => {startNewProject()}},
						{label: 'Import', click: () => {importFile()}},
						{label: 'Download', click: () => {downloadFile()}},
						{label: 'View JSON', click: () => {openFileTab()}},
					]
				},
				{
					label: 'Examples',
					children: [
						{label: 'Loading', 	click: () => {loadPreset('loading')}},
						{label: 'Rain', 	click: () => {loadPreset('rain')}},
						{label: 'Snow', 	click: () => {loadPreset('snow')}},
						{label: 'Fire', 	click: () => {loadPreset('fire')}},
						{label: 'Magic', 	click: () => {loadPreset('magic')}},
						{label: 'Trail', 	click: () => {loadPreset('trail')}},
						//{label: 'Explosion',click: () => {loadPreset('explosion')}},
					]
				},
				{
					label: 'Help',
					children: [
						{label: 'Format Documentation', click: () => { open('https://bedrock.dev/1.12.0.0/1.12.0.4/Particles') }},
						{label: 'MoLang Sheet', click: () => { MolangSheet.open() }},
						{label: 'Report a Bug', click: () => { open('https://github.com/JannisX11/snowstorm/issues') }},
						{label: 'Discord Channel', click: () => { open('https://discord.gg/eGqsNha') }},
					]
				}
			]
		}
	})
	footer_vue = new Vue({
		el: 'footer',
		data: {
			fps: 0,
			particles: 0
		},
		methods: {
			fold: function(group) {
				group._folded = !group._folded
			}
		}
	})

	MolangSheet = new Overlay($('#molang_sheet'), {
		
	})


	ExpandedInput = {
		input: 0,
		axis: null
	}
	ExpandedInput.obj = $('#expression_bar input')
	.on('input', function(e) {
		if (!ExpandedInput.input) return;
		var val = $(this).val()
		var input = ExpandedInput.input;
		if (input.axis_count > 1 || input.type == 'list') {
			var arr = [];
			for (var i = 0; i < input.axis_count; i++) {
				arr[i] = (i == ExpandedInput.axis) ? val : input.value[i];
			}
			input.set(arr)
		} else {
			input.value = val;
		}
	})

	document.ondragover = function(event) {
		event.preventDefault()
	}
	document.body.ondrop = function(event) {
		var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
		if (file) {
			if (pathToExtension(file.name) === 'json') {
				var reader = new FileReader()
				reader.onloadend = function() {

					loadFile(JSON.parse(reader.result))
					startAnimation()
				}
				reader.readAsText(file)
				event.preventDefault()
			}
		}
	}

})
.keypress(e => {
	var input_focus = $('input[type="text"]:focus, input[type="number"]:focus, div[contenteditable="true"]:focus, textarea:focus').length > 0
	if (input_focus) return;

	if (e.which === 32) {
		startAnimation()
	} else if (e.which === 13) {
		if (OpenOverlay == ExpandedInput) {
			OpenOverlay.close()
		}
	}
})
.mousedown(e => {
	if (OpenOverlay) {
		if (!OpenOverlay.el.has(e.target).length) {
			OpenOverlay.close()
		}
	}
})


window.onbeforeunload = function() {
	if (System.code_window) {
		System.code_window.close()
	}
	return 'Your changes might not be saved';
}
