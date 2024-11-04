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
		inputs: {
			identifier: {
				description: [
					'Set an identifier for the particle effect.',
					'An identifier consists of two parts: The project namespace, and the particle name. The namespace is always separated by a colon',
					'The identifier should be all in lower-case letters and use underscores to separate words. Letters from a-z, numbers, points and underscores are allowed, other characters may cause issues.',
					'Example: `snowstorm:fire`'
				]
			},
			local_space: {
				description: [
					'When enabled, the particle will always move in local space relative to the emitter. When attached to an entity, this means that all particles will move along with the entity.',
					'When disabled, particles are emitted relative to the emitter, then simulate independently from the emitter in the world',
					'Enabling this will prevent collisions with the world from working.',
				]
			},
			local_rotation: {
				description: [
					'Rotate the local space along with the entity that it is attached to. See #setup.local_space',
					'Local position needs to be enabled for local rotation to work',
				]
			},
			local_velocity: {
				description: 'When enabled, the velocity of the emitter will be added to the particles velocity.'
			}
		}
	},
	emitter: {
		title: 'Emitter',
		pages: {
			
		}
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