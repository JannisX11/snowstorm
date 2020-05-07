<template>
    <div id="expression_bar">
		<prism-editor v-model="code" :value="code" @change="updateInput($event, true)" :language="language" :line-numbers="false" ref="input" />
    </div>
</template>

<script>
import $ from 'jquery'
import App from "./App";

import "prismjs";
import "prismjs/themes/prism-okaidia.css";
import 'molangjs/molang-prism-syntax';

import "vue-prism-editor/dist/VuePrismEditor.css";
import PrismEditor from "vue-prism-editor";

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
		code: '',
		language: 'molang'
	}},
	methods: {
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
		height: 32px;
		background-color: var(--color-dark);
		border-bottom: 1px solid var(--color-border);
		position: absolute;
		height: auto;
		z-index: 3;
	}
	#expression_bar input {
		background-color: transparent;
		width: 100%;
		border: none;
		height: 32px;
		padding: 5px 8px;
		opacity: 0.8;
		float: left;
		color: white;
	}
	#expression_bar input:focus {
		opacity: 1;
	}
</style>>

<style>
	#expression_bar .prism-editor-wrapper {
		overflow-y: hidden;
		min-height: 30px;
	}
	#expression_bar pre {
		padding: 4px;
		min-height: 30px;
		background-color: transparent;
	}
	#expression_bar pre code {
		color: #bec2ca;
		padding: 0;
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
