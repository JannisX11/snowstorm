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

<style>

	/*Setup*/

	::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: #e5ebfa;
	}
	::-webkit-scrollbar-corner {
		background: #e5ebfa;
	}
	
	::-webkit-scrollbar-thumb {
		background: #cfd7ea;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #9aa3b8;
	}
	::selection {
		background: var(--color-selection);
	}
	::placeholder {
		opacity: 0.6;
	}
	* {
		scrollbar-width: thin;
		scrollbar-color: white #9aa3b8;
	}

	body {
		--color-background: #29323a;
		--color-interface: #e5ebfa;
		--color-bar: #cfd7ea;
		--color-title: #9aa3b8;
		--color-selection: rgba(110, 142, 191, 0.3);
		--color-highlight: #f7f9ff;
	}


	h1, h2, h3, h4, h5, h6 {
		margin: 0;
		font-weight: inherit;
	}
	ul {
		list-style: none;
		padding-left: 0;
		margin: 0;
	}
	* {
		margin: 0;
		padding: 0;
	}
	input, select {
		font-weight: inherit;
	}
	input[type=text], input[type=number], input:not([type]) {
		font-family: 'Inconsolata', monospace;
	}
	input[type=checkbox] {
		height: 15px;
		width: 15px;
		vertical-align: middle;
		margin: 0 0 2px 4px;
		margin-top: 5px;
	}
	select {
		height: 30px;
	}
	code {
		padding: 2px 8px;
		color: #1062ab;
		font-size: 0.9em;
		background-color: var(--color-highlight);
		user-select: auto;
	}
	body {
		image-rendering: pixelated;
		background-color: #29323a;
		user-select: none;
		-moz-user-select: none;
		font-family: 'Lato', sans-serif;
		height: 100%;
		width: 100%;
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