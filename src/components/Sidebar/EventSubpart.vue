<template>
	<div class="event_subpart">
		<div v-if="subpart.sequence">
			<div class="subpart_option_head_bar">
				<label class="descriptor_label">Sequence</label>
				<div class="add_button" @click="addSequenceOption()"><Plus /></div>
			</div>
			<ul class="nested_list">
				<li v-for="option in subpart.sequence" :key="option.uuid">
					<div class="header_bar">
						<GripHorizontal />
						<div class="remove_button" @click="removeSequenceOption(option)"><X /></div>
					</div>
					<event-subpart :subpart="option" @modify_event="modifyEvent" />
				</li>
			</ul>
		</div>
		<div v-if="subpart.randomize">
			<div class="subpart_option_head_bar">
				<label class="descriptor_label">Randomize</label>
				<div class="add_button" @click="addRandomizeOption()"><Plus /></div>
			</div>
			<ul class="nested_list">
				<li v-for="option in subpart.randomize" :key="option.uuid">
					<div class="header_bar">
						<GripHorizontal />
						<label>Weight</label>
						<input type="number" min="0" v-model.number="option.weight" @input="modifyEvent">
						<div class="remove_button" @click="removeRandomizeOption(option)"><X /></div>
					</div>
					<event-subpart :subpart="option" @modify_event="modifyEvent" />
				</li>
			</ul>
		</div>
		<ul v-if="subpart.particle_effect">
			<label class="descriptor_label">Sound</label>
			<li class="input_wrapper">
				<label>Particle Effect</label>
				<prism-editor :highlight="highlightGeneric" language="" :line-numbers="false"
					v-model="subpart.particle_effect.effect"
					placeholder="space:name"
					@input="modifyEvent"
				/>
				<div class="icon_button" title="Select File" v-if="!is_extension"><Upload /></div>
				<div class="icon_button"><Pencil /></div>
			</li>
			<li class="input_wrapper">
				<label>Type</label>
				<select v-model="subpart.particle_effect.type" @change="modifyEvent">
					<option v-for="(s_label, s_key) in emitter_type_options" :key="s_key" :value="s_key" :id="s_key">{{ s_label }}</option>
				</select>
			</li>
			<li class="input_wrapper">
				<label>Expression</label>
				<prism-editor :highlight="highlightMolang" language="" :line-numbers="false"
					v-model="subpart.particle_effect.pre_effect_expression"
					placeholder=""
					:autocomplete="autocomplete"
					@input="modifyEvent"
				/>
			</li>
		</ul>
		<ul v-if="subpart.sound_effect">
			<label class="descriptor_label">Sound</label>
			<li class="input_wrapper">
				<label>Sound Event</label>
				<prism-editor :highlight="highlightGeneric" language="" :line-numbers="false"
					v-model="subpart.sound_effect.event_name"
					placeholder="block.bamboo.hit"
					@input="modifyEvent"
				/>
			</li>
		</ul>
		<ul class="create_bar">
			<li v-if="!subpart.particle_effect" @click="createParticleSection();">Particle Effect</li>
			<li v-if="!subpart.sound_effect" @click="createSoundSection();">Sound</li>
			<li v-if="!subpart.sequence" @click="createSequenceSection();">Sequence</li>
			<li v-if="!subpart.randomize" @click="createRandomizeSection();">Randomize</li>
		</ul>
	</div>
</template>

<script>

import Vue from 'vue';
import { guid } from '../../util';
import { Plus, X, GripHorizontal, Upload, Pencil } from 'lucide-vue'
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "root/packages/vue-prism-editor";
import "prismjs/themes/prism-okaidia.css";
import Languages from './../../languages';
import vscode from '../../vscode_extension';
import getAutocompleteData from '../../molang_autocomplete';

const emitter_type_options = {
	emitter: 'Emitter',
	emitter_bound: 'Emitter Bound',
	particle: 'Particle',
	particle_with_velocity: 'Particle with Velocity',
};

export default {
	name: 'event-subpart',
	components: {
		Plus,
		X,
		GripHorizontal,
		PrismEditor,
		Upload,
		Pencil,
	},
	props: {
		subpart: Object
	},
	data() {return {
		emitter_type_options,
		is_extension: !!vscode
	}},
	methods: {
		createSequenceSection() {
			Vue.set(this.subpart, 'sequence', [{
				uuid: guid()
			}]);
			this.modifyEvent();
		},
		createRandomizeSection() {
			Vue.set(this.subpart, 'randomize', [{
				uuid: guid(),
				weight: 1
			}]);
			this.modifyEvent();
		},
		createParticleSection() {
			Vue.set(this.subpart, 'particle_effect', {
				effect: '',
				type: 'emitter',
				pre_effect_expression: '',
			});
			this.modifyEvent();
		},
		createSoundSection() {
			Vue.set(this.subpart, 'sound_effect', {
				event_name: ''
			});
			this.modifyEvent();
		},
		addSequenceOption() {
			let option = {
				uuid: guid()
			}
			this.subpart.sequence.push(option);
			this.modifyEvent();
		},
		addRandomizeOption() {
			let option = {
				uuid: guid(),
				weight: 1
			}
			this.subpart.randomize.push(option);
			this.modifyEvent();
		},
		removeSequenceOption(option) {
			this.subpart.sequence.remove(option);
			if (this.subpart.sequence.length == 0) {
				Vue.delete(this.subpart, 'sequence');
			}
			this.modifyEvent();
		},
		removeRandomizeOption(option) {
			this.subpart.randomize.remove(option);
			if (this.subpart.randomize.length == 0) {
				Vue.delete(this.subpart, 'randomize');
			}
			this.modifyEvent();
		},
		modifyEvent(event) {
			this.$emit('modify_event', event);
		},
		highlightMolang(code) {
			return Prism.highlight(code, Languages.molang)
		},
		highlightGeneric(code) {
			return Prism.highlight(code, Languages.generic)
		},
		autocomplete(text, position) {
			return getAutocompleteData(text, position, 'input')
		},
	}
}
</script>


<style scoped>
	.event_subpart > div {
		margin: 10px 0;
	}
	ul.create_bar {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 4px 6px;
		flex-wrap: wrap;
	}
	ul.create_bar > li {
		cursor: pointer;
		text-decoration: underline;
		white-space: nowrap;
	}
	ul.create_bar > li:hover {
		color: var(--color-highlight);
	}
	ul.nested_list {
		margin-left: 12px;
		border-left: 5px solid var(--color-bar);
		padding-left: 12px;
	}
	.header_bar {
		display: flex;
	}
	.add_button {
		margin-left: auto;
	}
	.remove_button {
		margin-left: auto;
	}
	.subpart_option_head_bar {
		display: flex;
	}
	.descriptor_label {
		color: var(--color-text_grayed);
	}
	.input_wrapper {
		display: flex;
		gap: 8px;
		margin: 2px 0;
	}
	.input_wrapper > label {
		width: 95px;
		text-align: right;
		vertical-align: middle;
		margin: 3px 0;
		flex-shrink: 0;
	}
	.input_wrapper > select {
		flex-grow: 1;
	}

</style>