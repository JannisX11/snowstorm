<template>
    
    <main id="preview" class="preview selected">
        <canvas id="canvas"></canvas>
        <footer>
            <div class="tool" onclick="startAnimation()"><i class="fas fa-play-circle"></i></div>
            <div class="tool" onclick="togglePause()"><i class="fas fa-pause-circle"></i></div>
            <div class="stat">{{fps}} FPS</div>
            <div class="stat">{{particles}} P</div>
        </footer>
    </main>
</template>

<script>

    import {View, Emitter, initPreview, resizeCanvas} from './../preview'

	

	let frames_this_second = 0;

    export default {
        name: 'preview',
        data() {return {
            fps: 0,
            particles: 0,
        }},
        methods: {
            updateSize() {
                resizeCanvas()
            }
        },
        mounted() {
            console.log('mount preview')
            initPreview()
            setInterval(() => {
                this.fps = frames_this_second;
                frames_this_second = 0;
                this.particles = Emitter.particles.length;
            }, 1000)
        }
    }
</script>

<style scoped>
	main#preview {
		position: relative;
	}
	canvas {
		height: 100%;
		width: 100%;
	}
	footer {
		background-color: var(--color-bar);
		position: absolute;
		bottom: 0px;
		width: 800px;
		margin-left: calc(50% - 400px);
		font-size: 1.2em;
		padding-left: 20px;
        height: 32px;
        box-shadow: 0 -1px 14px rgba(0,0,0,0.2);
	    position: absolute;
	}
</style>