<template>
    <main id="preview" class="preview">
        <div id="canvas_wrapper">
            <canvas id="canvas" ref="canvas"></canvas>
        </div>
        <footer>
            <select id="loop_mode" v-model="loop_mode" @change="changeLoopMode()">
                <option id="auto">Auto</option>
                <option id="looping">Looping</option>
                <option id="once">Once</option>
            </select>
            <select id="parent_mode" v-model="parent_mode" @change="changeParentMode()">
                <option id="world">World</option>
                <option id="entity">Entity</option>
                <option id="locator">Locator</option>
            </select>
            <div class="tool ground_collision" :class="{disabled: !collision}" @click="toggleCollision()" title="Ground Collision"><i class="unicode_icon">{{'\u2305'}}</i></div>

            <div class="spacing" />

            <div class="tool" @click="startAnimation()" title="Play"><i class="unicode_icon" style="font-size: 13pt;">{{'\u25B6'}}</i></div>
            <div class="tool" @click="togglePause()" title="Pause"><i class="unicode_icon pause">{{'\u2016'}}</i></div>

            <div class="spacing" />

            <div class="tool warning" @click="$emit('opendialog', 'warnings')" v-if="warning_count" :title="getWarningTitle()"><i class="unicode_icon warn">⚠</i>{{ warning_count }}</div>
            <div class="stat">{{particle_counter}} P</div>
            <div class="stat" style="width: 66px;">{{fps}} FPS</div>
        </footer>
    </main>
</template>

<script>

    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

    import {Emitter, Scene, initParticles} from './../emitter';
    import {validate} from './WarningDialog'

    const View = {}
    
    const gizmo_colors = {
        r: new THREE.Color(0xfd3043),
        g: new THREE.Color(0x26ec45),
        b: new THREE.Color(0x2d5ee8),
        grid: new THREE.Color(0x3d4954),
    }

    function CustomAxesHelper( size ) {
        size = size || 1;
        var vertices = [
            0, 0, 0,	size, 0, 0,
            0, 0, 0,	0, size, 0,
            0, 0, 0,	0, 0, size
        ];
        var c = gizmo_colors
        var colors = [
            c.r.r, c.r.g, c.r.b,	c.r.r, c.r.g, c.r.b, 
            c.g.r, c.g.g, c.g.b,	c.g.r, c.g.g, c.g.b, 
            c.b.r, c.b.g, c.b.b,	c.b.r, c.b.g, c.b.b,
        ]
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        var material = new THREE.LineBasicMaterial( { vertexColors: 2 } );
        return new THREE.LineSegments(geometry, material );
    }
    CustomAxesHelper.prototype = Object.create( THREE.LineSegments.prototype );

    View.screenshot = function() {
        let dataurl = View.canvas.toDataURL()
        let is_ff = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

        let download = document.createElement('a');
        download.href = dataurl
        download.download = `snowstorm_screenshot.png`;
        if (is_ff) document.body.appendChild(download);
        download.click();
        if (is_ff) document.body.removeChild(download);

    }

    
    function startAnimation() {
        Emitter.stopLoop().playLoop();
    }
    function togglePause() {
        Emitter.toggleLoop();
    }


    function initPreview(canvas) {

        View.canvas = canvas
        View.camera = new THREE.PerspectiveCamera(45, 16/9, 0.1, 3000);
        View.camera.position.set(-6, 3, -6)
        View.renderer = new THREE.WebGLRenderer({
            canvas: View.canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
        })

        View.controls = new OrbitControls(View.camera, View.canvas);
        View.controls.target.set(0, 0.8, 0)
        View.controls.screenSpacePanning = true;
        View.controls.zoomSpeed = 1.4

        View.scene = new THREE.Scene()

        View.helper = new CustomAxesHelper(1);
        View.grid = new THREE.GridHelper(64, 64, gizmo_colors.grid, gizmo_colors.grid);
        View.grid.position.y -= 0.0005
        View.scene.add(View.helper);
        View.scene.add(View.grid);

        initParticles(View)

        resizeCanvas()
        animate()

    }
    function animate() {
        requestAnimationFrame(animate)
        if (View.canvas.offsetParent && (!Emitter.paused || !document.hasFocus || document.hasFocus())) {
            View.controls.update()
            Scene.updateFacingRotation(View.camera);
            View.renderer.render(View.scene, View.camera);
            View.frames_this_second++;
        }
    }
    function resizeCanvas() {
        var wrapper = View.canvas.parentNode;
        var height = wrapper.clientHeight
        var width = wrapper.clientWidth

        View.camera.aspect = width/height;
        View.camera.updateProjectionMatrix();

        View.renderer.setSize(width, height);
        View.renderer.setPixelRatio(window.devicePixelRatio);
    }
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 150)
    });

    window.addEventListener('keypress', (e) => {
        var input_focus = document.querySelector('input:focus, div[contenteditable="true"]:focus, textarea:focus')
        if (input_focus) return;

        if (e.which === 32 && e.ctrlKey) {
            togglePause()
        } else if (e.which === 32) {
            startAnimation()
        }
    })


	View.frames_this_second = 0;

    export default {
        name: 'preview',
        data() {return {
            fps: 0,
            particles: 0,
            loop_mode: 'Looping',
            parent_mode: 'World',
            warning_count: 0,
            collision: true
        }},
        methods: {
            updateSize() {
                resizeCanvas()
            },
            changeLoopMode() {
                Emitter.loop_mode = this.loop_mode.toLowerCase();
            },
            changeParentMode() {
                Emitter.parent_mode = this.parent_mode.toLowerCase();
            },
            toggleCollision() {
                Emitter.ground_collision = !Emitter.ground_collision;
                this.collision = Emitter.ground_collision;
            },
            getWarningTitle() {
                return this.warning_count == 1
                    ? '1 Warning'
                    : (this.warning_count + ' Warnings');
            },
            startAnimation,
            togglePause
        },
        computed: {
            particle_counter() {
                let string = this.particles.toString();
                return string.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            }
        },
        mounted() {
            initPreview(this.$refs.canvas);
            setInterval(() => {
                this.fps = View.frames_this_second;
                View.frames_this_second = 0;
            }, 1000)
            setInterval(() => {
                this.particles = Emitter.particles.length;
            }, 200)
            setInterval(() => {
                if (window.document.hasFocus() && View.canvas.offsetParent) {
                    this.warning_count = validate().length;
                }
            }, 500)
        }
    }
    export {View}
</script>

<style scoped>
	main#preview {
		position: relative;
	}
	#canvas_wrapper {
		height: calc(100% - 28px);
		width: 100%;
	}
	canvas {
		height: 100%;
		width: 100%;
        outline: none;
	}
	footer {
		width: 100%;
		font-size: 1.1em;
        height: 28px;
        background-color: var(--color-bar);
        border-top: 1px solid var(--color-border);
        display: flex;
        overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
	}	
    footer ::-webkit-scrollbar {
		height: 0px;
	}
	footer > * {
		padding: 2px 8px; 
		padding-top: 2px;
        background-color: var(--color-bar);
    }
    footer .spacing {
        flex: 1 1 auto;
        padding: 0;
        margin: 0;
    }
    select {
        appearance: none;
        background-color: var(--color-dark);
        border-top: none;
        height: 27px;
        margin-left: 4px;
        padding: 2px 4px;
    }
    #app.portrait_view footer select {
        border-bottom: none;
    }
	div.stat {
        text-align: right;
		float: right;
		background: transparent;
	}
    div.warning {
        color: var(--yellow);
        float: right;
        width: auto;
        padding-top: 0px;
    }
    div.warning:hover {
        color: #ffe060;
        float: right;
    }
    div.warning > i {
        display: inline;
        margin-right: 4px;
    }
	.unicode_icon.pause {
        margin-top: -4px;
        float: right;
        font-size: 20pt;
        font-weight: bold;
        height: 23px;
        overflow: hidden;
	}
    .ground_collision.disabled {
        opacity: 0.5;
    }
    .ground_collision i {
        font-size: 22pt;
        transform: rotate(180deg);
        margin-top: 13px;
        margin-left: -2px;
        font-weight: bold;
    }
</style>