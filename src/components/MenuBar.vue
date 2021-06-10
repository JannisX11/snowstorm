<template>
    <ul id="menu_bar">
        <li v-for="menu in Menu" :key="menu.id">
            <a>{{ menu.label }}</a>
            <ul class="menu_dropdown">
                <li v-for="entry in menu.children" :key="entry.id" v-on:click="entry.click(getVM(), $event)">
                    <a>{{ entry.label }}</a>
                </li>
            </ul>
        </li>
		<template v-if="isVSCExtension">
        	<li class="mode_selector" @click="openCodeViewer(true)" title="Open Code View to Side"><i class="unicode_icon split">{{'\u2385'}}</i></li>
        	<li class="mode_selector" @click="openCodeViewer(false)" title="Open as Code View">Open Code</li>
		</template>
		<template v-else-if="!portrait_view">
        	<li class="mode_selector code" :class="{selected: selected_tab == 'code'}" @click="$emit('changetab', 'code')">Code</li>
        	<li class="mode_selector preview" :class="{selected: selected_tab == 'preview'}" @click="$emit('changetab', 'preview')">Preview</li>
		</template>
    </ul>
</template>

<script>
import {downloadFile} from '../export'
import {importFile,	loadPreset,	startNewProject} from '../import'
import {View} from './Preview'

import vscode from '../vscode_extension'
const isVSCExtension = !!vscode;

function openLink(link) {
	if (vscode) {
		vscode.postMessage({
            type: 'link',
            link
        });
	} else {
		open(link)
	}
}

const Menu = [
	{
		label: 'File',
		children: [
			{label: 'New File', click: () => {startNewProject()}},
		]
	},
	{
		label: 'Examples',
		children: [
			{label: 'Loading', 	click: () => {loadPreset('loading')}},
			{label: 'Rainbow', 	click: () => {loadPreset('rainbow')}},
			{label: 'Rain', 	click: () => {loadPreset('rain')}},
			{label: 'Snow', 	click: () => {loadPreset('snow')}},
			{label: 'Fire', 	click: () => {loadPreset('fire')}},
			{label: 'Magic', 	click: () => {loadPreset('magic')}},
			{label: 'Trail', 	click: () => {loadPreset('trail')}},
			{label: 'Billboard',click: () => {loadPreset('billboard')}},
		]
	},
	{
		label: 'View',
		children: [
			{label: 'Grid Visibility', click: () => { View.grid.visible = !View.grid.visible }},
			{label: 'Axis Helper Visibility', click: () => { View.helper.visible = !View.helper.visible }},
			{label: 'Take Screenshot', click: () => { View.screenshot() }},
		]
	},
	{
		label: 'Help',
		children: [
			{label: 'Format Documentation', click: () => { openLink('https://bedrock.dev/r/Particles') }},
			{label: 'MoLang Sheet', click: (vm) => { vm.openDialog('molang_sheet') }},
			{label: 'MoLang Grapher', click: () => { openLink('https://jannisx11.github.io/molang-grapher/') }},
			{label: 'Report a Bug', click: () => { openLink('https://github.com/JannisX11/snowstorm/issues') }},
			{label: 'Discord Channel', click: () => { openLink('https://discord.gg/eGqsNha') }},
		]
	}
]

if (!isVSCExtension) {
	Menu[0].children.push(
		{label: 'Import', click: () => {importFile()}},
		{label: 'Download', click: () => {downloadFile()}}
	)
}



export default {
    name: 'menu-bar',
    props: {
        selected_tab: String,
        portrait_view: Boolean
    },
    methods: {
        changeTab() {
            this.$emit('setTab')
		},
		openCodeViewer(side) {
			vscode.postMessage({
				type: 'view_code', side
			});
		},
		openDialog(dialog) {
			this.$emit('opendialog', dialog)
		},
		getVM() {
			return this;
		}
	},
	data() {return {
		Menu,
		isVSCExtension
	}}
}
</script>


<style scoped>
	ul#menu_bar {
		height: 32px;
		font-weight: normal;
		padding: 0 8px;
		background-color: var(--color-bar);
		white-space: nowrap;
	}
	a {
		display: block;
		padding: 2px 12px; 
		padding-top: 3px;
	}
	a:hover {
		background-color: var(--color-interface);
		color: black;
	}
	ul#menu_bar > li {
		display: inline-block;
	}
	ul#menu_bar > li > ul {
		display: none;
		position: absolute;
		padding: 0;
		z-index: 8;
		min-width: 150px;
		background-color: var(--color-bar);
		box-shadow: 1px 4px 10px rgba(0, 0, 0, 0.25);
	}
	ul#menu_bar > li:hover > ul {
		display: block;
	}
	ul#menu_bar > li:hover > a {
		background-color: var(--color-interface);
	}
	.mode_selector {
		float: right;
		height: 100%;
		padding: 2px 8px;
		padding-top: 3px;
		cursor: pointer;
	}
	.mode_selector:hover {
		background-color: var(--color-interface);
	}
	.mode_selector.selected {
		background-color: var(--color-dark);
		color: var(--color-text_grayed);
	}
</style>
