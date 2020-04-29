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

    import {View, initPreview} from './../preview'



    export default {
        name: 'preview',
        data() {return {
            fps: 0,
            particles: 0,
        }},
        mounted() {
            console.log('mount preview')
            initPreview()
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
		background-color: #9aa3b8;
		position: absolute;
		bottom: 0px;
		width: 800px;
		margin-left: calc(50% - 400px);
		font-size: 1.2em;
		padding-left: 20px;
		background-color: #cfd7ea;
		height: 32px;
	}
</style>