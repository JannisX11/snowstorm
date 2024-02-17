<template>
    <main id="preview" class="preview">
        <div id="canvas_wrapper">
            <div id="overlay_timestamp">{{ timestamp }}</div>
            <canvas id="canvas" @click="blur()" ref="canvas"></canvas>
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
            <div class="tool ground_collision" :class="{disabled: !collision}" @click="toggleCollision()" title="Preview Collisions">
                <FlipVertical2 :size="20" v-if="collision" />
                <Minus :size="20" v-else />
            </div>

            <div class="spacing" />

            <div class="tool" @click="startAnimation()" title="Play">
                <Play :size="22" />
            </div>
            <div class="tool" @click="togglePause()" title="Pause">
                <Pause :size="22" />
            </div>

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

    import minecraft_block from '../../assets/minecraft_block.png'

    import {
        FlipVertical2,
        Minus,
        Play,
        Pause,
    } from 'lucide-vue'

    const View = {}

    const stats = {
        time: 0
    };
    
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

        let cube_geometry = new THREE.BoxGeometry(1, 1, 1);
		cube_geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(24 * 3).fill(0.3), 3));
        let setupFace = (offset, uv, shade) => {
            for (let i = 0; i < 4; i++) {
                uv[i] = Math.lerp(uv[i], uv[(i+2) % 4], 0.002);
            }
            cube_geometry.attributes.uv.array[offset*2+0] = uv[0];
            cube_geometry.attributes.uv.array[offset*2+1] = uv[1];
            cube_geometry.attributes.uv.array[offset*2+2] = uv[2];
            cube_geometry.attributes.uv.array[offset*2+3] = uv[1];
            cube_geometry.attributes.uv.array[offset*2+4] = uv[0];
            cube_geometry.attributes.uv.array[offset*2+5] = uv[3];
            cube_geometry.attributes.uv.array[offset*2+6] = uv[2];
            cube_geometry.attributes.uv.array[offset*2+7] = uv[3];
            for (let i = 0; i < 4; i++) {
                cube_geometry.attributes.color.setXYZ((offset + i), shade, shade, shade);
            }
        }
        setupFace(0, [0, 0.5, 0.5, 0.0], 0.64); // East/West
        setupFace(4, [0, 0.5, 0.5, 0.0], 0.64); // East/West
        setupFace(8, [0, 0.5, 0.5, 1], 1); // Up
        setupFace(12, [0.5, 0.5, 1, 0.0], 0.5); // Down
        setupFace(16, [0, 0.5, 0.5, 0.0], 0.8); // North/South
        setupFace(20, [0, 0.5, 0.5, 0.0], 0.8); // North/South
        cube_geometry.attributes.uv.needsUpdate = true;
        cube_geometry.attributes.color.needsUpdate = true;
        let cube_texture = new THREE.TextureLoader().load(minecraft_block);
		cube_texture.magFilter = THREE.NearestFilter;
		cube_texture.minFilter = THREE.NearestFilter;
        let cube_material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            map: cube_texture
        });
        View.minecraft_block = new THREE.Mesh(cube_geometry, cube_material);
        View.minecraft_block.position.set(0, -0.51, 0);
        View.scene.add(View.minecraft_block);
        View.minecraft_block.visible = false;

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
            stats.time = Emitter.age;
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
            stats,
            collision: true
        }},
        components: {
            FlipVertical2,
            Minus,
            Play,
            Pause,
        },
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
            blur() {
                document.activeElement.blur()
            },
            startAnimation,
            togglePause
        },
        computed: {
            particle_counter() {
                let string = this.particles.toString();
                return string.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            },
            timestamp() {
                let time = this.stats.time;
                let fractions = Math.floor((time % 1) * 10).toString();
                //if (fractions.length == 1) fractions = '0'+fractions;
                return `${Math.floor(time)}:${fractions}`;
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
        --footer-height: 34px;
	}
	#canvas_wrapper {
		height: calc(100% - var(--footer-height));
		width: 100%;
	}
	canvas {
		height: 100%;
		width: 100%;
        outline: none;
	}
    #overlay_timestamp {
        top: 0;
        left: 0;
        position: absolute;
        opacity: 0.5;
        padding: 4px 10px;
        font-size: 1.1em;
        font-family: Consolas, monospace;
        pointer-events: none;
    }
	footer {
		width: 100%;
		font-size: 1.1em;
        height: var(--footer-height);
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
		padding: 4px 8px;
		padding-top: 4px;
        background-color: var(--color-bar);
    }
	footer > .tool {
		padding-top: 2px;
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
        height: 100%;
        margin-left: 4px;
        padding: 2px 6px;
    }
    #app.portrait_view footer select {
        border-bottom: none;
    }
	div.stat {
        text-align: right;
		float: right;
		background: transparent;
        min-width: 72px;
	}
    div.warning {
        color: #ffc107;
        float: right;
        width: auto;
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