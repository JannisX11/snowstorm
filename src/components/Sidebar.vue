<template>
    <content id="sidebar">
        <div id="sidebar_content">
			<logo v-if="!portrait_view" />
			<div id="sidebar_tab_bar">
				<div class="sidebar_tab"
					v-for="(tab, tab_key) in data" :key="tab_key"
					:class="{selected: tab_key == selected_subject_key}"
					@click="selectSubject(tab_key)"
				>
					<Wand v-if="tab_key == 'setup'" />
					<File v-if="tab_key == 'effect'" />
					<PartyPopper v-if="tab_key == 'emitter'" />
					<Sparkles v-if="tab_key == 'appearance'" />
					<ImageIcon v-if="tab_key == 'texture'" />
					<Feather v-if="tab_key == 'motion'" />
					<Clock8 v-if="tab_key == 'lifetime'" />
					<Tangent v-if="tab_key == 'variables'" />
					<Zap v-if="tab_key == 'events'" />
					<div class="sidebar_tab_tooltip">{{ tab.label }}</div>
				</div>
			</div>

			<h3>{{ selected_subject.label }}</h3>
			<div class="input_group" v-for="(group, group_key) in input_groups" :key="group_key">
				<h4 @click="fold(group)">
					{{ group.label }}
					<div class="highlighting_button help_button" @click.stop="openHelp(selected_subject_key, group_key)">?</div>
				</h4>
				<template v-if="!group._folded">
					<ul v-if="group.type == 'curves'">
						<curve
							class="curve"
							v-for="curve in group.curves"
							v-bind:title="group.info" :id="selected_subject_key +'-curves-'+ curve.uuid" :uuid="curve.uuid" :key="curve.uuid"
							:curve.sync="curve" :group_key.sync="group_key" :subject_key.sync="selected_subject_key"
						></curve>
						<list-add-button id="add_curve_button" @click="addCurve()" />
					</ul>
					<event-list v-else-if="group.type == 'events'" :group.sync="group" />
					<ul v-else>
						<input-group :group.sync="group" :group_key.sync="group_key" :subject_key.sync="selected_subject_key" :data="data"></input-group>
					</ul>
				</template>
				<div v-else class="input_group_folded_indicator" @click="fold(group)">...</div>
			</div>

			<div class="input_group" v-if="selected_subject_key == 'effect'">
				<button id="test_quick_setup_button" @click="selectSubject('setup')">
					<Wand />
					Quick Setup
				</button>
			</div>

			<!--Quick Setup-->
			<template v-if="selected_subject_key == 'setup'">
				<quick-setup :data="data" />
			</template>
        </div>
    </content>
</template>

<script>
import Logo from './Sidebar/Logo'
import InputGroup from './Sidebar/InputGroup';
import curve from './Sidebar/Curve';
import QuickSetup from './Sidebar/QuickSetup.vue';
import {Curve, updateCurvesPanel} from './../curves'

import Data from './../input_structure'

import {
	Wand,
	File,
	PartyPopper,
	Sparkles,
	Image,
	Feather,
	Clock8,
	Tangent,
	Zap,
	Plus,
	HelpCircle,
} from 'lucide-vue'
import EventList from './Sidebar/EventList.vue';
import ListAddButton from './Form/ListAddButton.vue';


export default {
	name: 'sidebar',
	data() {return {
		data: Data,
		selected_subject: Data.effect,
		selected_subject_key: 'effect'
	}},
	components: {
		Logo,
		InputGroup,
		QuickSetup,
		EventList,
		curve,

		Wand,
		File,
		PartyPopper,
		Sparkles,
		ImageIcon: Image,
		Feather,
		Clock8,
		Tangent,
		Zap,
		Plus,
		ListAddButton,
		HelpCircle
	},
	props: {
		portrait_view: Boolean
	},
	computed: {
		input_groups() {
			let input_groups = {};
			if (this.tab_key == 'setup') return input_groups;
			for (let key in this.selected_subject) {
				if (typeof this.selected_subject[key] == 'object') {
					input_groups[key] = this.selected_subject[key];
				}
			}
			return input_groups;
		}
	},
	methods: {
		selectSubject(key) {
			this.selected_subject = this.data[key];
			this.selected_subject_key = key;
		},
		fold: function(group) {
			group._folded = !group._folded
			if (group.curves && !group._folded) {
				updateCurvesPanel();
			}
		},
		openHelp(tab_key, group_key) {
			this.$emit('open_help_page', tab_key, group_key);
		},
		updateSize(e) {
			updateCurvesPanel()
		},
		addCurve() {
			Data.variables.curves.curves.push(new Curve())
		}
	}
}
</script>

<style scoped>
	content {
		border-right: 1px solid var(--color-border);
	}
	content > div {
		overflow-y: auto;
		height: 100%;
		padding-bottom: 60px;
	}
	#sidebar_tab_bar {
		height: 45px;
		display: flex;
		background-color: var(--color-bar);
		position: sticky;
		top: 0;
		z-index: 6;
		box-shadow: 0 1px 12px rgba(0, 0, 0, 0.34);
	}
	.portrait_view #sidebar_tab_bar {
		top: auto;
		position: absolute;
		right: 0;
		left: 0;
		bottom: 36px;
		box-shadow: none;
		border-bottom: 1px solid var(--color-border)
	}
	.sidebar_tab {
		flex: 1 0.5 45px;
		text-align: center;
		cursor: pointer;
		padding: 10px 4px;
		position: relative;
		background-color: inherit;
	}
	.sidebar_tab.selected {
		background-color: var(--color-title);
		color: var(--color-highlight);
	}
	.sidebar_tab:hover {
		color: var(--color-highlight);
	}
	.sidebar_tab_tooltip {
		background-color: inherit;
		height: 28px;
		min-width: 100%;
		display: none;
		position: absolute;
		padding: 2px 8px;
		bottom: -28px;
		left: 0;
		white-space: nowrap;
	}
	.portrait_view .sidebar_tab_tooltip {
		top: -28px;
	}
	.sidebar_tab:hover > .sidebar_tab_tooltip {
		display: block;
	}
	.sidebar_tab:last-of-type > .sidebar_tab_tooltip {
		right: 0;
		left: unset;
	}
	.help_button {
		width: 30px;
		text-align: center;
		height: 32px;
		margin: -5px -9px;
		padding-top: 4px;
		font-family: arial, sans-serif;
	}
	#test_quick_setup_button {
		display: block;
		margin: auto;
		margin-top: 16px;
	}
	h3 {
		margin: 8px;
		margin-bottom: -2px;
		font-size: 1.1em;
		text-align: center;
		text-transform: uppercase;
		padding-left: 12px;
		color: var(--color-text_grayed);
		cursor: pointer;
	}
	.input_subject {
		border-right: 1px solid var(--color-border);
		overflow-x: visible;
	}
	.input_subject h3 {
		background-color: var(--color-title);
		padding: 4px;
		font-size: 1.4em;
		padding-left: 12px;
	}
	#add_curve_button {
		width: 100%;
		border: 1px dashed var(--color-bar);
		padding: 2px;
		cursor: pointer;
	}
	#add_curve_button:hover {
		background-color: var(--color-dark);
	}
	#add_curve_button > svg {
		margin: auto;
		opacity: 0.8;
		display: block;
	}


</style>

<style>
	.input_group:not(:last-of-type) {
		border-bottom: 1px solid var(--color-border);
	}
	.input_group h4 {
		padding: 10px;
		font-size: 1.2em;
		padding-left: 12px;
		color: var(--color-text_grayed);
		cursor: pointer;
	}
	.input_group h4:hover {
		filter: brightness(1.1);;
	}
	.help_button {
		float: right;
	}
	.input_group > ul {
		padding: 8px;
		padding-right: 2px;
	}
	.input_group_folded_indicator {
		height: 32px;
		text-align: center;
		color: var(--color-text_grayed);
		font-size: 30px;
		line-height: 6px;
		cursor: pointer;
	}
	.input_group_folded_indicator:hover {
		color: var(--color-text);
	}
</style>