

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

(function() {
	let previous_text;
	setInterval(_ => {
		if (open_mode == 'code') {
			var content = compileJSON(generateFile())
			if (content != previous_text) {
				$('code#code').text(content);
				Prism.highlightAll();
				previous_text = content;
			}
		}
	}, 200)
})()


if (window.parent !== window) {
	console.log('Snowstorm trapped')
	window.addEventListener('message', event => {
		console.log('C: '+JSON.stringify(event.data));
		Data.effect.meta.identifier.value = 'v5'
	}, false)

	setTimeout(() => {
		window.parent.postMessage({type: 'test', data: 'hey from snowstorm'})
	}, 600)
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
						{label: 'Format Documentation', click: () => { open('https://bedrock.dev/r/Particles') }},
						{label: 'MoLang Sheet', click: () => { MolangSheet.open() }},
						{label: 'Report a Bug', click: () => { open('https://github.com/JannisX11/snowstorm/issues') }},
						{label: 'Discord Channel', click: () => { open('https://discord.gg/eGqsNha') }},
					]
				},
				{
					label: 'View',
					children: [
						{label: 'Grid Visibility', click: () => { View.grid.visible = !View.grid.visible }},
						{label: 'Axis Helper Visibility', click: () => { View.helper.visible = !View.helper.visible }},
						{label: 'Take Screenshot', click: () => { View.screenshot() }},
					]
				}
			]
		}
	})


	MolangSheet = new Overlay($('#molang_sheet'), {
		
	})





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
