/*
import Molang from './molang'
import tinycolor from 'tinycolor2'
import Curve from './curves'




function loadFile(data) {



	if (data && data.particle_effect && startNewProject()) {

		Config
	}
}
function startNewProject() {
	if (vscode || confirm('This action may clear your current work. Do you want to continue?')) {
		forEachInput(input => {
			input.reset()
		})
		Data.effect.curves.curves.splice(0);
		updateMaterial(startAnimation)
		return true;
	}
}

function importFile() {
	IO.import({
		extensions: ['json']
	}, (files) => {
		if (files[0]) {
			loadFile(JSON.parse(files[0].content))
			startAnimation()
		}
	})
}
*/

import {IO, pathToExtension} from './util'
import {Config} from './emitter'
import vscode from './vscode_extension'
import {startAnimation} from './emitter'
import {ExpandedInput} from './components/ExpressionBar'
import Data, {forEachInput} from './input_structure'

import FireSample from '../examples/fire.particle.json'
import LoadingSample from '../examples/loading.particle.json'
import RainbowSample from '../examples/rainbow.particle.json'
import MagicSample from '../examples/magic.particle.json'
import RainSample from '../examples/rain.particle.json'
import SnowSample from '../examples/snow.particle.json'
import TrailSample from '../examples/trail.particle.json'


const Samples = {
	fire: FireSample,
	loading: LoadingSample,
	rainbow: RainbowSample,
	magic: MagicSample,
	rain: RainSample,
	snow: SnowSample,
	trail: TrailSample,
}

function updateInputsFromConfig() {
	forEachInput(input => {
		input.value = Config[input.id];
	})
}
//function importFile() {}
function loadFile(data) {
	if (data && data.particle_effect && startNewProject()) {
		Config.setFromJSON(data);
		updateInputsFromConfig();
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
function startNewProject() {
	if (vscode || confirm('This action may clear your current work. Do you want to continue?')) {
		Config.reset();
		updateInputsFromConfig();
		return true;
	}
}

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

function loadPreset(id) {
	loadFile(Samples[id])
}


if (vscode) {
	
	async function confirmSystemSetup() {
		/*
		if (System.isSetup) return;

		return new Promise((resolve, reject) => {
			System.onSetup = function() {
				resolve()
			}
		})*/
	}

    async function updateContent(text) {
        if (text && typeof text == 'string') {

			await confirmSystemSetup()

			let parsed = JSON.parse(text)
			loadFile(parsed, true)
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
}
	

export {
	importFile,
	loadFile,
	loadPreset,
	startNewProject
}
