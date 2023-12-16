<template>
    <content id="sidebar">
        <div id="sidebar_content">
			<logo />
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
					<div class="sidebar_tab_tooltip">{{ tab.label }}</div>
				</div>
			</div>
			<div class="input_group" v-for="(group, group_key) in input_groups" :key="group_key">
				<h4 @click="fold(group)">{{ group.label }}</h4>
				<template v-if="!group._folded">
					<ul v-if="group.type == 'curves'">
						<curve
							class="curve"
							v-for="curve in group.curves"
							v-bind:title="group.info" :id="selected_subject_key +'-curves-'+ curve.uuid" :uuid="curve.uuid" :key="curve.uuid"
							:curve.sync="curve" :group_key.sync="group_key" :subject_key.sync="selected_subject_key"
						></curve>
						<div id="add_curve_button" @click="addCurve()">
							<i class="unicode_icon plus">{{'\uFF0B'}}</i>
						</div>
					</ul>
					<ul v-else>
						<input-group :group.sync="group" :group_key.sync="group_key" :subject_key.sync="selected_subject_key"></input-group>
					</ul>
				</template>
				<div v-else class="input_group_folded_indicator" @click="fold(group)">...</div>
			</div>
        </div>
    </content>
</template>

<script>
import Logo from './Sidebar/Logo'
import InputGroup from './Sidebar/InputGroup';
import curve from './Sidebar/Curve';
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
} from 'lucide-vue'


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
		curve,

		Wand,
		File,
		PartyPopper,
		Sparkles,
		ImageIcon: Image,
		Feather,
		Clock8,
		Tangent,
	},
	computed: {
		input_groups() {
			let input_groups = {};
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
		overflow-y: scroll;
		height: 100%;
		padding-bottom: 140px;
	}
	#sidebar_tab_bar {
		height: 45px;
		display: flex;
		background-color: var(--color-bar);
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
	.sidebar_tab:hover > .sidebar_tab_tooltip {
		display: block;
	}
	.sidebar_tab:last-of-type > .sidebar_tab_tooltip {
		right: 0;
		left: unset;
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
	.input_group > ul {
		padding: 8px;
		padding-right: 2px;
	}
	#add_curve_button {
		width: 100%;
		border: 1px dashed var(--color-bar);
		cursor: pointer;
	}
	#add_curve_button:hover {
		background-color: var(--color-dark);
	}
	#add_curve_button > i {
		margin-right: auto;
		margin-left: auto;
		opacity: 0.8;
		font-size: 1.4em;
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