<template>
	<div id="help_panel">
		<X class="close_button highlighting_button" :size="22" @click="$emit('close')" />
		<a class="back_button" v-if="category_key" @click="openPage('', '')"><ChevronLeft :size="20" /> Back to overview</a>

		<content v-if="!category_key">
			<ul>
				<li v-for="(cat, cat_key) in HelpData">
					<span class="category_title">{{ cat.title }}</span>
					<ul>
						<li v-for="(pg, pg_key) in HelpData[cat_key].pages" class="clickable" @click="openPage(cat_key, pg_key)">{{ pg.title }}</li>
					</ul>
				</li>
			</ul>
		</content>
		<content v-else-if="page">

			<h1>{{ page.title }}</h1>
			<HelpText v-if="page.text" :text="page.text"></HelpText>

			<template v-if="page.inputs">
				<div v-for="(input, inp_key) of page.inputs"Y :class="{input_help: true, visible: isInputVisible(inp_key)}">
					<h2>{{ input.name || getInput(inp_key).label }}</h2>
					<div v-if="labels[input.type]">
						<span class="input_type_label">{{ labels[input.type] }}</span>
						<span class="input_evaluation" v-if="input.evaluation">{{ labels['evaluation_'+input.evaluation] }}</span>
					</div>
					<p>{{ input.info || getInput(inp_key).info }}</p>
					<HelpText v-if="input.text" :text="input.text"></HelpText>
				</div>
			</template>

		</content>
	</div>
</template>

<script>

/**
General
	Documentation
	Molang
File
	File
	Space
Emitter
Motion
Appearance
 */

import HelpData from './../help'

import { X, ChevronLeft } from 'lucide-vue'
import HelpText from './HelpText.vue';
import Data from './../input_structure'

export default {
	name: 'help-panel',
	data() {return {
		category_key: '',
		page_key: '',
		HelpData,
		labels: {
			text: 'Text',
			number: 'Number',
			molang: 'MoLang',
			toggle: 'Toggle',
			evaluation_once: 'Evaluated once',
			evaluation_per_tick: 'Evaluated each tick',
			evaluation_per_particle: 'Evaluated once per particle emitted',
		}
	}},
	components: {
		X, ChevronLeft, HelpText
	},
	props: {
		portrait_view: Boolean
	},
	computed: {
		page() {
			return HelpData[this.category_key]?.pages[this.page_key];
		}
	},
	methods: {
		openPage(category_key, page_key) {
			this.category_key = category_key;
			this.page_key = page_key;
		},
		getInput(input_key) {
			let input = Data[this.category_key]?.[this.page_key]?.inputs[input_key];
			return input ?? 0;
		},
		isInputVisible(input_key) {
			let input = this.getInput(input_key);
			if (!input) return true;
			let group = Data[this.category_key]?.[this.page_key];
			return input.isVisible(group);
		}
	}
}
</script>

<style scoped>
	#help_panel {
		width: 482px;
		max-width: 100%;
		background-color: var(--color-interface);
		right: 0;
		top: 32px;
		bottom: 33px;
		position: absolute;
		z-index: 5;
		left: auto;
		grid-area: none;
		border: 1px solid var(--color-border);
	}
	#help_panel > content {
		overflow-y: auto;
		height: calc(100% - 30px);
		display: block;
		padding: 14px;
	}
	.close_button {
		margin: 4px 4px;
	}
	.back_button {
		cursor: pointer;
		height: 29px;
		padding: 2px;
		padding-right: 8px;
		display: inline-block;
		vertical-align: bottom;
	}
	.back_button:hover {
		color: var(--color-highlight);
	}
	.back_button svg {
		margin-top: -2px;
	}
	ul li {
		padding: 3px 7px;
	}
	ul > li > ul {
		padding-left: 4px;
		list-style: inside disc;
	}
	.category_title {
		color: var(--color-text_grayed);
		text-transform: uppercase;
	}
	li.clickable {
		cursor: pointer;
	}
	li.clickable:hover {
		color: var(--color-highlight);
    	background: var(--color-bar);
	}
	.input_help:not(.visible) {
		opacity: 0.4;
	}
	.input_type_label {
		padding: 0px 8px;
		border-radius: 4px;
		color: var(--color-border);
		background-color: var(--color-accent);
	}
	.input_evaluation {
		padding: 0px 8px;
		border-radius: 4px;
		color: var(--color-highlight);
		color: color-mix(in srgb, var(--color-text) 50%, var(--color-highlight) 50%);
		background-color: var(--color-selection);
	}
</style>