<template>
	<ul>
		<li
			class="input_wrapper"
			v-for="(input, key) in group.inputs"
			:key="key"
			:input_type="input.type"
			v-show="!input.enabled_modes || group._selected_mode === null || input.enabled_modes.includes(group._selected_mode)"
			v-bind:title="input.info"
			v-bind:id="subject_key +'-'+ group_key +'-'+ key"
		>
			<label v-bind:for="key" v-if="input.label">{{ input.label }}</label>
			<div class="tool input_expand_button" v-if="input.expandable" @click="toggleExpand(input)" title="Expand">
				<i v-if="!input.expanded" class="unicode_icon caret">{{'\u02C7'}}</i>
				<i v-else class="unicode_icon caret">{{'\u02C6'}}</i>
			</div>
			<template v-if="input.axis_count == -1">
				<!--List-->
				<div class="tool list_add_tool" v-on:click="input.value.push('')"><i class="unicode_icon plus">{{'\uFF0B'}}</i></div>
				<ul class="input_list">
					<li v-for="(item, index) in input.value" :key="index">
						<!--Text-->
						<div class="prism_editor_outer_wrapper" v-if="input.type == 'text' || input.type == 'molang'">
							<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric" language="" :line-numbers="false"
								v-model="input.value[index]"
								v-bind:placeholder="input.placeholder"
								v-bind:index="index"
								v-on:input="input.emitInput($event)"
								v-on:focus="input.focus(index, $event)" />
						</div>
						<!--Number-->
						<input
							v-if="input.type == 'number'" type="number"
							v-model="input.value"
							v-on:input="input.change($event)">
						<div class="tool" v-on:click="input.value.remove(item);input.change($event);"><i class="unicode_icon">{{'\u2A09'}}</i></div>
					</li>
				</ul>
			</template>
			<div v-else class="input_right" :axes="input.axis_count" :class="{expandable: input.expandable, expanded: input.expanded, full_width: !input.label}">

				<template v-if="input.axis_count == 1">
					<!--Text-->
					<div class="prism_editor_outer_wrapper" v-if="input.type == 'text' || input.type == 'molang'">
						<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric" language="" :line-numbers="false"
							v-model="input.value"
							:value="input.value.toString()"
							v-bind:placeholder="input.placeholder"
							v-on:input="input.emitInput($event)"
							v-on:focus="input.focus(-1, $event)" />
					</div>
					<!--Number-->
					<input
						v-if="input.type == 'number'" type="number"
						v-model="input.value"
						v-on:input="input.change($event)">
				</template>

				<template v-else>
					<!--Text-->
					<template v-if="input.type == 'text' || input.type == 'molang'">
						<div class="prism_editor_outer_wrapper input_vector" v-for="i in input.axis_count" :key="i">
							<prism-editor :highlight="input.type == 'molang' ? highlightMolang : highlightGeneric"  :line-numbers="false"
								v-model="input.value[i-1]"
								:value="input.value[i-1].toString()"
								v-bind:index="i-1"
								v-bind:placeholder="input.placeholder"
								v-on:input="input.emitInput($event)"
								v-on:focus="input.focus(i-1, $event)" />
						</div>
					</template>
					<!--Number-->
					<template v-if="input.type == 'number'">
						<input class="input_vector" type="number"
							v-for="i in input.axis_count"
							:key="i"
							v-model="input.value[i-1]"
							v-bind:index="i-1"
							v-on:input="input.change($event)">
					</template>
				</template>

				<!--Check-->
				<input v-if="input.type == 'checkbox'" v-bind:id="key" type="checkbox" v-model="input.value" @change="input.change($event)">

				<!--Select-->
				<select v-if="input.type == 'select'" v-bind:id="key" v-model="input.meta_value" v-on:change="input.change($event)">
					<option v-for="(s_label, s_key) in input.options" :key="s_key" v-bind:id="s_key">{{s_label}}</option>
				</select>

				<!--Color-->
				<color-picker v-if="input.type == 'color'" v-model="input.value" v-on:input="input.change($event, $el)"></color-picker>

				<!--Gradient-->
				<gradient v-if="input.type == 'gradient'" :input="input"></gradient>

				<!--Image-->
				<template v-if="input.type == 'image' && !input.image.hidden">
					<div class="input_texture_wrapper checkerboard" v-html="input.image_element.outerHTML">
						
					</div>
					<div class="meta">
						<template v-if="input.allow_upload">
							<div class="tool" v-on:click="input.reset()"><i class="unicode_icon">{{'\u2A09'}}</i></div>
							<input  v-bind:id="key" type="file" accept=".png" v-on:change="input.change($event)">
						</template>
						<div id="image_resolution_label">{{input.image_element.naturalWidth}} x {{input.image_element.naturalHeight}} px</div>
					</div>
				</template>
			</div>
		</li>
	</ul>
</template>


<script>
import VueColor from 'vue-color'
import Gradient from './Gradient';



import 'vue-prism-editor/dist/prismeditor.min.css';
import Prism from 'prismjs/components/prism-core';
import {PrismEditor} from "vue-prism-editor";
import "prismjs/themes/prism-okaidia.css";

import Languages from './../../languages';




export default {
	name: 'input-group',
	props: {
		group: Object,
		group_key: String,
		subject_key: String
	},
	components: {
		PrismEditor,
		'color-picker': VueColor.Chrome,
		Gradient
	},
	methods: {
		highlightMolang(code) {
			return Prism.highlight(code, Languages.molang)
		},
		highlightGeneric(code) {
			return Prism.highlight(code, Languages.generic)
		},
		toggleExpand(input) {
			if (input.expandable) {
				input.expanded = !input.expanded;
			}
		}
	}
}
</script>

<style scoped>

	.input_wrapper {
		margin: 2px 0;
	}
	.input_wrapper > label {
		width: 100px;
		text-align: right;
		margin: 3px 0;
	}
	.input_right {
		display: inline-flex;
		vertical-align: top;
		width: calc(100% - 110px);
		margin-left: 4px;
	}
	.input_right.full_width {
		width: calc(100% - 8px);
	}
	.input_right.expandable {
		width: calc(100% - 134px);
	}
	.input_right[axes="1"] input:not([type="checkbox"]), .input_right[axes="1"] select:not([type="checkbox"]) {
		width: 100%;
	}
	.input_right.expanded {
		display: block;
		width: calc(100% - 7px);
	}
	.input_right.expanded input, .input_right.expanded .input_vector  {
		width: 100% !important;
		display: block;
		margin-left: 0;
	}
	.tool.input_expand_button {
		float: right;
		width: 22px;
		padding-left: 3px;
	}
	
	.input_list li {
		margin: 2px 0;
	}
	ul.input_list input, ul.input_list .prism_editor_outer_wrapper {
		width: calc(100% - 80px);
		margin-left: 52px;
		float: left;
	}
	.input_list li .tool {
		padding: 2px 0px;
		width: 24px;
		height: 30px;
	}

	input#image {
		width: calc(100% - 40px);
	}
	.input_texture_wrapper {
		display: block;
		height: 128px;
		width: 128px;
		margin-right: 8px;
		margin-left: 8px;
		flex-shrink: 0;
		border: 1px solid var(--color-border);
		box-sizing: content-box;
	}
	.input_vector {
		width: 40px;
		flex-grow: 1;
		margin-left: 2px;
	}
	.input_vector:first-child {
		margin-left: 0;
	}
	.list_add_tool {
		vertical-align: sub;
	}
</style>

<style>
	.input_texture_wrapper img {
		width: 100%;
		height: 100%;
		background-size: contain;
		background-repeat: no-repeat;
	}
</style>
