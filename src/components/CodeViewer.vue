<template>
    <main id="code" class="code">
        <div class="menu">
            <a @click="copy()">Copy</a>
        </div>
		<prism language="json">{{ code }}</prism>
    </main>
</template>

<script>
import 'prismjs'
import 'prismjs/themes/prism-okaidia.css'
import 'prismjs/components/prism-json'
import Prism from 'vue-prism-component'

import {generateFile} from '../export'
import {EditListeners} from '../edits'
import { compileJSON } from '../util'


function selectText(element) {
    var node = document.getElementById(element);
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
}

export default {
	name: 'code-viewer',
	components: {Prism},
	data() {return {
		code: compileJSON(generateFile())
	}},
	methods: {
		copy() {
			selectText('code');
			document.execCommand('copy');
		}
	},
	mounted() {
		EditListeners['code_viewer'] = () => {
			this.code = compileJSON(generateFile())
		}
	},
	destroyed() {
		delete EditListeners['code_viewer']
	}
}
</script>

<style scoped>
	main#code {
		background-color: var(--color-dark);
	}
	main#code pre {
		background-color: var(--color-background);
		box-shadow: 0 0 10px black;
		user-select: text;
		max-width: 1000px;
		margin-left: auto;
		margin-right: auto;
		overflow-y: auto;
		max-height: calc(100% - 60px);
		border: none;
		border-radius: 0;
	}
	main#code .menu {
		color: #ccc;
		font-size: 14pt;
	}
	main#code .menu a {
		cursor: default;
		padding: 3px;
		margin: 0 20px; 
		display: inline-block;
	}
	main#code .menu a:hover {
		color: white !important;
	}
	main#code .menu label {
		float: right;
		font-size: 0.9em;
		opacity: 0.8;
		padding-top: 3px;
	}
	#code pre code {
		text-shadow: none;
	}
</style>

<style>
	.token.operator, .token.entity, .token.url {
		background: transparent;
	}
	.token.property, .token.tag, .token.constant, .token.symbol, .token.deleted {
		color: #7bcbf0;
	}
	.token.boolean, .token.number {
		color: #ff6868;
	}
</style>