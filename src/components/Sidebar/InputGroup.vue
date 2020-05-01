<template>
    <ul>
        <li
            class="input_wrapper"
            v-for="(input, key) in group.inputs"
            :key="key"
            v-show="!input.enabled_modes || group._selected_mode === null || input.enabled_modes.includes(group._selected_mode)"
            v-bind:title="input.info"
            v-bind:id="subject_key +'-'+ group_key +'-'+ key"
        >
            <label v-bind:for="key" v-if="input.label">{{ input.label }}</label>
            <div class="tool input_expand_button" v-if="input.expandable" @click="toggleExpand(input)" title="Expand">
                <i v-if="!input.expanded" class="fas fa-caret-down"></i>
                <i v-else class="fas fa-caret-up"></i>
            </div>
            <template  v-if="input.type == 'list'">
                <!--List-->
                <div class="tool" v-on:click="input.value.push('')"><i class="fas fa-plus-circle"></i></div>
                <ul class="input_list">
                    <li v-for="(item, index) in input.value" :key="index">
                        <input
                            v-model="input.value[index]"
                            v-bind:index="index"
                            v-bind:placeholder="input.placeholder"
                            v-on:input="input.change($event)"
                            v-on:focus="input.focus(index, $event)">
                        <div class="tool" v-on:click="input.value.remove(item)"><i class="fas fa-times-circle"></i></div>
                    </li>
                </ul>
            </template>
            <div v-else class="input_right" :axes="input.axis_count" :class="{expandable: input.expandable, expanded: input.expanded}">

                <template v-if="input.axis_count == 1">
                    <!--Text-->
                    <input
                        v-if="input.type == 'text' || input.type == 'molang'"
                        v-model="input.value"
                        v-bind:placeholder="input.placeholder"
                        v-on:input="input.change($event)"
                        v-on:focus="input.focus(-1, $event)">
                    <!--Number-->
                    <input
                        v-if="input.type == 'number'" type="number"
                        v-model="input.value"
                        v-on:input="input.change($event)">
                </template>

                <template v-else>
                    <!--Text-->
                    <template v-if="input.type == 'text' || input.type == 'molang'">
                        <input class="input_vector"
                            v-for="i in input.axis_count"
                            :key="i"
                            v-model="input.value[i-1]"
                            v-bind:index="i-1"
                            v-bind:placeholder="input.placeholder"
                            v-on:input="input.change($event)"
                            v-on:focus="input.focus(i-1, $event)">
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
                <input v-if="input.type == 'checkbox'" v-bind:id="key" type="checkbox" v-model="input.value">

                <!--Select-->
                <select v-if="input.type == 'select'" v-bind:id="key" v-model="input.meta_value" v-on:change="input.change($event)">
                    <option v-for="(s_label, s_key) in input.options" :key="s_key" v-bind:id="s_key">{{s_label}}</option>
                </select>

                <!--Color-->
                <color-picker v-if="input.type == 'color'" v-model="input.value" v-on:input="input.change($event)"></color-picker>

                <!--Gradient-->
                <gradient v-if="input.type == 'gradient'" :input="input"></gradient>

                <!--Image-->
                <template v-if="input.type == 'image'">
                    <div class="input_texture_wrapper checkerboard">
                        <div class="input_texture_preview" :style="{'background-image': `url(${input.image_data})`}"></div>
                    </div>
                    <div class="tool" v-on:click="input.reset()"><i class="fas fa-times-circle"></i></div>
                    <input  v-bind:id="key" type="file" accept=".png" v-on:change="input.change($event)">
                </template>
            </div>
        </li>
    </ul>
</template>


<script>
import VueColor from 'vue-color'
import Gradient from './Gradient';

export default {
    name: 'input-group',
    props: {
        group: Object,
        group_key: String,
        subject_key: String
    },
    components: {
        'color-picker': VueColor.Chrome,
        Gradient
    },
    methods: {
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
	.input_right.expanded input {
		width: 100% !important;
		display: block;
	}
	.tool.input_expand_button {
		float: right;
		width: 22px;
		padding-left: 3px;
    }
    
    .input_list li {
        margin: 2px 0;
    }
	ul.input_list input {
		width: calc(100% - 100px);
		margin-left: 62px;
	}

	input#image {
		width: 100%;
	}
	.input_texture_wrapper {
		display: block;
		height: 48px;
		width: 48px;
		min-height: 48px;
		min-width: 48px;
		margin-right: 8px;
		margin-left: 44px;
	}
	.input_texture_preview {
        width: 100%;
        height: 100%;
		background-size: contain;
		background-repeat: no-repeat;
	}
	.input_vector {
		width: 40px;
		flex-grow: 1;
        margin-left: 2px;
	}
	.input_vector:first-child {
        margin-left: 0;
	}
</style>
