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
        	<li class="mode_selector" @click="openCodeViewer()">View Code</li>
		</template>
		<template v-else>
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
	},
	{
		label: 'View',
		children: [
			{label: 'Grid Visibility', click: () => { View.grid.visible = !View.grid.visible }},
			{label: 'Axis Helper Visibility', click: () => { View.helper.visible = !View.helper.visible }},
			{label: 'Take Screenshot', click: () => { View.screenshot() }},
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
        selected_tab: String
    },
    methods: {
        changeTab() {
            this.$emit('setTab')
		},
		openCodeViewer() {
			vscode.postMessage({
				type: 'reopen'
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
		padding: 2px 20px; 
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
		padding: 2px 10px;
		padding-top: 3px;
		cursor: pointer;
	}
	.mode_selector:hover {
		background-color: var(--color-interface);
	}
	.mode_selector.selected {
		background-color: var(--color-background);
		color: var(--color-title);
	}
</style>
