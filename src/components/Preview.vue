<template>
    
    <main id="preview" class="preview selected">
        <div id="canvas_wrapper">
            <canvas id="canvas" ref="canvas"></canvas>
        </div>
        <footer>
            <div class="tool" @click="startAnimation()" title="Play"><i class="unicode_icon" style="font-size: 13pt;">{{'\u25B6'}}</i></div>
            <div class="tool" @click="togglePause()" title="Pause"><i class="unicode_icon pause">{{'\u23F8'}}</i></div>
            <div class="stat" style="width: 66px;">{{fps}} FPS</div>
            <div class="stat">{{particles}} P</div>
        </footer>
    </main>
</template>

<script>

    import $ from 'jquery';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

    import {Emitter, togglePause, startAnimation, initParticles} from './../emitter';

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
        THREE.LineSegments.call( this, geometry, material );
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
        View.grid = new THREE.GridHelper(128, 128, gizmo_colors.grid, gizmo_colors.grid);
        View.grid.position.y -= 0.0005
        View.scene.add(View.helper);
        View.scene.add(View.grid);

        initParticles(View)

        resizeCanvas()
        animate()

    }
    function animate() {
        requestAnimationFrame(animate)
        View.controls.update()
        View.renderer.render(View.scene, View.camera);
        View.frames_this_second++;

        Emitter.tickParticleRotation()
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
    window.addEventListener('resize', resizeCanvas, false);

    window.addEventListener('keypress', (e) => {
        var input_focus = $('input:focus, div[contenteditable="true"]:focus, textarea:focus').length
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
        }},
        methods: {
            updateSize() {
                resizeCanvas()
            },
            startAnimation,
            togglePause
        },
        mounted() {
            initPreview(this.$refs.canvas);
            setInterval(() => {
                this.fps = View.frames_this_second;
                View.frames_this_second = 0;
                this.particles = Emitter.particles.length;
            }, 1000)
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
	}
	footer {
		width: 100%;
		font-size: 1.1em;
        height: 28px;
        padding-left: 6px;
        background-color: var(--color-bar);
        border-top: 1px solid var(--color-border);
	}	
	footer > * {
		padding: 2px 8px; 
		padding-top: 2px;
        background-color: var(--color-bar);
        float: left;
	}
	div.stat {
        text-align: right;
		float: right;
		background: transparent;
	}
</style>