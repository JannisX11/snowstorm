<template>
	<div id="app" :class="{portrait_view}" :style="{'--sidebar': getEffectiveSidebarWidth()+'px'}">

		<div id="dialog_blackout" v-if="dialog" @click="closeDialog"></div>
		<warning-dialog v-if="dialog == 'warnings'" @close="closeDialog"></warning-dialog>

        <header>
			<logo v-if="portrait_view" />
			<menu-bar
				:selected_tab="tab"
				:portrait_view="portrait_view"
				:is_help_panel_open="portrait_view ? tab == 'help' : is_help_panel_open"
				@changetab="setTab"
				@opendialog="openDialog"
				@open_help_page="openHelpPage"
			></menu-bar>
			<expression-bar></expression-bar>
        </header>

		<preview v-show="tab == 'preview'" ref="preview" @opendialog="openDialog">
		</preview>
		<code-viewer v-if="tab == 'code'"></code-viewer>


		<help-panel v-if="is_help_panel_open || tab == 'help'" ref="help_panel" :portrait_view="portrait_view" @close="is_help_panel_open = false; portrait_view && setTab(previous_tab);"></help-panel>


		<div class="resizer"
			:style="{ left: getEffectiveSidebarWidth() +'px', cursor: is_sidebar_open ? 'ew-resize' : 'default'}"
			ref="sidebar_resizer" @mousedown="is_sidebar_open && resizeSidebarStart($event)">
			<button class="resizer_toggle_button" v-show="!is_sidebar_open" @click="toggleSidebar" @mousedown.stop="">
				<PanelLeftOpen/>
			</button>
		</div>

		<sidebar ref="sidebar" v-show="!portrait_view || tab == 'config'" :portrait_view="portrait_view" @open_help_page="openHelpPage"></sidebar>

		<ul v-if="portrait_view" id="portrait_mode_selector">
        	<li class="mode_selector config" :class="{selected: tab == 'config'}" @click="setTab('config')"><SlidersHorizontal :size="22" /></li>
        	<li class="mode_selector code" :class="{selected: tab == 'code'}" @click="setTab('code')"><FileJson :size="22" /></li>
        	<li class="mode_selector help" :class="{selected: tab == 'help'}" @click="setTab('help')"><HelpCircle :size="22" /></li>
        	<li class="mode_selector preview" :class="{selected: tab == 'preview'}" @click="setTab('preview')"><Move3D :size="22" /></li>
		</ul>

    </div>
</template>

<script>
import Vue from 'vue';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import HelpPanel from './HelpPanel';
import Preview from './Preview';
import CodeViewer from './CodeViewer';
import WarningDialog from './WarningDialog'
import ExpressionBar from './ExpressionBar'
import InfoBox from './InfoBox'
import vscode from '../vscode_extension';
import {SlidersHorizontal, FileJson, Move3D, HelpCircle} from 'lucide-vue'
import Logo from './Sidebar/Logo.vue';
import {PanelLeftOpen} from "lucide-vue";

if (!vscode) {
	var startup_count = localStorage.getItem('snowstorm_startup_count') || 0;
	startup_count ++;
	localStorage.setItem('snowstorm_startup_count', startup_count);

	// iOS auto zoom in input fix
	if (navigator.userAgent.indexOf('iPhone') != -1) {
		document.querySelector("meta[name=viewport]").setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1");
	}	
}

let portrait_view = document.body.clientWidth > 100 && document.body.clientWidth < 720

function getInitialSidebarWidth() {
	let body_width = document.body.clientWidth;
	// Fix for VSCode
	if (body_width < 100) body_width = 1280;

	if (portrait_view) {
		return body_width;
	} else if (localStorage.getItem('snowstorm_sidebar_width')) {
		return Math.clamp(parseInt(localStorage.getItem('snowstorm_sidebar_width')), 100, body_width - 200);
	} else {
		return Math.clamp(body_width/2, 160, Math.clamp(180 + body_width * 0.2, 160, 660));
	}
}

function getInitialIsSidebarOpen() {
	if (localStorage.getItem('snowstorm_is_sidebar_open')) {
		return localStorage.getItem('snowstorm_is_sidebar_open') == 'true';
	} else {
		return true;
	}
}

export default {
	name: 'app',
	components: {
		Preview, CodeViewer, MenuBar, Sidebar, HelpPanel, WarningDialog, ExpressionBar, InfoBox,
		SlidersHorizontal, FileJson, Move3D, Logo, PanelLeftOpen, HelpCircle
	},
	data() {return {
		code: '',
		tab: portrait_view ? 'config' : 'preview',
		previous_tab: 'config',
		dialog: null,
		sidebar_width: getInitialSidebarWidth(),
		is_sidebar_open: getInitialIsSidebarOpen(),
		is_help_panel_open: false,
		portrait_view,
	}},
	methods: {
		setTab(tab) {
			this.previous_tab = this.tab;
			this.tab = tab
			Vue.nextTick(() => {
				this.$refs.preview.updateSize();
			})
		},
		openDialog(dialog_id) {
			this.dialog = dialog_id;
		},
		closeDialog() {
			this.dialog = null;
		},
		async openHelpPage(tab_key, group_key) {
			this.is_help_panel_open = true;
			if (portrait_view) this.setTab('help');
			await Vue.nextTick();
			this.$refs.help_panel.openPage(tab_key, group_key);
		},
		setSidebarSize(size, original_size) {
			if (size > 80) {
				this.sidebar_width = Math.clamp(size, 240, document.body.clientWidth - 200)
				this.is_sidebar_open = true;
			} else {
				// Hide gesture remembers the original size
				this.sidebar_width = original_size;
				this.is_sidebar_open = false;
			}
			this.$refs.preview.updateSize()
			this.$refs.sidebar.updateSize()
			localStorage.setItem('snowstorm_sidebar_width', this.sidebar_width);
			localStorage.setItem('snowstorm_is_sidebar_open', this.is_sidebar_open);
		},
		resizeSidebarStart(start_event) {
			let original_width = this.sidebar_width;
			let move = (move_event) => {
				this.setSidebarSize(
					original_width + move_event.clientX - start_event.clientX,
					original_width)
			}
			let stop = () => {
				document.removeEventListener('mousemove', move)
				document.removeEventListener('mouseup', stop)
			}
			document.addEventListener('mousemove', move, false)
			document.addEventListener('mouseup', stop, false)
		},
		getEffectiveSidebarWidth() {
			return this.is_sidebar_open * this.sidebar_width;
		},
		toggleSidebar() {
			this.is_sidebar_open = !this.is_sidebar_open;
			Vue.nextTick(() => {
				this.$refs.preview.updateSize();
				this.$refs.sidebar.updateSize();
			});
			localStorage.setItem('snowstorm_is_sidebar_open', this.is_sidebar_open);
		}
	}
}
</script>


<style>

	@import url('./../css/common.css');

		
	.tool {
		display: inline-block;
		padding: 2px 8px; 
		padding-top: 1px;
		width: 35px;
		height: 100%;
		max-height: 32px;
		cursor: pointer;
	}
	.tool:hover {
		color: var(--color-highlight);
	}
	.tool > i {
		pointer-events: none;
	}
	.resizer {
		position: absolute !important;
		z-index: 12;
	}
	.resizer.vertical { /*	|	*/
		cursor: ew-resize;
		width: 6px;
	}
	.resizer.horizontal { /*	__	*/
		cursor: ns-resize;
		height: 6px;
	}
	.resizer.disabled {
		pointer-events: none;
	}
	.resizer_toggle_button {
		position: absolute;
		left: 50%;
		top: 120px;
		transform: translateX(-50%);
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border-radius: 10%;
	}
</style>


<style scoped>
	div#app {
		display: grid;
		grid-template-rows: 74px calc(100% - 74px);
		grid-template-columns: var(--sidebar) calc(100% - var(--sidebar));
		grid-template-areas: "sidebar header" "sidebar preview";
		height: 100%;
		width: 100%;
		position: fixed;
		font-weight: 400;
	}
	main {
		grid-area: preview;
	}
	header {
		grid-area: header;
		font-size: 1.1em;
		position: relative;
	}
	content {
		grid-area: sidebar;
		background-color: var(--color-interface);
	}

	/* Portrait View */
	div#app.portrait_view {
		grid-template-rows: 124px calc(100% - 162px) 38px;
		grid-template-columns: 100%;
		grid-template-areas: "header" "main" "mode_selector";
	}
	header > svg {
		height: 40px;
		padding: 12px;
		width: 100%;
	}
	div#app.portrait_view main {
		grid-area: main;
	}
	div#app.portrait_view content {
		grid-area: main;
	}
	div#app.portrait_view #portrait_mode_selector {
		grid-area: mode_selector;
		display: flex;
	}
	li.mode_selector {
		flex: 1 0 0;
		text-align: center;
		padding-top: 6px;
		border-top: 1px solid var(--color-border);
	}
	li.mode_selector.selected {
		background-color: var(--color-dark);
	}
	div#app.portrait_view dialog {
		margin: auto;
		padding: 12px 12px;
	}

	#dialog_blackout {
		position: absolute;
		z-index: 49;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #00000050;
	}
	dialog {
		position: absolute;
		margin-left: calc(50% - 400px);
        width: 800px;
		max-width: 100%;
		max-height: calc(100% - 40px);
		top: 20px;
		background-color: var(--color-interface);
        z-index: 50;
        overflow: hidden;
		padding: 20px 28px;
		bottom: 20px;
        display: flex;
		flex-direction: column;
		color: inherit;
		border: none;
		border: 1px solid var(--color-bar);
		box-shadow: 0 1px 12px rgba(0, 0, 0, 0.4);
		border-radius: 4px;
	}

/*Resize*/
	.resizer {
		top: 0;
		bottom: 0;
		position: absolute;
		width: 6px;
		margin-left: -3px;
		cursor: ew-resize;
	}
</style>

<style>
	dialog h3 {
		padding: 20px 0 5px 0;
	}
    dialog .close_button {
		position: absolute;
		height: 30px;
		top: 6px;
		right: 6px;
    }
</style>
