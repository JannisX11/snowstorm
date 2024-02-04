<template>
    <div @click="$emit('click', $event)">
		<Plus :size="20" />
	</div>
</template>

<script>

import {Plus} from 'lucide-vue'


export default {
	name: 'list-add-button',
	components: {
		Plus
	}
}
</script>

<style scoped>
	div {
		width: auto;
		border: 1px dashed var(--color-bar);
		padding: 2px;
		cursor: pointer;
	}
	div:hover {
		background-color: var(--color-dark);
	}
	div > svg {
		margin: auto;
		opacity: 0.8;
		display: block;
	}
</style>