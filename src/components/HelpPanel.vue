<template>
	<content id="help_panel">
		<X class="close_button highlighting_button" :size="22" @click="$emit('close')" />
	</content>
</template>

<script>

const HelpData = {
	quick_setup: {
		title: 'Quick Setup',
	},
	setup: {
		title: 'File',
	},
	effect: {
		title: 'Particle Effect',
	},
	emitter: {
		title: 'Emitter',
	},
	appearance: {
		title: 'Appearance',
	},
	texture: {
		title: 'Texture',
	},
	motion: {
		title: 'Motion',
		overview: [

		],
		pages: {
			mode: {
				
			},
			direction: {
				
			},
			speed: {
				
			}
		}
	},
	lifetime: {
		title: 'Lifetime',
	},
	variables: {
		title: 'Variables',
	},
	events: {
		title: 'Events',
	},
	molang: {
		title: 'MoLang',
	},
};

import { X } from 'lucide-vue'

export default {
	name: 'help-panel',
	data() {return {
		page: '',
		HelpData
	}},
	components: {
		X
	},
	props: {
		portrait_view: Boolean
	},
	computed: {
	},
	methods: {
	}
}
</script>

<style scoped>
	#help_panel {
		width: 400px;
		max-width: 100%;
		background-color: var(--color-interface);
		right: 0;
		top: 32px;
		bottom: 33px;
		position: absolute;
		z-index: 5;
		left: auto;
		grid-area: none;
		border: 1px solid var(--color-border);
	}
	.close_button {
		margin: 4px 4px;
	}
</style>