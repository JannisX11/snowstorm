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
                    <li class="curve_node" :key="'node_'+index" @mousedown="slideValue(index, $event)" @touchstart="slideValue(index, $event);simulateHover($event)">
                        <div class="curve_point" :style="{bottom: ((value-curve.min)/(curve.max-curve.min))*140 + 'px'}"><label>{{value}}</label></div>
                        <div class="curve_node_remover tool" @click="curve.removeNode(index, $event)">
							<i class="unicode_icon">{{'\u2A09'}}</i>
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
            <div class="tool" style="width: auto;" v-on:click="curve.remove()">Remove Curve</div>
        </div>
    </div>
</template>


<script>
	import InputGroup from './InputGroup'
	import registerEdit from '../../edits'
	import {calculateOffset, convertTouchEvent} from './../../util'

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
		methods: {
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
			slideValue(index, event) {
				if (event.target.classList.contains('curve_node_remover')) return;
				convertTouchEvent(event);

				var scope = this.curve;
				var start = event.clientY;
				var start_value = scope.nodes[index];
				var threshold = 0.03 * (scope.max - scope.min);
				function slide(event) {
					convertTouchEvent(event);
					var value = start_value + (start - event.clientY) / 140 * (scope.max - scope.min);
					//snap
					if (value > (1-threshold) && value < (1+threshold)) value = 1;
					if (value > -threshold && value < threshold) value = 0;

					scope.setNode(index, value);
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
			updateSVG() {
				var curve = this.curve;
				curve.svg_data = '';
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
						145 - ((curve.nodes[index]-curve.min) / (curve.max-curve.min)) * 140
					]
					return raw ? point : point.join(' ');
				}

				var ground = 145 - (-curve.min / (curve.max-curve.min)) * 140;
				var ceiling = 145 - ((1-curve.min) / (curve.max-curve.min)) * 140;
				curve.horizontal_line_data = `M${0} ${ground} L${2000} ${ground} M${0} ${ceiling} L${2000} ${ceiling}`;

				curve.svg_data += `M${getPoint(0)}`;

				if (curve.inputs.mode.value == 'linear') {

					for (var i = 1; i < curve.nodes.length; i++) {
						curve.svg_data += ` L${getPoint(i)}`;
					}
					curve.vertical_line_data = `M${start} 150 L${start} 0 M${end} 150 L${end} 0`;

				} else if (curve.inputs.mode.value == 'bezier') {

				} else if (curve.inputs.mode.value == 'catmull_rom') {

					var points = [];
					curve.nodes.forEach((node, i) => {
						points.push(getPoint(i, true));
					})
					curve.svg_data = toCatmullRomBezier(points);

					curve.vertical_line_data = `M${start+gap} 150 L${start+gap} 0 M${end-gap} 150 L${end-gap} 0`;

				}
			}
		},
		watch: {
			'curve.svg_needs_update'(v) {
				if (v) this.updateSVG()
				this.curve.svg_needs_update = false;
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
	.curve_node:hover, .curve_node.touch_active {
		background-color: rgba(174, 217, 255, 0.1);
	}
	.curve_controls .curve_add:hover {
		background-color: rgba(174, 217, 255, 0.1);
	}
	.curve_node .curve_node_remover {
		display: none;
		position: absolute;
		bottom: -25px;
		width: 100%;
		height: 25px;
		text-align: center;
		cursor: pointer;
	}
	.curve_node:hover .curve_node_remover, .curve_node.touch_active .curve_node_remover {
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