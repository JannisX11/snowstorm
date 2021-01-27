<template>
	<div id="expression_bar">
		<prism-editor v-model="code" :value="code" @input="updateInput($event, true)" :highlight="highlighter" :line-numbers="false" ref="input" />
	</div>
</template>

<script>
import App from "./App";

import 'vue-prism-editor/dist/prismeditor.min.css';
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "vue-prism-editor";
import "prismjs/themes/prism-okaidia.css";
import Languages from './../languages';

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
		language: 'generic'
	}},
	methods: {
		highlighter() {
			return Prism.highlight(this.code, Languages[this.language])
		},
		updateInput(text, edit) {
			if (!text && typeof text !== 'string' && typeof text !== 'number') text = '';

			if (typeof text !== 'string') text = text.toString();

			this.code = text;

			if (!ExpandedInput.input || !edit) return;
			var input = ExpandedInput.input;
			if (input.axis_count != 1) {
				var arr = [];
				let len = input.axis_count > 0 ? input.axis_count : (input.value && input.value.length);
				for (var i = 0; i < len; i++) {
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
		ExpandedInput.updateText = (text, language, focusing) => {
			if (language && language !== this.language) this.language = language;
			if (focusing) {
				this.$refs.input._data.history.offset = 0;
				this.$refs.input._data.history.stack.splice(0, Infinity, {
					selectionEnd: text.length,
					selectionStart: text.length,
					timestamp: new Date().getTime(),
					value: text
				});
			}
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
		font-family: var(--font-code);
		outline: none;
		padding: 5px 8px;
		overflow-x: auto;
	}
</style>>
