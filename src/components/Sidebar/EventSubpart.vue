<template>
	<div class="event_subpart">
		<div v-if="subpart.sequence">
			<div class="subpart_option_head_bar">
				<label class="descriptor_label">Sequence</label>
			</div>
			<ul class="nested_list sortable">
				<li v-for="(option, index) in subpart.sequence" :key="option.uuid">
					<div class="header_bar">
						<GripHorizontal @mousedown="sortList(subpart.sequence, $event)" />
						<label>#{{ index }}</label>
						<div class="fill_line" />
						<div class="remove_button highlighting_button" title="Remove Option" @click="removeSequenceOption(option)"><X /></div>
					</div>
					<event-subpart :subpart="option" @modify_event="modifyEvent" />
				</li>
			</ul>
			<list-add-button title="Add Sequence Option" class="list_add_button" @click="addSequenceOption()" />
		</div>
		<div v-if="subpart.randomize">
			<div class="subpart_option_head_bar">
				<label class="descriptor_label">Randomize</label>
			</div>
			<ul class="nested_list sortable">
				<li v-for="option in subpart.randomize" :key="option.uuid">
					<div class="header_bar">
						<GripHorizontal @mousedown="sortList(subpart.randomize, $event)" />
						<label>Weight</label>
						<input type="number" min="0" v-model.number="option.weight" @input="modifyEvent">
						<div class="fill_line" />
						<div class="remove_button highlighting_button" title="Remove Option" @click="removeRandomizeOption(option)"><X /></div>
					</div>
					<event-subpart :subpart="option" @modify_event="modifyEvent" />
				</li>
			</ul>
			<list-add-button title="Add Random Option" class="list_add_button" @click="addRandomizeOption()" />
		</div>
		<ul v-if="subpart.particle_effect">
			<div class="section_bar">
				<label class="descriptor_label">Particle Effect</label>
				<X :size="20" class="highlighting_button" title="Disable Particle Effect" @click="disableParticleSection()" />
			</div>
			<li class="input_wrapper">
				<label>Identifier</label>
				<prism-editor :highlight="highlightGeneric" language="" :line-numbers="false"
					v-model="subpart.particle_effect.effect"
					placeholder="space:name"
					@input="modifyEvent"
				/>
				<div class="highlighting_button" @click="selectParticleFile()" v-if="!is_extension" title="Select File"><Upload :size="22" /></div>
				<div class="highlighting_button" @click="editParticleFile()" v-if="canEditParticleFile()" title="Edit Linked Particle Effect"><Pencil :size="22" /></div>
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
			<div class="section_bar">
				<label class="descriptor_label">Sound</label>
				<X :size="20" class="highlighting_button" title="Disable Sound Effect" @click="disableSoundSection()" />
			</div>
			<li class="input_wrapper">
				<label>Sound Event</label>
				<prism-editor :highlight="highlightGeneric" language="" :line-numbers="false"
					v-model="subpart.sound_effect.event_name"
					placeholder="block.bamboo.hit"
					@input="modifyEvent"
				/>
			</li>
		</ul>
		<ul v-if="typeof subpart.expression == 'string'" title="Run a Molang expression on the event firing emitter">
			<div class="section_bar">
				<label class="descriptor_label">Expression</label>
				<X :size="20" class="highlighting_button" title="Disable Expression" @click="disableExpressionSection()" />
			</div>
			<li class="input_wrapper">
				<prism-editor :highlight="highlightMolang" language="" :line-numbers="false"
					v-model="subpart.expression"
					placeholder=""
					:autocomplete="autocomplete"
					@input="modifyEvent"
				/>
			</li>
		</ul>
		<ul class="create_bar">
			<template v-if="!subpart.sequence && !subpart.randomize">
				<li v-if="!subpart.particle_effect" @click="createParticleSection();"><Plus :size="18" />Particle</li>
				<li v-if="!subpart.sound_effect" @click="createSoundSection();"><Plus :size="18" />Sound</li>
				<li v-if="!subpart.expression" @click="createExpressionSection();"><Plus :size="18" />Expression</li>
			</template>
			<template v-if="!subpart.particle_effect && !subpart.sound_effect && subpart.expression == undefined">
				<li v-if="!subpart.sequence && !subpart.randomize" @click="createSequenceSection();"><Plus :size="18" />Sequence</li>
				<li v-if="!subpart.sequence && !subpart.randomize" @click="createRandomizeSection();"><Plus :size="18" />Randomize</li>
			</template>
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
import sort from '../../sort';
import ListAddButton from '../Form/ListAddButton.vue';
import { editEventSubEffect, EventSubEffects, loadEventSubEffect } from '../../event_sub_effects';

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
		ListAddButton,
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
		createExpressionSection() {
			Vue.set(this.subpart, 'expression', '');
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
		disableParticleSection() {
			Vue.delete(this.subpart, 'particle_effect');
			this.modifyEvent();
		},
		disableSoundSection() {
			Vue.delete(this.subpart, 'sound_effect');
			this.modifyEvent();
		},
		disableExpressionSection() {
			Vue.delete(this.subpart, 'expression');
			this.modifyEvent();
		},
		async selectParticleFile() {
			let identifier = await loadEventSubEffect();
			this.is_extension = !this.is_extension;
			this.is_extension = !this.is_extension;
			if (identifier && identifier != this.subpart.particle_effect.effect) {
				this.subpart.particle_effect.effect = identifier;
				this.modifyEvent();
			}
		},
		editParticleFile() {
			editEventSubEffect(this.subpart.particle_effect.effect);
		},
		canEditParticleFile() {
			return this.is_extension || EventSubEffects[this.subpart.particle_effect.effect] != undefined;
		},
		sortList(list, event) {
			sort(event, list);
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
	.event_subpart {
		border-left: 5px solid var(--color-bar);
		padding-left: 12px;
		padding-top: 8px;
		padding-bottom: 8px;
	}
	.event_subpart:hover {
		border-left-color: var(--color-selection);
	}
	ul.create_bar {
		display: flex;
		justify-content: center;
		gap: 6px;
		padding: 4px 6px;
		flex-wrap: wrap;
	}
	ul.create_bar > li {
		cursor: pointer;
		white-space: nowrap;
		color: var(--color-text_grayed);
		font-size: 0.96em;
	}
	ul.create_bar > li:hover {
		color: var(--color-text);
	}
	ul.create_bar > li > svg {
		vertical-align: sub;
	}
	ul.nested_list {
		margin-left: 12px;
	}
	ul.sortable > li {
		border-top: 2px solid transparent;
		border-bottom: 2px solid transparent;
	}
	ul.sortable > .sort_before {
		border-top: 2px solid var(--color-accent);
	}
	ul.sortable > .sort_after {
		border-bottom: 2px solid var(--color-accent);
	}
	.list_add_button {
		margin-left: 26px;
	}
	.header_bar {
		display: flex;
		gap: 8px;
	}
	.header_bar > label {
		padding-top: 4px;
	}
	.header_bar > svg {
		cursor: grab;
		margin-left: -2px;
		margin-top: 2px;
	}
	.header_bar .fill_line {
		flex-grow: 1;
	}
	.header_bar .fill_line::after {
		content: "";
		pointer-events: none;
		width: 100%;
		height: 2px;
		display: inline-block;
		margin: auto;
		background-color: var(--color-bar);
	}
	.add_button {
		margin-left: auto;
	}
	.remove_button {
	}
	.subpart_option_head_bar {
		display: flex;
	}
	.section_bar {
		margin-top: 8px;
		margin-bottom: 4px;
	}
	.descriptor_label {
		color: var(--color-text_grayed);
		vertical-align: middle;
		padding-right: 4px;
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