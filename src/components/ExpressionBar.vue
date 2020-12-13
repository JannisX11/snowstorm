<template>
    <div id="expression_bar">
		<prism-editor v-model="code" :value="code" @change="updateInput($event, true)" :highlight="highlighter" :line-numbers="false" ref="input" />
    </div>
</template>

<script>
import App from "./App";

import 'vue-prism-editor/dist/prismeditor.min.css';
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "vue-prism-editor";
import "prismjs/themes/prism-okaidia.css";


//import "prismjs";
//import 'molangjs/syntax/molang-prism-syntax';

const Molang = {
	'string': /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    'function-name': /\b(?!\d)math\.\w+(?=[\t ]*\()/i,
    'selector': /\b(?!\d)(query|variable|temp|context|math|q|v|t|c)\.\w+/i,
    'boolean': /\b(?:true|false)\b/i,
	'number': /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	'operator': /&&|\|\||[-+*/!<>]=?|[:?=]/i,
	'keyword': /\b(Return)\b/i,
	'punctuation': /[.,;()[\]{}]/,
};

const ExpandedInput = {
    input: 0,
	axis: null,
	updateText(test) {

	},
	setup: false,
}

export default {
	name: 'expression-bar',
	components: {PrismEditor},
	data() {return {
		code: ''
	}},
	methods: {
		highlighter() {
			return Prism.highlight(this.code, Molang)
		},
		updateInput(text, edit) {
			if (!text && typeof text !== 'string' && typeof text !== 'number') text = '';

			if (typeof text !== 'string') text = text.toString();
			//if (text.length > 3) text = text.replace(/\n/g, '');

			this.code = text;

			if (!ExpandedInput.input || !edit) return;
            var input = ExpandedInput.input;
            if (input.axis_count > 1 || input.type == 'list') {
                var arr = [];
                for (var i = 0; i < input.axis_count; i++) {
                    arr[i] = (i == ExpandedInput.axis) ? text : input.value[i];
                }
                input.set(arr)
            } else {
                input.value = text;
			}
			if (typeof input.change == 'function') {
				input.change(event)
			}
		}
	},
	mounted() {
		ExpandedInput.setup = true;
		ExpandedInput.updateText = (text, language) => {
			if (language && language !== this.language) this.language = language;
			this.updateInput(text);
		}
	}
}
export {ExpandedInput}

</script>

<style scoped>
	#expression_bar {
		width: 100%;
		min-height: 20px;
		background-color: var(--color-dark);
		border-bottom: 1px solid var(--color-border);
		position: absolute;
		height: auto;
		z-index: 3;
		font-family: 'Inconsolata', monospace;
		outline: none;
		padding: 5px 8px;
	}
</style>>


<style>
	/*
	#expression_bar textarea {
		padding-left: 4px;
		background-color: transparent;
		width: 100%;
		border: none;
		height: 32px;
		opacity: 0.8;
		float: left;
		color: white;
		outline: none;
	}
	#expression_bar textarea:focus {
		opacity: 1;
	}*/
	#expression_bar textarea {
		outline: none;
	}
	#expression_bar pre {
		color: var(--color-text);
	}
	#expression_bar .prism-editor-wrapper {
		overflow-y: hidden;
	}

	#expression_bar pre .token.punctuation {
		color: #5ba8c5
	}
	#expression_bar pre .token.operator, #expression_bar pre .token.keyword {
		color: #fc2f40
	}
	#expression_bar pre .token.number, #expression_bar pre .token.boolean {
		color: #b99cff
	}
	#expression_bar pre .token.function-name {
		color: #94e400
	}
	#expression_bar pre .token.selector {
		color: #92dcff;
	}
</style>
