<template>
    <ul id="menu_bar">
        <li v-for="menu in Menu" :key="menu.id" @click="openMenu(menu, $event)" @mouseenter="onMenuMouseEnter(menu)" :class="{selected: open_menu == menu.id}">
            <a>{{ menu.label }}</a>
            <ul class="menu_dropdown" v-if="open_menu == menu.id">
                <li v-for="entry in menu.children" :key="entry.id" v-on:click="entry.click(getVM(), $event); open_menu = null">
                    <a>
						<component v-if="entry.icon" :is="entry.icon" :size="18" class="menu_icon" />
						<div v-else class="menu_icon" />
						{{ entry.label }}
					</a>
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

		<div v-if="!portrait_view" @click="openHelpPanel()" class="mode_selector highlighting_button" :class="{selected: is_help_panel_open}" title="Documentation">
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
import { Share2, HelpCircle, FilePlus, CheckSquare, Square, Camera, FileUp, Save, MessagesSquare, BookOpenCheck, Sigma, Bug, LineChart, PlaySquare, File } from 'lucide-vue'
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
		id: 'file',
		children: [
			{label: 'New File', icon: FilePlus, click: () => {startNewProject()}},
		].concat(isVSCExtension ? [] : [
			{label: 'Import', icon: FileUp, click: () => {importFile()}},
			{label: 'Download', icon: Save, click: () => {downloadFile()}}
		])
	},
	{
		label: 'Examples',
		id: 'examples',
		children: [
			{label: 'Loading', 	icon: File, click: () => {loadPreset('loading')}},
			{label: 'Rainbow', 	icon: File, click: () => {loadPreset('rainbow')}},
			{label: 'Rain', 	icon: File, click: () => {loadPreset('rain')}},
			{label: 'Snow', 	icon: File, click: () => {loadPreset('snow')}},
			{label: 'Fire', 	icon: File, click: () => {loadPreset('fire')}},
			{label: 'Magic', 	icon: File, click: () => {loadPreset('magic')}},
			{label: 'Trail', 	icon: File, click: () => {loadPreset('trail')}},
			{label: 'Billboard',icon: File, click: () => {loadPreset('billboard')}},
		]
	},
	{
		label: 'View',
		id: 'view',
		children: [
			{
				label: 'Grid',
				get icon() {
					return View.grid.visible ? CheckSquare : Square
				},
				click: () => {
					View.grid.visible = !View.grid.visible;
					setOption('grid_visible', View.grid.visible);
				}
			},
			{
				label: 'Reference Block',
				get icon() {
					return View.minecraft_block.visible ? CheckSquare : Square
				},
				click: () => {
					View.minecraft_block.visible = !View.minecraft_block.visible;
					setOption('minecraft_block_visible', View.minecraft_block.visible);
				}
			},
			{
				label: 'Axis Helper',
				get icon() {
					return View.helper.visible ? CheckSquare : Square
				},
				click: () => {
					View.helper.visible = !View.helper.visible;
					setOption('axis_helper_visible', View.helper.visible);
				}
			},
			{label: 'Take Screenshot', icon: Camera, click: () => { View.screenshot() }},
		]
	},
	{
		label: 'Help',
		id: 'help',
		children: [
			{label: 'Open Documentation', icon: HelpCircle, click: (vm) => { vm.openHelpPanel('', '') }},
			{label: 'Molang Reference', icon: Sigma, click: (vm) => { vm.openHelpPanel('general', 'molang') }},
			{label: 'Snowstorm Tutorial', icon: PlaySquare, click: () => { openLink('https://docs.microsoft.com/en-us/minecraft/creator/documents/particleeffects') }},
			{label: 'Tutorial Video', icon: PlaySquare,click: () => { openLink('https://youtu.be/J1Ub1tbO9gg') }},
			{label: 'Format Documentation', icon: BookOpenCheck, click: () => { openLink('https://docs.microsoft.com/en-us/minecraft/creator/reference/content/particlesreference/') }},
			{label: 'Molang Grapher', icon: LineChart, click: () => { openLink('https://jannisx11.github.io/molang-grapher/') }},
			{label: 'Report a Bug', icon: Bug, click: () => { openLink('https://github.com/JannisX11/snowstorm/issues') }},
			{label: 'Discord Server', icon: MessagesSquare, click: () => { openLink('https://discord.gg/W9d78Z8AvM') }},
		]
	}
]

if (!isVSCExtension) {
	Menu[0].children.push(
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
		openMenu(menu, event) {
			if (this.open_menu) {
				this.open_menu = null;
			} else {
				this.open_menu = menu.id;
			}
		},
		onMenuMouseEnter(menu) {
			if (this.open_menu && this.open_menu != menu.id) {
				this.open_menu = menu.id;
			}
		},
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
		open_menu: null,
		canShare: 'share' in navigator,
	}},
	mounted() {
		document.addEventListener('click', (event) => {
			if (this.open_menu && !this.$el.contains(event.target)) {
				this.open_menu = null;
			}
		});
	}
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
		padding: 4px 12px; 
		padding-top: 3px;
		color: inherit;
	}
	a:hover {
		background-color: var(--color-interface);
		color: var(--color-highlight);
	}
	ul#menu_bar > li {
		display: inline-block;
	}
	ul#menu_bar > li > ul {
		position: absolute;
		padding: 0;
		z-index: 8;
		min-width: 150px;
		background-color: var(--color-bar);
		box-shadow: 1px 4px 10px rgba(0, 0, 0, 0.25);
	}
	ul.menu_dropdown > li a {
		padding: 4px 8px; 
		height: 35px;
		padding-top: 5px;
		display: flex;
		align-items: center;
	}
	.menu_icon {
		width: 24px;
		margin-right: 4px;
	}
	ul#menu_bar > li.selected > a {
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
