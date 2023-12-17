<template>
    <div class="custom_checkbox">
		<input type="checkbox" :value="value" @input="toggle($event)">
		<CheckSquare v-if="value" :size="21" @click="toggle($event)" />
		<Square v-else :size="21" @click="toggle($event)" />
	</div>
</template>

<script>

import {
	Square,
	CheckSquare
} from 'lucide-vue'


export default {
	name: 'checkbox',
	props: {
		value: Boolean
	},
	components: {
		Square,
		CheckSquare
	},
	methods: {
		toggle(event) {
			this.$emit('input', !this.value);
			this.$emit('change', event);
		}
	}
}
</script>

<style scoped>
	.custom_checkbox {
		padding: 2px;
	}
	input {
		appearance: none;
		width: 0;
		height: 0;
		border: none;
		display: inline;
	}
	svg path:first-child {
		color: var(--color-accent);
		stroke-width: 3px;
	}
</style>