<template>
    <div id="app" :style="{'--sidebar': sidebar_width+'px'}">

		<molang-dialog v-if="dialog == 'molang_sheet'" @close="closeDialog"></molang-dialog>

		<info-box v-if="showVSCodeInfoBox" @close="closeInfoBox">Snowstorm is now available as an extension for VSCode!</info-box>

        <header>
			<menu-bar @changetab="setTab" :selected_tab="tab" @opendialog="openDialog"></menu-bar>
			<expression-bar></expression-bar>
        </header>

		<preview v-show="tab == 'preview'" ref="preview"></preview>
		<code-viewer v-if="tab == 'code'"></code-viewer>

		<div class="resizer" :style="{left: sidebar_width+'px'}" ref="sidebar_resizer" @mousedown="resizeSidebarStart($event)"></div>

		<sidebar ref="sidebar"></sidebar>

    </div>
</template>

<script>
import Vue from 'vue';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import Preview from './Preview';
import CodeViewer from './CodeViewer';
import MolangDialog from './MolangDialog'
import ExpressionBar from './ExpressionBar'
import InfoBox from './InfoBox'
import vscode from '../vscode_extension';

if (!vscode) {
	var startup_count = localStorage.getItem('snowstorm_startup_count') || 0;
	startup_count ++;
	localStorage.setItem('snowstorm_startup_count', startup_count)
}


export default {
	name: 'app',
	components: {Preview, CodeViewer, MenuBar, Sidebar, MolangDialog, ExpressionBar, InfoBox},
	data() {return {
		code: '',
		tab: 'preview',
		dialog: null,
		showVSCodeInfoBox: (!vscode && [1, 3, 7, 11, 24].includes(startup_count)),
		sidebar_width: 440
	}},
	methods: {
		setTab(tab) {
			this.tab = tab
			Vue.nextTick(() => {
				this.$refs.preview.updateSize();
			})
		},
		openDialog(dialog) {
			this.dialog = dialog;
		},
		closeDialog() {
			this.dialog = null;
		},
		closeInfoBox() {
			this.showVSCodeInfoBox = false;
		},
		setSidebarSize(size) {
			this.sidebar_width = Math.clamp(size, 240, document.body.clientWidth-240)
			this.$refs.preview.updateSize()
			this.$refs.sidebar.updateSize()
		},
		resizeSidebarStart(start_event) {
			let scope = this;
			let original_width = this.sidebar_width;
			let move = (move_event) => {
				this.setSidebarSize(original_width + move_event.clientX - start_event.clientX)
			}
			let stop = () => {
				document.removeEventListener('mousemove', move)
				document.removeEventListener('mouseup', stop)
			}
			document.addEventListener('mousemove', move, false)
			document.addEventListener('mouseup', stop, false)
		}
	}
}
</script>


<style lang="scss">

	@import "~bootstrap/scss/bootstrap";
	
</style>

<style>

	@import url('./../css/common.css');

		
	.tool {
		display: inline-block;
		padding: 2px 8px; 
		padding-top: 1px;
		width: 35px;
		height: 30px;
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

</style>


<style scoped>
	div#app {
		display: grid;
		grid-template-rows:  66px calc(100% - 66px);
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