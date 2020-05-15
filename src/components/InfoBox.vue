<template>
    <div id="box">
        <slot></slot>
        <div class="tool close_button" @click="$emit('close')"><i class="unicode_icon">{{'\u2A09'}}</i></div>
    </div>
</template>

<script>
export default {
    name: 'info-box'
}
</script>

<style scoped>
    #box {
        position: absolute;
        background-color: var(--color-interface);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
	    border: 1px solid var(--color-border);
        width: 500px;
        max-width: 100%;
		top: 20px;
        z-index: 50;
        overflow: hidden;
		padding: 16px 20px;
		right: 0;
        left: 0;
        margin: auto;
        font-size: 1.1em;
    }
    .close_button {
        position: absolute;
        top: 13px;
        right: 10px;
    }
</style>
