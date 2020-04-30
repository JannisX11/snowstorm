<template>
    <div class="curve">
        <input-group :group.sync="curve" :group_key.sync="group_key" :subject_key.sync="subject_key"></input-group>

        <div class="curve_display">
            <svg>
                <path class="curve_path" :d="curve.svg_data"/>
                <path class="vertical_line_path" :d="curve.vertical_line_data"/>
                <path class="horizontal_line_path" :d="curve.horizontal_line_data"/>
            </svg>
            <ul class="curve_controls">
                <li class="curve_add" :key="'add_0'" @click="curve.addNode(0, $event)"></li>
                <template v-for="(value, index) in curve.nodes">
                    <li class="curve_node" :key="'node_'+index" @mousedown="curve.slideValue(index, $event)">
                        <div class="curve_point" :style="{bottom: ((value-curve.min)/(curve.max-curve.min))*140 + 'px'}"><label>{{value}}</label></div>
                        <div class="curve_node_remover tool" @click="curve.removeNode(index, $event)">
                            <i class="fas fa-minus-circle"></i>
                        </div>
                    </li>
                    <li class="curve_add" :key="'add_'+index+1" @click="curve.addNode(index+1, $event)"></li>
                </template>
            </ul>
            <div class="curve_max_num">{{curve.max}}</div>
            <div class="curve_min_num">{{curve.min}}</div>
        </div>
        <div class="curve_footer">
            <div class="fill_line"></div>
            <div class="tool" v-on:click="curve.remove()">Remove Curve</div>
        </div>
    </div>
</template>


<script>
import InputGroup from './InputGroup'
import $ from 'jquery'


export default {
	name: 'curve',
	props: {
		curve: Object,
		group_key: String,
		subject_key: String,
	},
	components: {InputGroup}
}
</script>


<style scoped>
	.curve {
		padding-bottom: 8px;
		padding-top: 12px;
	}
	.curve_display {
		position: relative;
		background-color: var(--color-bar);
		height: 150px;
		margin-top: 10px;
	}
	.curve_display svg {
		height: 100%;
		width: 100%;
	}
	.curve_min_num {
		position: absolute;
		bottom: 0;
		left: 2px;
		pointer-events: none;
	}
	.curve_max_num {
		position: absolute;
		top: 0;
		left: 2px;
		pointer-events: none;
	}
	.curve_display .curve_path {
		fill: none;
		stroke-width: 2px;
		stroke: var(--color-title);
	}
	.curve_display .vertical_line_path {
		fill: none;
		stroke-width: 2px;
		stroke-dasharray: 8;
		stroke: var(--color-selection);
	}
	.curve_display .horizontal_line_path {
		fill: none;
		stroke-width: 2px;
		stroke-dasharray: 6;
		stroke: var(--color-selection);
	}
	.curve_display .curve_controls {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		display: flex;
	}
	.curve_controls .curve_node,
	.curve_controls .curve_add {
		height: 100%;
		flex-grow: 1;
	}
	.curve_controls .curve_node {
		cursor: ns-resize;
		position: relative;
	}
	.curve_node:hover {
		background-color: rgba(174, 217, 255, 0.2);;
	}
	.curve_node .curve_node_remover {
		display: none;
		position: absolute;
		bottom: -25px;
		width: 100%;
		height: 25px;
		text-align: center;
		cursor: default;
	}
	.curve_node:hover .curve_node_remover {
		display: block;
	}
	.curve_node .curve_node_remover i {
		background-color: var(--color-background);
	}
	.curve_node .curve_point {
		position: absolute;
		height: 8px;
		width: 8px;
		right: 0;
		left: 0;
		margin-bottom: 1px;
		margin-right: auto;
		margin-left: auto;
		background: var(--color-text);
		border-radius: 50%;
	}
	.curve_node:hover .curve_point {
		background: white;
	}
	.curve_node .curve_point label {
		display: none;
		pointer-events: none;
		margin-left: 12px;
		margin-top: -8.4px;
	}
	.curve_node:hover .curve_point label {
		display: block;
	}
	.curve_controls .curve_add {
		cursor: copy;
	}
	.curve_controls .curve_add:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
	.curve_controls .curve_add:first-child, .curve_controls .curve_add:last-child {
		max-width: 20px;
	}
	.curve_footer {
		display: flex;
		height: 30px;
	}
	.curve_footer .fill_line {
		flex-grow: 1;
		height: 16px;
		border-bottom: 2px solid var(--color-bar);
	}
</style>