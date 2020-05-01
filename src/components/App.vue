<template>
    <div id="app" :style="{'--sidebar': sidebar_width+'px'}">
		<link rel="stylesheet" href="https://unpkg.com/vue-prism-editor/dist/VuePrismEditor.css">
		<link rel="stylesheet" 
        	href="node_modules/@fortawesome/fontawesome-free/css/all.css">

		<molang-dialog></molang-dialog>

        <header>
			<menu-bar @changetab="setTab" :selected_tab="tab"></menu-bar>
			<expression-bar></expression-bar>
        </header>

		<preview v-show="tab == 'preview'" ref="preview"></preview>
		<code-viewer v-if="tab == 'code'"></code-viewer>

		<div class="resizer" :style="{left: sidebar_width+'px'}" ref="sidebar_resizer" @mousedown="resizeSidebarStart($event)"></div>

		<sidebar></sidebar>

    </div>
</template>

<script>
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import Preview from './Preview';
import CodeViewer from './CodeViewer';
import MolangDialog from './MolangDialog'
import ExpressionBar from './ExpressionBar'



export default {
	name: 'app',
	components: {Preview, CodeViewer, MenuBar, Sidebar, MolangDialog, ExpressionBar},
	data() {return {
		code: '{"test": false}',
		tab: 'preview',
		sidebar_width: 440
	}},
	methods: {
		setTab(tab) {
			this.tab = tab
			console.log(tab)
		},
		setSidebarSize(size) {
			this.sidebar_width = Math.clamp(size, 240, document.body.clientWidth-240)
			this.$refs.preview.updateSize()
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
		padding-top: 3px;
	}
	.tool:hover {
		color: #3e5366;
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
		grid-template-rows:  64px calc(100% - 64px);
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
		background-color: var(--color-bar);
		font-size: 1.1em;
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

/*Overlays*/

</style>