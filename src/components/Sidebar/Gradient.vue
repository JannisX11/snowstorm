<template>
    
</template>

<script>
export default {
    name: 'gradient'
}
</script>


<style scoped>
	.color_gradient {
		width: 100%;
	}
	.gradient_container {
		position: relative;
		width: calc(100% - 10px);
		height: 20px;
		margin: 0 5px 10px 5px;
		border: 1px solid black;
	}
	.gradient_point {
		position: absolute;
		height: 16px;
		width: 10px;
		top: 10px;
		margin-left: -5px;
		border: 1px solid #212529;
		overflow: hidden;
		cursor: pointer;
	}
	.gradient_point.selected {
		border-color: #fff;
		box-shadow: 0 0 2px #000;
		z-index: 4;
	}
	.gradient_inner {
		height: 100%;
		width: 100%;
	}
	.checkerboard {
		--color-checker_offset: #cfd7ea;
		--color-checkerboard: #e5ebfa;
		background-color: var(--color-checkerboard) !important;
		background-image: linear-gradient(45deg, var(--color-checkerboard) 25%, transparent 25%), linear-gradient(-45deg, var(--color-checkerboard) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-checkerboard) 75%), linear-gradient(-45deg, var(--color-checker_offset) 75%, var(--color-checkerboard) 75%);
		background-size: 30px 30px;
		background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
	}
</style>