<template>
    <div :class="'curve ' + curve.config.mode">
        <input-group :group.sync="curve" :group_key.sync="group_key" :subject_key.sync="subject_key"></input-group>

        <div class="curve_display" :style="{height: (height+10) + 'px'}">
            <svg>
                <path class="curve_path" :d="curve.svg_data"/>
                <path v-if="curve.config.mode == 'bezier' || curve.config.mode == 'bezier_chain'" class="curve_handles" :d="curve.bezier_handles"/>
                <path class="vertical_line_path" :d="curve.vertical_line_data"/>
                <path class="horizontal_line_path" :d="curve.horizontal_line_data"/>
            </svg>
            <ul class="curve_controls" v-if="curve.config.mode !== 'bezier_chain'">
                <li class="curve_add" v-if="curve.config.mode !== 'bezier'" :key="'add_0'" @click="addNode(0, $event)"></li>
                <template v-for="(value, index) in curve.nodes">
                    <li class="curve_node" :class="{selected: curve.selected_point == index}" :key="'node_'+index" @mousedown="slideValue(index, $event)" @touchstart="slideValue(index, $event); simulateHover($event)">
                        <div class="curve_point"
							v-show="value <= 256 && value >= -256"
							:style="{bottom: ((value-curve.min)/(curve.max-curve.min))*height + 'px'}">
							<label>{{ value }}</label>
						</div>
                    </li>
                    <li class="curve_add" v-if="curve.config.mode !== 'bezier'" :key="'add_'+index+1" @click="addNode(index+1, $event)"></li>
                </template>
            </ul>
			<ul class="curve_controls" v-else @mousedown="addBezierChainNode($event)" @touchstart="addBezierChainNode($event)">
				<li v-for="(point, index) in curve.nodes"
					class="curve_node" :class="{selected: curve.selected_point == index}"
					:key="'node_'+index"
					:style="{bottom: ((getValue(point)-curve.min)/(curve.max-curve.min))*height + 'px', left: ((getWidth()-16) * point.time)+'px'}"
					@mousedown.stop="slideValue(index, $event)"
					@click.stop
					@touchstart="slideValue(index, $event);"
				>
					<div class="curve_point"
						v-show="getValue(point) <= 256 && getValue(point) >= -256"
						style="top: 10px, left: 10px"
					>
						<label>{{getValue(point, true)}} / {{Math.roundTo(point.time, 2)}}</label>
					</div>
					<div v-if="curve.nodes.find(n => n.time < point.time)"
						class="curve_handle_point left_handle"
						:style="{left: (handle_offset *-Math.cos( Math.atan(point.left_slope))) + 'px',  top: (handle_offset * Math.sin( Math.atan(point.left_slope) )) + 'px'}"
					></div>
					<div v-if="curve.nodes.find(n => n.time > point.time)"
						class="curve_handle_point right_handle"
						:style="{left: (handle_offset * Math.cos( Math.atan(point.right_slope) )) + 'px',  top: (handle_offset *-Math.sin( Math.atan(point.right_slope)  )) + 'px'}
					"></div>
				</li>
			</ul>
            <div class="curve_max_num">{{curve.max}}</div>
            <div class="curve_min_num">{{curve.min}}</div>
        </div>
        <div class="curve_point_options" v-if="curve.nodes[curve.selected_point] !== undefined" :point="node = curve.nodes[curve.selected_point]">
			<label v-if="curve.config.mode !== 'bezier_chain'">{{ `${curve.selected_point+1}/${curve.nodes.length}` }}</label>

			<input v-if="curve.config.mode !== 'bezier_chain'" type="number" step="0.01" v-model="node" @input="curve.setNode(curve.selected_point, node)">

			<template v-if="curve.config.mode == 'bezier_chain'">
				<label>T:</label>
				<input type="number" step="0.01" min="0" max="1" v-model="node.time" @input="registerNodeChange('time')">
				
				<label>Value:</label>
				<input type="number" step="0.01" v-model="node.left_value" @input="registerNodeChange('left_value')">
				<input v-if="node.left_value != node.right_value" type="number" step="0.01" v-model="node.right_value" @input="registerNodeChange('right_value')">
				<div class="tool slim" @click="((node.left_value == node.right_value) ? node.right_value += 0.1 : node.right_value = node.left_value); registerNodeChange()" title="Connect Sides">
					<i class="unicode_icon">{{(node.left_value == node.right_value) ? '=' : '≠'}}</i>
				</div>

				<label>Slope:</label>
				<input type="number" step="0.01" v-model="node.left_slope" @input="registerNodeChange('left_slope')">
				<input v-if="node.left_slope != node.right_slope" type="number" step="0.01" v-model="node.right_slope" @input="registerNodeChange('right_slope')">
				<div class="tool slim" @click="((node.left_slope == node.right_slope) ? node.right_slope += 0.1 : node.right_slope = node.left_slope); registerNodeChange()" title="Connect Sides">
					<i class="unicode_icon">{{(node.left_slope == node.right_slope) ? '=' : '≠'}}</i>
				</div>
			</template>
			
            <div v-if="curve.config.mode !== 'bezier'" class="tool curve_point_remove_tool" @click="curve.removeNode(curve.selected_point, $event)">
				<i class="unicode_icon">{{'\u2A09'}}</i>
			</div>
        </div>
        <div class="curve_footer">
            <div class="fill_line" @mousedown="slideCurveHeight($event)" @touchstart="slideCurveHeight($event)"></div>
            <div class="tool" style="width: auto;" v-on:click="curve.remove()">Remove Curve</div>
        </div>
    </div>
</template>


<script>
	import InputGroup from './InputGroup'
	import registerEdit from '../../edits'
	import {calculateOffset, convertTouchEvent} from './../../util'
	import Vue from 'vue'

	function toCatmullRomBezier( points, tension = 0.5, closing = false) {
		// sets tension [0.0, 1.0] +/-
		let tens = (tension !== 0) ? tension * 12 : 0.5 * 12
		// duplicate First point to the end if the Path is not closed
		const PointList = (closing) ? [...copyFirstPointToLast(points)] : [...points]
		// Make sure Points have correct type
		const floats = PointList.map(x => x.map(x => parseFloat(x)))
		// Set starting point for SVG
		const firstMoveto = ['M' + floats[0][0] + ' ' + floats[0][1] + ' ']
		// Generate Point Matrix from points
		const matrixPoints = floats.map((point, i, arr) => {
			if (i == 0) {
				return getMatrix([arr[i],arr[i],arr[i+1],arr[i+2]])
			} else if (i == arr.length - 2) {
				return getMatrix([arr[i-1],arr[i],arr[i+1],arr[i+1]])
			} else {
				return getMatrix([arr[i-1],arr[i],arr[i+1],arr[i+2]])
			}
		}).filter(mx => mx[3] !== undefined)
		// some Matrix Multiplication for the Bezier points
		const matrixMathToBezier = matrixPoints.map(p => {
			return [
				{ x: p[1].x,	y: p[1].y },
				{ x: ((-p[0].x + tens * p[1].x + p[2].x) / tens), y: ((-p[0].y + tens * p[1].y + p[2].y) / tens)},
				{ x: ((p[1].x + tens * p[2].x - p[3].x) / tens),	y: ((p[1].y + tens * p[2].y - p[3].y) / tens) },
				{ x: p[2].x,	y: p[2].y }
			]
		})
		
		const toSVGNotation = matrixMathToBezier.map(bp => {
			return "C" + bp[1].x + "," + bp[1].y + " " + bp[2].x + "," + bp[2].y + " " + bp[3].x + "," + bp[3].y + " "
		})
		
		// Add the Moveto comand and join to string
		return firstMoveto.concat(toSVGNotation).join(' ')
		
		// Functions:
		// Seperate X and Y values from Point Array for clarity -> eg. [[x,y],[x,y],[x,y]]
		function getMatrix(arr) {
			return arr.map(p => {
				if (p !== undefined) { return { x : p[0], y : p[1] }}
			}) 
		}
		// Duplicate first element to the end
		function copyFirstPointToLast(arr) {
			return (arr[0] !== arr[arr.length - 1]) ? [...arr, arr[0]] : arr
		}
	}

	export default {
		name: 'curve',
		components: {InputGroup},
		props: {
			curve: Object,
			group_key: String,
			subject_key: String,
		},
		data() {return {
			handle_offset: 24,
			height: 140
		}},
		methods: {
			getWidth() {
				return this.$el ? this.$el.clientWidth : 300
			},
			simulateHover(event) {
				let {target} = event;
				setTimeout(() => {
					function remove(e) {
						if (e.target == target || e.target.parentElement == target) return;
						setTimeout(() => {
							target.classList.remove('touch_active');
							document.removeEventListener('touchstart', remove)
						}, 1)
					}
					document.addEventListener('touchstart', remove)
					target.classList.add('touch_active');
				}, 10)
			},
			getValue(point, show_second) {
				if (typeof point == 'object') {
					if (show_second && point.left_value !== point.right_value) {
						return `${point.left_value} / ${point.right_value}`
					}
					return point.left_value;
				} else {
					return point;
				}
			},
			slideValue(index, event) {
				convertTouchEvent(event);
				this.curve.selected_point = index;

				var scope = this;
				var curve = this.curve;
				var start = event.clientY;
				var start_x = event.clientX;
				var start_time = curve.nodes[index].time;
				var threshold = 0.03 * (curve.max - curve.min);

				var start_value = this.curve.config.mode == 'bezier_chain' ? curve.nodes[index].left_value : curve.nodes[index];
				var start_slope = this.curve.config.mode == 'bezier_chain' && curve.nodes[index].left_slope;
				var synced_value = this.curve.config.mode == 'bezier_chain' && curve.nodes[index].left_value == curve.nodes[index].right_value;
				var synced_slope = this.curve.config.mode == 'bezier_chain' && curve.nodes[index].left_slope == curve.nodes[index].right_slope;

				function slide(e2) {
					convertTouchEvent(e2);

					if (event.target.classList.contains('curve_handle_point')) {
						let right = event.target.classList.contains('right_handle');
						var slope = start_slope + (start - e2.clientY) * 0.05 * (right ? 1 : -1);
						//snap
						if (slope > -threshold && slope < threshold) slope = 0;
						
						if (synced_slope || !right) curve.nodes[index].left_slope = Math.roundTo(slope, 2);
						if (synced_slope || right) curve.nodes[index].right_slope = Math.roundTo(slope, 2);
						scope.updateSVG();

					} else {
						var value = start_value + (start - e2.clientY) / scope.height * (curve.max - curve.min);
						//snap
						if (value > (1-threshold) && value < (1+threshold)) value = 1;
						if (value > -threshold && value < threshold) value = 0;

						if (curve.config.mode == 'bezier_chain') {
							var time = start_time - (start_x - e2.clientX) / (scope.getWidth()-16);
							curve.nodes[index].time = Math.clamp(Math.roundTo(time, 3), 0, 1);

							if (synced_value || !(e2.ctrlKey || e2.metaKey)) curve.nodes[index].left_value = Math.roundTo(value, 2);
							if (synced_value ||  (e2.ctrlKey || e2.metaKey)) curve.nodes[index].right_value = Math.roundTo(value, 2);
							curve.updateMinMax();
							scope.updateSVG();

						} else {
							curve.setNode(index, value);
						}
					}
				}
				function stopSlide() {
					document.removeEventListener('mousemove', slide);
					document.removeEventListener('mouseup', stopSlide);
					document.removeEventListener('touchmove', slide);
					document.removeEventListener('touchend', stopSlide);
					registerEdit('edit curve node')
				}
				document.addEventListener('mousemove', slide, {passive: false});
				document.addEventListener('mouseup', stopSlide, {passive: false});
				document.addEventListener('touchmove', slide, {passive: false});
				document.addEventListener('touchend', stopSlide, {passive: false});
			},
			slideCurveHeight(event) {
				convertTouchEvent(event);

				let scope = this;
				let original_height = this.height;

				function slide(e2) {
					convertTouchEvent(event);
					scope.height = original_height + e2.clientY - event.clientY;
					scope.updateSVG()
				}
				function stopSlide() {
					document.removeEventListener('mousemove', slide);
					document.removeEventListener('mouseup', stopSlide);
					document.removeEventListener('touchmove', slide);
					document.removeEventListener('touchend', stopSlide);
				}
				document.addEventListener('mousemove', slide, {passive: false});
				document.addEventListener('mouseup', stopSlide, {passive: false});
				document.addEventListener('touchmove', slide, {passive: false});
				document.addEventListener('touchend', stopSlide, {passive: false});
			},
			registerNodeChange(key) {
				if (this.curve.config.mode == 'bezier_chain' && this.curve.nodes[this.curve.selected_point]) {
					let point = this.curve.nodes[this.curve.selected_point];
					point.left_value = parseFloat(point.left_value);
					point.right_value = parseFloat(point.right_value);
					point.left_slope = parseFloat(point.left_slope);
					point.right_slope = parseFloat(point.right_slope);
					this.curve.updateMinMax();

					if (key == 'left_value') point.right_value = point.left_value;
					if (key == 'left_slope') point.right_slope = point.left_slope;
				}
				registerEdit('edit curve node');
				this.updateSVG()
			},
			addNode(index, event) {
				var value = 0;
				if (this.curve.nodes[index-1] != undefined && this.curve.nodes[index] != undefined) {
					value = (this.curve.nodes[index-1] + this.curve.nodes[index])/2
				}
				value = Math.round(value*100)/100;
				this.curve.nodes.splice(index, 0, value);
				this.curve.updateSVG();
				registerEdit('add curve node')
			},
			addBezierChainNode(event) {
				if (!event.target.classList.contains('curve_controls')) return;
				convertTouchEvent(event);
				let {curve} = this;
				let value = event.offsetY / this.height
				value = curve.min + (curve.max-curve.min) * ((this.height+5) - event.offsetY) / this.height;
				value = Math.roundTo(value, 2);
				var node = {
					time: Math.clamp(Math.roundTo(event.offsetX / this.getWidth(), 2), 0, 1),
					left_value: value,
					right_value: value,
					left_slope: 0,
					right_slope: 0,
				}
				this.curve.nodes.push(node);
				this.curve.updateSVG();
				registerEdit('add curve node')
			},
			updateSVG() {
				var curve = this.curve;
				let scope = this;
				curve.svg_data = '';
				curve.bezier_handles = '';
				curve.vertical_line_data = '';

				var points = document.querySelectorAll(`.curve[uuid="${curve.uuid}"] .curve_node .curve_point`)
				if (!points.length) return curve;

				var parent_offset = calculateOffset(document.querySelector(`.curve[uuid="${curve.uuid}"] .curve_display`))[0] + 1;
				var start = calculateOffset(points[0])[0] + 5 - parent_offset;
				var end = calculateOffset(points[points.length-1])[0] + 5 - parent_offset;
				var width = end-start;
				var gap = width / (curve.nodes.length-1);
				if (!width) return;

				function getPoint(index, raw) {
					var point = [
						index * gap + (start),
						(scope.height+5) - ((curve.nodes[index]-curve.min) / (curve.max-curve.min)) * scope.height
					]
					return raw ? point : point.join(' ');
				}

				var ground = (this.height+5) - (-curve.min / (curve.max-curve.min)) * this.height;
				var ceiling = (this.height+5) - ((1-curve.min) / (curve.max-curve.min)) * this.height;
				curve.horizontal_line_data = `M${0} ${ground} L${2000} ${ground} M${0} ${ceiling} L${2000} ${ceiling}`;

				curve.svg_data += `M${getPoint(0)}`;

				if (curve.inputs.mode.value == 'linear') {

					for (var i = 1; i < curve.nodes.length; i++) {
						curve.svg_data += ` L${getPoint(i)}`;
					}
					curve.vertical_line_data = `M${start} ${this.height+10} L${start} 0 M${end} ${this.height+10} L${end} 0`;

				} else if (curve.inputs.mode.value == 'bezier') {
					
					curve.svg_data += ` C${getPoint(1)} ${getPoint(2)} ${getPoint(3)}`

					curve.vertical_line_data = `M${start} ${this.height+10} L${start} 0 M${end} ${this.height+10} L${end} 0`;
					
					curve.bezier_handles = `M${getPoint(0)} L${getPoint(1)} M${getPoint(2)} L${getPoint(3)}`

				} else if (curve.inputs.mode.value == 'bezier_chain') {

					width = this.getWidth() - 16;
					
					curve.svg_data = ``;
					let nodes = curve.nodes.slice().sort((a, b) => a.time - b.time);

					let i = 0;
					for (let before of nodes) {
						let after = nodes[i+1];
						if (!after) return;
						let time_diff = after.time - before.time;
						let points = [
							[8 + width * (before.time + time_diff * (0/3)), before.right_value],
							[8 + width * (before.time + time_diff * (1/3)), before.right_value + before.right_slope * (1/3)],
							[8 + width * (before.time + time_diff * (2/3)), after.left_value - after.left_slope * (1/3)],
							[8 + width * (before.time + time_diff * (3/3)), after.left_value],
						]
						points.forEach(point => {
							point[1] = (this.height+5) - ((point[1]-curve.min) / (curve.max-curve.min)) * this.height;
						})

						if (i == 0) curve.svg_data += `M${8},${points[0][1]} L${points[0].join(',')} `;

						curve.svg_data += `M${points[0].join(',')} C${points[1].join(',')} ${points[2].join(',')} ${points[3].join(',')} `;

						if (i == nodes.length-2) curve.svg_data += `M${points[3].join(',')} L${8 + width},${points[3][1]}`;
						
						curve.bezier_handles += `M${points[0].join(',')} L${points[1].join(',')} M${points[2].join(',')} L${points[3].join(',')} `;
						
						i++;
					}

					curve.vertical_line_data = `M${start} ${this.height+10} L${start} 0 M${end} ${this.height+10} L${end} 0`;

				} else if (curve.inputs.mode.value == 'catmull_rom') {

					var points = [];
					curve.nodes.forEach((node, i) => {
						points.push(getPoint(i, true));
					})
					curve.svg_data = toCatmullRomBezier(points);

					curve.vertical_line_data = `M${start+gap} ${this.height+10} L${start+gap} 0 M${end-gap} ${this.height+10} L${end-gap} 0`;

				}
			}
		},
		watch: {
			'curve.svg_needs_update'(v) {
				Vue.nextTick(() => {
					if (v) this.updateSVG()
					this.curve.svg_needs_update = false;
				})
			}
		},
		mounted() {
			this.updateSVG()
			this.curve.svg_needs_update = false;
		}
	}
</script>


<style scoped>
	.curve {
		padding-bottom: 8px;
		padding-top: 12px;
		--color-curve: #657c86;
	}
	.curve_display {
		position: relative;
		background-color: var(--color-bar);
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
		stroke: var(--color-curve);
	}
	.curve_display .curve_handles {
		fill: none;
		stroke-width: 2px;
		stroke: var(--color-selection);
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
	.curve.bezier_chain .curve_display .curve_controls {
		cursor: copy;
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
	.curve.bezier_chain .curve_controls {
		display: block;
	}
	.curve.bezier_chain .curve_controls .curve_node {
		cursor: move;
		height: 20px;
		width: 20px;
		position: absolute;
		margin-bottom: -6px;
	}
	.curve.bezier_chain .curve_controls .curve_node .curve_point {
		margin-top: 4px;
	}
	.curve_node:hover, .curve_node.touch_active {
		background-color: rgba(174, 217, 255, 0.1);
	}
	.curve_controls .curve_add:hover {
		background-color: rgba(174, 217, 255, 0.1);
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
		white-space: nowrap;
	}
	.curve_node:hover .curve_point label {
		display: block;
	}
	.curve_node.selected .curve_point {
		background: var(--color-accent);
		height: 10px;
		width: 10px;
		margin-bottom: 0px;
		margin-top: 4px;
	}
	.curve.bezier_chain .curve_controls .curve_node.selected .curve_point {
		margin-top: 3px;
	}
	.curve_handle_point {
		height: 8px;
		width: 8px;
		background: var(--color-text_grayed);
		border-radius: 50%;
		position: absolute;
		cursor: row-resize;
		margin: 4px 6px;
	}
	.curve_handle_point::before {
		content: "";
		display: block;
		position: absolute;
		top: -4px;
		left: -4px;
		height: 16px;
		width: 16px;
	}
	.curve_controls .curve_add {
		cursor: copy;
	}
	.curve_controls .curve_add:first-child, .curve_controls .curve_add:last-child {
		max-width: 20px;
	}
	.curve_point_options {
		display: flex;
	}
	.curve_point_options label {
		padding: 4px 8px;
		margin-bottom: 0;
	}
	.curve_point_options label:not(:first-child), .curve_point_remove_tool {
		margin-left: auto;
	}
	.curve_point_options input {
		width: 0px;
		min-width: 40px;
		flex-grow: 1;
	}
	.tool.slim {
		width: 24px;
		text-align: center;
		padding: 1px 0;
	}
	.curve_footer {
		display: flex;
		height: 30px;
	}
	.curve_footer .fill_line {
		flex-grow: 1;
		cursor: ns-resize;
	}
	.curve_footer .fill_line::after {
		content: "";
		pointer-events: none;
		width: 100%;
		height: 2px;
		display: inline-block;
		margin: auto;
		background-color: var(--color-bar);
	}
	.curve_footer:hover .fill_line::after {
		background-color: var(--color-selection);
	}
</style>