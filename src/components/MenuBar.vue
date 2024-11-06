<template>
    <ul id="menu_bar">
        <li v-for="menu in Menu" :key="menu.id" onclick="">
            <a>{{ menu.label }}</a>
            <ul class="menu_dropdown">
                <li v-for="entry in menu.children" :key="entry.id" v-on:click="entry.click(getVM(), $event)">
                    <a>{{ entry.label }}</a>
                </li>
            </ul>
        </li>
		
		<template v-if="isVSCExtension">
        	<li class="mode_selector" @click="openCodeViewer(true)" title="Open Code View to Side"><i class="unicode_icon split">{{'\u2385'}}</i></li>
        	<li class="mode_selector" @click="openCodeViewer(false)" title="Open as Code View">Switch to Code</li>
		</template>
		<template v-else-if="!portrait_view">
        	<li class="mode_selector code" :class="{selected: selected_tab == 'code'}" @click="$emit('changetab', 'code')">Code</li>
        	<li class="mode_selector preview" :class="{selected: selected_tab == 'preview'}" @click="$emit('changetab', 'preview')">Preview</li>
		</template>

		<div @click="openHelpPanel()" class="mode_selector highlighting_button" :class="{selected: is_help_panel_open}" title="Help">
			<HelpCircle :size="20" />
		</div>
		<div v-if="canShare" @click="onShareParticle" class="mode_selector highlighting_button" title="Share">
			<Share2 :size="20" />
		</div>
    </ul>
</template>

<script>
import {downloadFile} from '../export'
import {importFile,	loadPreset,	startNewProject} from '../import'
import {View} from './Preview'

import vscode from '../vscode_extension'
import { Share2, HelpCircle } from 'lucide-vue'
import { shareParticle } from '../share'
import { generateFile } from '../export'
import { Texture } from '../texture_edit'
import { Options, OptionValues, setOption } from '../options'
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
			{label: 'Grid', click: () => {
				View.grid.visible = !View.grid.visible;
				setOption('grid_visible', View.grid.visible);
			}},
			{label: 'Reference Block', click: () => {
				View.minecraft_block.visible = !View.minecraft_block.visible;
				setOption('minecraft_block_visible', View.minecraft_block.visible);
			}},
			{label: 'Axis Helper', click: () => {
				View.helper.visible = !View.helper.visible;
				setOption('axis_helper_visible', View.grid.visible);
			}},
			{label: 'Take Screenshot', click: () => { View.screenshot() }},
		]
	},
	{
		label: 'Help',
		children: [
			{label: 'Open Guide', click: (vm) => { vm.openHelpPanel('', '') }},
			{label: 'MoLang Reference', click: (vm) => { vm.openHelpPanel('general', 'molang') }},
			{label: 'Snowstorm Tutorial', click: () => { openLink('https://docs.microsoft.com/en-us/minecraft/creator/documents/particleeffects') }},
			{label: 'Tutorial Video', click: () => { openLink('https://youtu.be/J1Ub1tbO9gg') }},
			{label: 'Format Documentation', click: () => { openLink('https://docs.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/') }},
			{label: 'MoLang Grapher', click: () => { openLink('https://jannisx11.github.io/molang-grapher/') }},
			{label: 'Report a Bug', click: () => { openLink('https://github.com/JannisX11/snowstorm/issues') }},
			{label: 'Discord Server', click: () => { openLink('https://discord.gg/W9d78Z8AvM') }},
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
	components: { Share2, HelpCircle },
    props: {
        selected_tab: String,
        portrait_view: Boolean,
		is_help_panel_open: Boolean
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
		},
		openHelpPanel(category, page) {
			this.$emit('open_help_page', category, page);
		},
		onShareParticle() {
			let rawImg = null

			const dataUrl = Texture.source
			if(dataUrl) {
				const base64 = dataUrl.split(',')[1]
				rawImg = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
			}
			

			shareParticle(generateFile(), rawImg)
		}
	},
	data() {return {
		Menu,
		isVSCExtension,
		canShare: 'share' in navigator,
	}}
}
</script>


<style scoped>
	ul#menu_bar {
		height: 32px;
		font-weight: normal;
		padding: 0 8px;
		background-color: var(--color-interface);
		white-space: nowrap;
	}
	a {
		display: block;
		padding: 2px 12px; 
		padding-top: 3px;
		color: inherit;
	}
	a:hover {
		background-color: var(--color-interface);
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
	ul.menu_dropdown > li a {
		height: 34px;
		padding-top: 5px;
	}
	ul#menu_bar > li:hover > a {
		background-color: var(--color-bar);
	}
	.mode_selector {
		float: right;
		height: 100%;
		padding: 2px 8px;
		padding-top: 3px;
		cursor: pointer;
		margin-right: 2px;
	}
	.mode_selector:hover {
		background-color: var(--color-interface);
	}
	.mode_selector.selected {
		background-color: var(--color-dark);
		color: var(--color-text_grayed);
	}
</style>
