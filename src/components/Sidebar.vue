<template>
    <content id="sidebar">
        <div id="sidebar_content">
            <h1>SNOWSTORM</h1>
            <div class="input_subject" v-for="(subject, subject_key) in data" :key="subject_key">
                <h3>{{ subject.label }}</h3>
                <div class="input_group" v-for="(group, group_key) in subject" :key="group_key" v-if="typeof group == 'object'">
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
import InputGroup from './Sidebar/InputGroup';
import curve from './Sidebar/Curve';
import {Curve, updateCurvesPanel} from './../curves'

import Data from './../input_structure'

export default {
	name: 'sidebar',
	data() {return {
		data: Data
	}},
	components: {InputGroup, curve},
	methods: {
		fold: function(group) {
			group._folded = !group._folded
			if (group.curves && !group._folded) {
				updateCurvesPanel();
			}
		},
		addCurve() {
			Data.general.curves.curves.push(new Curve())
		}
	}
}
</script>

<style scoped>
	content {
		border-right: 1px solid var(--color-border);
	}
    content h1 {
		padding: 12px;
		padding-bottom: 0;
		margin: 0;
		font-family: 'Josefin Sans', sans-serif;
		font-weight: 800;
		font-size: 2.6em;
		overflow: hidden;
		/*color: var(--color-title);
		background: linear-gradient(150deg, #dce4e8, #c2d2dc);*/
	}
	content > div {
		overflow-y: scroll;
		height: 100%;
		padding-bottom: 240px;
	}
	.input_subject {
		border-right: 1px solid var(--color-border);
	}
	.input_subject h3 {
		background-color: var(--color-title);
		padding: 4px;
		font-size: 1.4em;
		padding-left: 12px;
	}
	.input_group h4 {
		background-color: var(--color-bar);
		padding: 4px;
		font-size: 1.2em;
		padding-left: 12px;
	}
	.input_group h4:hover {
		filter: brightness(1.1);;
	}
	.input_group > ul {
		padding: 8px;
		padding-right: 2px;
	}



</style>