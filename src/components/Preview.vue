<template>
    <main id="preview" class="preview">
        <div id="canvas_wrapper">
            <div id="overlay_timestamp">{{ timestamp }}</div>
            <canvas id="canvas" @click="blur()" ref="canvas"></canvas>
            <div class="placeholder_bar" v-if="show_placeholder_bar">
                <ul>
                    <li v-for="(key) in placeholder_keys" :key="key">
                        <label :for="'placeholder_'+key">{{ key.replace(key.substring(1, key.indexOf('.')), '') }}</label>
                        <input type="number" :id="'placeholder_'+key" :value="placeholder_values[key] || 0" @input="updatePlaceholderValue(key, $event)">
                        <div class="tool" v-if="key.startsWith('variable')" @click="bakePlaceholderVariable(key)" title="Bake variable value into all expressions">
                            <CheckCheck :size="20" />
                        </div>
                    </li>
                    <li v-if="placeholder_keys.length == 0"><label>No undefined variables found</label></li>
                </ul>

                <div class="tool" @click="hidePlaceholderBar()" title="Hide Placeholder Bar">
                    <X :size="22" />
                </div>
            </div>
        </div>
        <footer>
            <select id="loop_mode" v-model="loop_mode" @change="changeLoopMode()">
                <option value="auto">Auto</option>
                <option value="looping">Looping</option>
                <option value="once">Once</option>
            </select>
            <select id="parent_mode" v-model="parent_mode" @change="changeParentMode()">
                <option value="world">World</option>
                <option value="entity">Entity</option>
                <option value="locator">Locator</option>
            </select>
            <div class="tool ground_collision" :class="{toggle_enabled: collision}" @click="toggleCollision()" title="Preview Collisions">
                <FlipVertical2 :size="20" v-if="collision" />
                <Minus :size="20" v-else />
            </div>
            <div class="tool" :class="{toggle_enabled: show_placeholder_bar}" @click="show_placeholder_bar ? hidePlaceholderBar() : showPlaceholderBar()" title="Show Placeholder Bar">
                <Hash :size="22" />
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

        <dialog id="bake_placeholder_confirm_dialog" ref="bake_placeholder_confirm_dialog" class="modal_dialog" style="max-width: 308px;">
            <div class="form_bar">Do you want to replace all occurrences of '{{ bake_placeholder_key }}' with the value '{{ placeholder_values[bake_placeholder_key] }}'?</div>
            <div class="button_bar">
                <button @click="bakePlaceholderVariableConfirm()">Confirm</button>
                <button @click="$refs.bake_placeholder_confirm_dialog.close()">Cancel</button>
            </div>
        </dialog>
    </main>
</template>

<script>

    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

    import {Emitter, Scene, initParticles} from './../emitter';
    import {validate} from './WarningDialog'

    import {OptionValues} from './../options'

    import minecraft_block from '../../assets/minecraft_block.png'

    import {
        FlipVertical2,
        Minus,
        Play,
        Pause,
        Hash,
        X,
        CheckCheck
    } from 'lucide-vue'

    import {EditListeners} from '../edits'

    import {updateVariablePlaceholderList, bakePlaceholderVariable} from './../variable_placeholders'

    const View = {
        PlaybackController: {
            start() {
                if (!Emitter.initialized || Emitter.age == 0) {
                    Emitter.start();
                }
                Emitter.paused = false;
                return View.PlaybackController;
            },
            toggle() {
                Emitter.paused = !Emitter.paused;
                if (!Emitter.paused) {
                    View.PlaybackController.start();
                }
                return View.PlaybackController;
            },
            stop() {
                Emitter.stop(true);
                Emitter.paused = true;
                return View.PlaybackController;
            }
        }
    }

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
        View.PlaybackController.stop().start();
    }
    function togglePause() {
        View.PlaybackController.toggle();
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
        View.helper.visible = OptionValues.axis_helper_visible;
        View.grid.visible = OptionValues.grid_visible;

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
        View.minecraft_block.visible = OptionValues.minecraft_block_visible;

        initParticles(View)

        resizeCanvas()
        animate()

    }
    let last_frame_time = performance.now();
    function animate() {
        requestAnimationFrame(animate);

        let timestamp = performance.now();
        if (timestamp - last_frame_time > 32) {
            last_frame_time = timestamp;
            if (!Emitter.paused) {
                Emitter.tick();
            }
        }

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

    View.placeholder_variables = {};
	View.frames_this_second = 0;

    export default {
        name: 'preview',
        data() {return {
            fps: 0,
            particles: 0,
            loop_mode: 'auto',
            parent_mode: 'world',
            warning_count: 0,
            stats,
            collision: true,
            placeholder_keys: [],
            placeholder_values: {},
            show_placeholder_bar: localStorage.getItem('snowstorm_show_placeholder_bar') == 'true',
            bake_placeholder_key: null
        }},
        components: {
            FlipVertical2,
            Minus,
            Play,
            Pause,
            Hash,
            X,
            CheckCheck,
        },
        methods: {
            updateSize() {
                resizeCanvas()
            },
            showPlaceholderBar() {
                this.show_placeholder_bar = true;
                updateVariablePlaceholderList(this.placeholder_keys);
                localStorage.setItem('snowstorm_show_placeholder_bar', 'true');
            },
            hidePlaceholderBar() {
                this.show_placeholder_bar = false;
                localStorage.setItem('snowstorm_show_placeholder_bar', 'false');
            },
            updatePlaceholderValue(key, event) {
                this.placeholder_values[key] = parseFloat(event.target.value) || 0;
                for (let key in View.placeholder_variables) {
                    delete View.placeholder_variables[key];
                }
                for (let key of this.placeholder_keys) {
                    if (!this.placeholder_values[key]) this.placeholder_values[key] = 0;
                    View.placeholder_variables[key] = this.placeholder_values[key];
                }
            },
            bakePlaceholderVariableConfirm() {
                this.$refs.bake_placeholder_confirm_dialog.close();
                let key = this.bake_placeholder_key;
                bakePlaceholderVariable(key, this.placeholder_values[key] || 0);
            },
            bakePlaceholderVariable(key) {
                this.bake_placeholder_key = key;
                this.$refs.bake_placeholder_confirm_dialog.showModal();
            },
            changeLoopMode() {
                Emitter.loop_mode = this.loop_mode;
            },
            changeParentMode() {
                Emitter.parent_mode = this.parent_mode;
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
            EditListeners['placeholder_bar'] = () => {
                if (this.show_placeholder_bar) {
                    updateVariablePlaceholderList(this.placeholder_keys);
                }
            };
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
    .placeholder_bar {
        position: absolute;
        bottom: 34px;
        min-height: 35px;
        width: 100%;
        display: flex;
        background-color: color-mix(in srgb, var(--color-background) 90%, transparent);
        border-top: 1px solid var(--color-border);
        backdrop-filter: blur(4px);
    }
    .placeholder_bar > ul {
        display: flex;
        padding: 2px 10px;
        gap: 2px 12px;
        flex-grow: 1;
        flex-wrap: wrap;
    }
    .placeholder_bar > ul > li {
        display: flex;
        gap: 5px;
        align-items: center;
    }
    .placeholder_bar > .tool {
        padding-top: 4px;
    }
    .placeholder_bar input {
        width: 70px;
    }
    .placeholder_bar label {
        color: var(--color-text_grayed);
    }
    .placeholder_bar li > .tool {
        width: 24px;
	    padding: 2px;
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
    .tool.toggle_enabled {
        background-color: var(--color-background);
    }
    
</style>