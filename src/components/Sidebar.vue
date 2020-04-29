<template>
    <content id="sidebar">
        <div id="sidebar_content">
            <h1>SNOWSTORM</h1>
            <div class="input_subject" v-for="(subject, subject_key) in data" :key="subject_key">
                <h3>{{ subject.label }}</h3>
                <div class="input_group" v-for="(group, group_key) in subject" :key="group_key" v-if="typeof group === 'object'">
                    <h4 v-on:click="fold(group)">{{ group.label }}</h4>
                    <ul v-show="!group._folded" v-if="group.type == 'curves'">
                        <curve
                            class="curve"
                            v-for="curve in group.curves"
                            v-bind:title="group.info" :id="subject_key +'-curves-'+ curve.uuid" :uuid="curve.uuid" :key="curve.uuid"
                            :curve.sync="curve" :group_key.sync="group_key" :subject_key.sync="subject_key"
                        ></curve>
                        <label>Add Curve</label>
                        <div class="tool" v-on:click="addCurve()"><i class="fas fa-plus-circle"></i></div>
                    </ul>
                    <ul v-show="!group._folded" v-else>
                        <input-group :group.sync="group" :group_key.sync="group_key" :subject_key.sync="subject_key"></input-group>
                    </ul>
                </div>
            </div>
        </div>
    </content>
</template>

<script>
import Curve from './Sidebar/Curve';
import Gradient from './Sidebar/Gradient';

export default {
    name: 'sidebar'
}
</script>

<style scoped>
    content h1 {
		padding: 20px;
		padding-bottom: 0;
		margin: 0;
		font-family: 'Josefin Sans', sans-serif;
		font-weight: 600;
		font-size: 2.6em;
		color: #9aa3b8;
		overflow: hidden;
	}
	content > div {
		overflow-y: scroll;
		height: 100%;
	}
	.input_subject h3 {
		background-color: #9aa3b8;
		padding: 5px;
		padding-left: 12px;
	}
	.input_group h4 {
		background-color: #cfd7ea;
		padding: 5px;
		font-size: 1.4em;
		padding-left: 12px;
	}
	.input_group h4:hover {
		background-color: #c5cde0;
	}
	.input_group > ul {
		padding: 12px;
		padding-right: 2px;
	}

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
	.input_right .vc-chrome {
		float: left;
		box-shadow: none !important;
		border-radius: 0;
		border: 1px solid gray;
		font-family: inherit;
	}
	.tool.input_expand_button {
		float: right;
		width: 22px;
		padding-left: 3px;
	}

	ul.input_list input {
		width: calc(100% - 100px);
		margin-left: 62px;
	}

	input#image {
		width: 100%;
	}
	.input_texture_preview {
		display: inline-block;
		background-size: contain;
		background-repeat: no-repeat;
		height: 48px;
		width: 48px;
		vertical-align: middle;
		margin-right: 8px;
		margin-left: 44px;
	}
	.input_vector {
		width: 40px;
		flex-grow: 1;
	}
</style>