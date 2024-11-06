<template>
	<ul>
		<li
			class="input_wrapper"
			v-for="(input, key) in group.inputs"
			:key="key"
			:input_type="input.type"
			v-show="isInputVisible(input, group)"
			v-bind:title="input.info"
			v-bind:id="subject_key +'-'+ group_key +'-'+ key"
		>
			<label v-bind:for="key" v-if="input.label">{{ input.label }}</label>
			<div class="tool input_expand_button" v-if="input.expandable" @click="toggleExpand(input)" title="Expand">
				<ChevronDown :size="20" v-if="!input.expanded" />
				<ChevronUp :size="20" v-else />
			</div>
			<template v-if="input.axis_count == -1">
				<!--List-->
				<div class="tool list_add_tool" v-on:click="input.value.push('')"><i class="unicode_icon plus">{{'\uFF0B'}}</i></div>
				<ul class="input_list">
					<li v-for="(item, index) in input.value" :key="index">
						<!--Text-->
						<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric" language="" :line-numbers="false"
							v-if="input.type == 'text' || input.type == 'molang'"
							v-model="input.value[index]"
							v-bind:placeholder="input.placeholder"
							v-bind:index="index"
							:autocomplete="input.type == 'molang' ? autocomplete : null"
							v-on:input="input.emitInput($event)"
							v-on:focus="input.focus(index, $event)"
						/>
						<!--Number-->
						<input
							v-if="input.type == 'number'" type="number"
							:step="input.step" :min="input.min" :max="input.max"
							v-model="input.value"
							v-on:input="input.change($event)">
						<div class="tool" v-on:click="input.value.remove(item);input.change($event);"><i class="unicode_icon">{{'\u2A09'}}</i></div>
					</li>
				</ul>
			</template>
			<div v-else class="input_right" :axes="input.axis_count" :class="{expandable: input.expandable, expanded: input.expanded, full_width: !input.label, image: input.type == 'image'}">

				<template v-if="input.axis_count == 1">
					<!--Text-->
					<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric" language="" :line-numbers="false"
						v-if="input.type == 'text' || input.type == 'molang'"
						v-model="input.value"
						:value="input.value.toString()"
						v-bind:placeholder="input.placeholder"
						:autocomplete="input.type == 'molang' ? autocomplete : (input.id == 'particle_texture_path' ? autocompletePath : null)"
						v-on:input="input.emitInput($event)"
						v-on:focus="input.focus(-1, $event)"
					/>
					<!--Number-->
					<input
						v-if="input.type == 'number'" type="number"
						:step="input.step" :min="input.min" :max="input.max"
						v-model="input.value"
						v-on:input="input.change($event)">
				</template>

				<template v-else>
					<!--Text-->
					<template v-if="input.type == 'text' || input.type == 'molang'">
						<div class="prism_editor_outer_wrapper input_vector" v-for="i in input.axis_count" :key="i">
							<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric"  :line-numbers="false"
								v-model="input.value[i-1]"
								:value="input.value[i-1].toString()"
								:index="i-1"
								:placeholder="input.placeholder"
								:autocomplete="input.type == 'molang' ? autocomplete : null"
								v-on:input="input.emitInput($event)"
								v-on:focus="input.focus(i-1, $event)" />
						</div>
					</template>
					<!--Number-->
					<template v-if="input.type == 'number'">
						<input class="input_vector" type="number"
							v-for="i in input.axis_count"
							:key="i"
							v-model="input.value[i-1]"
							:step="input.step" :min="input.min" :max="input.max"
							:index="i-1"
							v-on:input="input.change($event)">
					</template>
				</template>

				<!--Check-->
				<checkbox v-if="input.type == 'checkbox'" v-bind:id="key" v-model="input.value" @change="input.change($event)" />

				<!--Select-->
				<select v-if="input.type == 'select'" v-bind:id="key" v-model="input.meta_value" v-on:change="input.change($event)">
					<option v-for="(s_label, s_key) in input.options" :key="s_key" v-bind:id="s_key">{{s_label}}</option>
				</select>

				<!--Select+Custom-->
				<template v-if="input.type == 'select_custom'">
					<select v-bind:id="key" v-model="input.meta_value" v-on:change="input.change($event)">
						<option v-for="(s_label, s_key) in input.options" :key="s_key" v-bind:id="s_key">{{ s_label }}</option>
					</select>
					<input v-if="input.meta_value == input.options.custom" type="text" v-model="input.value" v-on:input="input.change($event)">
				</template>

				<!--Event List-->
				<template v-if="input.type == 'event_list'">
					<ul class="event_list">
						<li v-for="event_id in input.value" :key="event_id" class="event_list_event">
							<label>{{ event_id }}</label>
							<X :size="18" class="highlighting_button" @click="input.value.remove(event_id); input.change($event);" />
						</li>
						<event-picker :blacklist="input.value" @select="($event, event) => {input.value.push($event); input.change(event);}" />
					</ul>
				</template>

				<!--Event Timeline-->
				<template v-else-if="input.type == 'event_timeline'">
					<event-picker @select="($event, event) => {addEventToTimeline(input, $event, event)}" />
				</template>

				<!--Event Min Speed List-->
				<template v-if="input.type == 'event_speed_list'">
					<ul class="event_list event_speed_list">
						<li v-for="event_obj in input.value" :key="event_obj.event" class="event_list_event">
							<label>{{ event_obj.event }}</label>
							<X :size="18" class="highlighting_button" @click="input.value.remove(event_obj); input.change($event);" />
							<div class="event_min_speed">
								<label>Min Speed</label>
								<input type="number" v-model.number="event_obj.min_speed" min="0">
							</div>
						</li>
						<event-picker :blacklist="input.value.map(o => o.event)" @select="($event, event) => {input.value.push({event: $event, min_speed: 0}); input.change(event);}" />
					</ul>
				</template>

				<!--Color-->
				<color-picker v-if="input.type == 'color'" v-model="input.value" v-on:input="input.change($event, $el)"></color-picker>

				<!--Gradient-->
				<gradient v-if="input.type == 'gradient'" :input="input"></gradient>

				<!--Image-->
				<template v-if="input.type == 'image' && !input.image.hidden">
					<texture-input :input.sync="input" :data="data" />
				</template>
			</div>
			<!--Event Timeline-->
			<template v-if="input.type == 'event_timeline'">
				<ul class="event_timeline" :class="{has_entries: input.timeline.length}">
					<li v-for="entry in input.timeline" :key="entry.uuid">
						<input type="number" v-model.number="entry.time" @input="edit($event, 'change event timeline')" @blur="input.change($event)" step="0.05" min="0">

						<!--input type="number" v-model.number="entry.time" @blur="input.change($event)" step="0.05">
						<label @click="pickEventOnNameClick($event)">{{ entry.event }}</label>
						<event-picker class="event_switch_button" :replace="!!entry.event" @select="($event, event) => {entry.event = $event; input.change(event);" /-->

						<ul class="event_list timeline_event_list">
							<li v-for="event_id in entry.event" :key="event_id" class="event_list_event">
								<label>{{ event_id }}</label>
								<X :size="18" class="highlighting_button" @click="entry.event.remove(event_id); input.change($event);" />
							</li>
							<event-picker :blacklist="entry.event" @select="($event, event) => {entry.event.push($event); input.change(event);}" />
						</ul>
						<X :size="18" class="highlighting_button timeline_remove_button" @click="input.timeline.remove(entry); input.change($event);" />
					</li>
				</ul>
			</template>
		</li>
	</ul>
</template>


<script>
import VueColor from 'vue-color'
import Gradient from './Gradient';
import TextureInput from './TextureInput';
import Checkbox from '../Form/Checkbox.vue'
import EventPicker from './EventPicker.vue'
import {
	ChevronDown,
	ChevronUp,
	Plus,
	X,
} from 'lucide-vue'


import getAutocompleteData from './../../molang_autocomplete'
import getPathAutocompleteData from './../../path_autocomplete'
import 'root/packages/vue-prism-editor/dist/prismeditor.min.css';
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "root/packages/vue-prism-editor";
import "prismjs/themes/prism-okaidia.css";

import Languages from './../../languages';
import { guid } from '../../util';
import registerEdit from '../../edits';




export default {
	name: 'input-group',
	props: {
		group: Object,
		group_key: String,
		subject_key: String,
		data: Object
	},
	components: {
		PrismEditor,
		'color-picker': VueColor.Chrome,
		Gradient,
		TextureInput,
		Checkbox,
		EventPicker,
		ChevronDown,
		ChevronUp,
		Plus,
		X,
	},
	methods: {
		isInputVisible(input, group) {
			return input.isVisible(group);
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
		autocompletePath(text, position) {
			return getPathAutocompleteData(text, position, 'input')
		},
		toggleExpand(input) {
			if (input.expandable) {
				input.expanded = !input.expanded;
			}
		},
		edit(event, name) {
			registerEdit(name, event);
		},
		addEventToTimeline(input, event_id, event) {
			let entry = {
				uuid: guid(),
				event: [event_id],
				time: 0
			}
			input.timeline.push(entry);
			input.change(event);
		},
		pickEventOnNameClick(event) {
			let clicker = event.target.nextElementSibling;
			clicker.click();
		}
	}
}
</script>

<style scoped>

	.input_wrapper {
		margin: 2px 0;
	}
	.input_wrapper > label {
		width: 100px;
		text-align: right;
		vertical-align: middle;
		margin: 3px 0;
	}
	.input_right {
		display: inline-flex;
		gap: 2px;
		vertical-align: middle;
		width: calc(100% - 110px);
		margin-left: 4px;
	}
	.input_right.full_width {
		width: calc(100% - 8px);
	}
	.input_right.expandable {
		width: calc(100% - 134px);
	}
	.input_right[axes="1"] > input:not([type="checkbox"]), .input_right[axes="1"] > select:not([type="checkbox"]) {
		width: 100%;
	}
	.input_right.expanded {
		display: block;
		width: calc(100% - 7px);
	}
	.input_right.expanded input, .input_right.expanded .input_vector  {
		width: 100% !important;
		display: block;
		margin-left: 0;
	}
	.tool.input_expand_button {
		float: right;
		width: 22px;
		padding-left: 0;
		padding-top: 2px;
	}
	
	li[input_type="select_custom"] select {
		width: 140px;
		flex-grow: 1;
	}
	.input_list li {
		margin: 2px 0;
	}
	ul.input_list input, ul.input_list .prism-editor-component {
		width: calc(100% - 80px);
		margin-left: 52px;
		float: left;
	}
	.input_list li .tool {
		padding: 2px 0px;
		width: 24px;
		height: 30px;
	}

	.input_vector {
		width: 40px;
		flex-grow: 1;
	}
	.input_vector:first-child {
		margin-left: 0;
	}
	.list_add_tool {
		vertical-align: sub;
	}

	.event_list {
		position: relative;
		min-height: 30px;
		width: auto;
		flex-grow: 1;
		padding: 0 1px;
	}
	.event_list > li.event_list_event {
		height: 30px;
		display: inline-block;
		padding: 4px 13px;
		margin: 1px 2px;
		background-color: var(--color-bar);
		border-radius: 5px;
		box-shadow: 0 1px 14px rgba(0, 0, 0, 0.18);
	}
	.event_list > li.event_list_event > label {
		font-family: var(--font-code);
	}
	.event_list > li.event_list_event > svg {
		margin-top: -2px;
	}
	.event_list > div {
		display: inline-block;
		margin-top: 4px;
	}
	.timeline_event_list {
		margin-top: -2px;
		margin-bottom: 0;
	}
	.event_speed_list > li.event_list_event {
		padding: 5px;
		
	}
	.event_speed_list > li.event_list_event > .highlighting_button {
		float: right;
		margin-top: 1px;
	}
	.event_min_speed {
		width: 100%;
		display: flex;
		gap: 5px;
		border-top: 2px solid var(--color-interface);
		padding-top: 4px;
	}
	.event_min_speed > label {
		padding-top: 3px;
	}
	.event_min_speed > input {
		width: 56px;
	}
	ul.event_timeline {
		padding: 0 10px;
		margin-left: 20px;
		position: relative;
	}
	ul.event_timeline.has_entries:before {
		display: block;
		content: "";
		position: absolute;
		top: -4px;
		bottom: -2px;
		left: -11px;
		width: 6px;
		background-color: var(--color-bar);
		border-radius: 3px;
	}
	ul.event_timeline > li {
		display: block;
		position: relative;
		display: flex;
		gap: 6px;
		margin: 2px 0;
		padding-left: 2px;
	}
	ul.event_timeline > li::before {
		display: block;
		content: "";
		position: absolute;
		top: 7px;
		left: -26px;
		height: 16px;
		width: 16px;
		background-color: var(--color-title);
		border-radius: 50%;
	}
	ul.event_timeline > li:hover::before {
		filter: brightness(1.2);
	}
	ul.event_timeline > li:not(:hover) .event_switch_button {
		display: none;
	}
	ul.event_timeline > li > input {
		width: 69px;
	}
	ul.event_timeline > li > label {
		font-family: var(--font-code);
		padding: 3px;
	}
	ul.event_timeline > li > .timeline_remove_button {
		margin-left: auto;
		margin-top: 2px;
		flex-shrink: 0;
	}
</style>

