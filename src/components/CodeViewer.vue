<template>
    <main id="code" class="code">
        <div class="menu">
            <button @click="copy()"><Copy :size="20" />Copy</button>
        </div>
		<prism language="json">{{ code }}</prism>
    </main>
</template>

<script>
import 'prismjs'
import 'prismjs/themes/prism-okaidia.css'
import 'prismjs/components/prism-json'
import Prism from 'vue-prism-component'
import {Copy} from 'lucide-vue'

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
	components: {Prism, Copy},
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
		display: flex;
		flex-direction: column;
	}
	main#code pre {
		background-color: var(--color-dark);
		user-select: text;
		width: 100%;
		max-width: 1000px;
		margin: 0;
		margin-left: auto;
		margin-right: auto;
		overflow-y: auto;
		border: none;
		border-radius: 0;
		cursor: text;
	}
	#code pre code {
		text-shadow: none;
		user-select: text;
	}
	.menu {
		flex: 0 0 42px;
		padding: 5px;
	}
	.menu button {
		width: 100px;
	}
	.menu button svg {
		margin-right: 4px;
	}
</style>

<style>
	.token {
		user-select: text;
	}
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