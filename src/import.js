import {IO, pathToExtension} from './util'
import {Config} from './emitter'
import vscode from './vscode_extension'
import {Emitter} from './emitter'
import {ExpandedInput} from './components/ExpressionBar'
import Data, {forEachInput} from './input_structure'

import FireSample from '../examples/fire.particle.json'
import LoadingSample from '../examples/loading.particle.json'
import RainbowSample from '../examples/rainbow.particle.json'
import MagicSample from '../examples/magic.particle.json'
import RainSample from '../examples/rain.particle.json'
import SnowSample from '../examples/snow.particle.json'
import TrailSample from '../examples/trail.particle.json'
import BillboardSample from '../examples/billboard.particle.json'
import Curve from './curves'
import registerEdit from './edits'


const Samples = {
	fire: FireSample,
	loading: LoadingSample,
	rainbow: RainbowSample,
	magic: MagicSample,
	rain: RainSample,
	snow: SnowSample,
	trail: TrailSample,
	billboard: BillboardSample,
}

function updateInputsFromConfig() {
	forEachInput(input => {
		input.value = Config[input.id];
		if (input.type === 'select') {
			input.update(Data)
		}
	})
	Data.effect.curves.curves.splice(0, Infinity);
	for (var id in Config.curves) {
		let data = Config.curves[id];
		let curve = new Curve(data);
		curve.inputs.id.value = id;
		Data.effect.curves.curves.push(curve);
		Config.curves[id] = curve.config;
		curve.updateMinMax();
	}
	Data.effect.meta.inputs.identifier.onchange();
}
//function importFile() {}
function updateConfig(data) {
	Config.setFromJSON(data);
	updateInputsFromConfig();
}
function loadFile(data) {
	if (data && data.particle_effect && startNewProject()) {
		updateConfig(data);
		Emitter.stop(true).playLoop();
		registerEdit('load file')
	}
}

function importFile() {
	IO.import({
		extensions: ['json']
	}, (files) => {
		if (files[0]) {
			loadFile(JSON.parse(files[0].content))
		}
	})
}
function startNewProject(force) {
	if (vscode || force || confirm('This action may clear your current work. Do you want to continue?')) {
		Config.reset();
		updateInputsFromConfig();
		return true;
	}
}

document.addEventListener('readystatechange', () => {
	Emitter.start().playLoop();
});

function loadPreset(id) {
	loadFile(Samples[id])
}


if (vscode) {
	
	async function confirmSystemSetup() {
	}

    async function updateContent(text) {
        if (text && typeof text == 'string') {

			await confirmSystemSetup()

			let parsed = JSON.parse(text)
			updateConfig(parsed, true)
			if (ExpandedInput.input) {
				ExpandedInput.input.focus()
			}
        }
    }

    window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				updateContent(text);

				vscode.setState({ text });

				return;
		}
    });
    
    const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
} else {
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
					Emitter.playLoop();
				}
				reader.readAsText(file)
				event.preventDefault()
			}
		}
	}
}
	

export {
	importFile,
	loadFile,
	loadPreset,
	startNewProject
}
