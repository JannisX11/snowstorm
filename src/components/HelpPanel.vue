<template>
	<div id="help_panel" :class="{portrait_view: portrait_view}">
		<div class="help_header">
			<X class="close_button highlighting_button" v-if="!portrait_view" :size="22" @click="$emit('close')" />
			<a class="back_button" v-if="category_key" @click="openPage('', '')"><ChevronLeft :size="20" /> Back to overview</a>
		</div>

		<content v-if="!category_key">
			<h1>Documentation</h1>
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

			<HelpInputList v-if="page.inputs" :inputs="page.inputs" :category_key="category_key" :page_key="page_key" />
		</content>
	</div>
</template>

<script>
import HelpData from './../help'
import { X, ChevronLeft } from 'lucide-vue'
import HelpText from './HelpPanel/HelpText.vue';
import HelpInputList from './HelpPanel/HelpInputList.vue';
import Vue from 'vue';

// Manually register globally to avoid circular reference
Vue.component('HelpInputList', HelpInputList);
Vue.component('HelpText', HelpText);

export default {
	name: 'help-panel',
	data() {return {
		category_key: '',
		page_key: '',
		HelpData,
	}},
	components: {
		HelpText,
		HelpInputList,
		X,
		ChevronLeft,
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
		}
	}
}
</script>

<style scoped>
	#help_panel {
		display: flex;
		flex-direction: column;
	}
	#help_panel:not(.portrait_view) {
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
	#help_panel.portrait_view {
		width: 100%;
		max-width: 100%;
		background-color: var(--color-interface);
	}
	.help_header {
		flex-shrink: 0;
	}
	#help_panel > content {
		overflow-y: auto;
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
	#help_panel.portrait_view .back_button {
		height: 43px;
		padding: 10px;
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
	#help_panel.portrait_view ul li {
		padding-top: 5px;
		padding-bottom: 5px;
	}
	ul > li > ul {
		padding-left: 2px;
	}
	li > ul > li {
		padding-left: 25px;
		margin-left: -2px;
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
</style>