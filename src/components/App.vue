<template>
    <div id="app">

		<molang-dialog></molang-dialog>

        <header>
			<menu-bar @changetab="setTab" :selected_tab="tab"></menu-bar>
            <div id="expression_bar">
                <i class="fas fa-code"></i>
                <input type="text">
            </div>
        </header>

		<preview v-show="tab == 'preview'"></preview>

		<code-viewer v-if="tab == 'code'"></code-viewer>

		<sidebar></sidebar>

    </div>
</template>

<script>
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import Preview from './Preview';
import CodeViewer from './CodeViewer';
import MolangDialog from './MolangDialog'

export default {
	name: 'app',
	components: {Preview, CodeViewer, MenuBar, Sidebar, MolangDialog},
	data() {return {
		tab: 'preview'
	}},
	methods: {
		setTab(tab) {
			console.log('tab')
		}
	}
}
</script>

<style lang="scss">
	@import "~bootstrap/scss/bootstrap";
</style>

<style>
    @import url('./../css/common.css');
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
		font-weight: 300;
		--sidebar: 520px;
	}
	main {
		grid-area: preview;
	}
	header {
		grid-area: header;
		background-color: #9aa3b8;
	}

	content {
		grid-area: sidebar;
		background-color: #e5ebfa;
	}
/*Stuff*/
	
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

/*Main View*/
	main {
		display: none;
	}
	main.selected {
		display: block;
	}
/*Code Viewer*/


	header {
		font-size: 1.1em;
		background-color: var(--color-bar);
	}

	header #expression_bar {
		width: 100%;
		height: 32px;
		background-color: var(--color-background);
		color: white;
	}
	header #expression_bar i {
		text-align: center;
		width: 40px;
		padding-top: 7px;
		float: left;
		opacity: 0.8;
	}
	header #expression_bar input {
		background-color: transparent;
		width: calc(100% - 40px);
		border: none;
		height: 32px;
		padding: 5px 8px;
		opacity: 0.8;
		float: left;
		color: white;
	}
	header #expression_bar input:focus {
		opacity: 1;
	}
/*Footer*/
	footer > * {
		display: inline-block;
		padding: 2px 8px; 
		padding-top: 2px;
		background-color: #cfd7ea;
	}
	div.stat {
		float: right;
		font-size: 14.5pt;
		font-family: 'Inconsolata', monospace;
		background: transparent;
	}
/*Overlays*/

</style>