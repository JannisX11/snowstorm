<template>
    <content id="sidebar">
        <div id="sidebar_content">
			<logo />
            <div class="input_subject" v-for="(subject, subject_key) in data" :key="subject_key">
                <h3>{{ subject.label }}</h3>
                <div class="input_group" v-for="(group, group_key) in subject" :key="group_key" v-if="typeof group == 'object'">
                    <h4 v-on:click="fold(group)">{{ group.label }}</h4>
					<template v-if="!group._folded">
						<ul v-if="group.type == 'curves'">
							<curve
								class="curve"
								v-for="curve in group.curves"
								v-bind:title="group.info" :id="subject_key +'-curves-'+ curve.uuid" :uuid="curve.uuid" :key="curve.uuid"
								:curve.sync="curve" :group_key.sync="group_key" :subject_key.sync="subject_key"
							></curve>
							<div id="add_curve_button" @click="addCurve()">
								<i class="unicode_icon plus">{{'\uFF0B'}}</i>
							</div>
						</ul>
						<ul v-else>
							<input-group :group.sync="group" :group_key.sync="group_key" :subject_key.sync="subject_key"></input-group>
						</ul>
					</template>
                </div>
            </div>
        </div>
    </content>
</template>

<script>
import Logo from './Sidebar/Logo'
import InputGroup from './Sidebar/InputGroup';
import curve from './Sidebar/Curve';
import {Curve, updateCurvesPanel} from './../curves'

import Data from './../input_structure'


export default {
	name: 'sidebar',
	data() {return {
		data: Data
	}},
	components: {Logo, InputGroup, curve},
	methods: {
		fold: function(group) {
			group._folded = !group._folded
			if (group.curves && !group._folded) {
				updateCurvesPanel();
			}
		},
		updateSize(e) {
			updateCurvesPanel()
		},
		addCurve() {
			Data.effect.curves.curves.push(new Curve())
		}
	}
}
</script>

<style scoped>
	content {
		border-right: 1px solid var(--color-border);
	}
	content > div {
		overflow-y: scroll;
		height: 100%;
		padding-bottom: 240px;
	}
	.input_subject {
		border-right: 1px solid var(--color-border);
		overflow-x: hidden;
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
	#add_curve_button {
		width: 100%;
		border: 1px dashed var(--color-bar);
		cursor: pointer;
	}
	#add_curve_button:hover {
		background-color: var(--color-dark);
	}
	#add_curve_button > i {
		margin-right: auto;
		margin-left: auto;
		opacity: 0.8;
		font-size: 1.4em;
	}


</style>