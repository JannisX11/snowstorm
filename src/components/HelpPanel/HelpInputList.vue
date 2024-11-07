<template>
	<section>
		<div v-for="(input, inp_key) of inputs" :class="{input_help: true, visible: isInputVisible(inp_key)}">
			<h2>
				<Brackets v-if="input.type == 'molang'" title="Molang" />
				<WholeWord v-else-if="input.type == 'text'" title="Text" />
				<CheckSquare v-else-if="input.type == 'toggle'" title="Toggle" />
				<Menu v-else-if="input.type == 'select'" title="Select" />
				<Gauge v-else-if="input.type == 'number'" title="Number" />
				<Palette v-else-if="input.type == 'color'" title="Color" />
				<Zap v-else-if="input.type == 'event_trigger'" title="Event Trigger" />
				{{ input.label || getInput(inp_key).label }}
			</h2>
			<div v-if="input.type == 'molang'" class="input_info_bar">
				<span class="input_type_label">{{ labels[input.type] }}</span>
				<span class="input_context_label" v-if="input.type == 'molang'" :style="{backgroundColor: input_context_color[input.context||'emitter']}">{{ labels[input.context||'emitter'] }}</span>
				<span class="input_evaluation" v-if="input.evaluation">{{ labels['evaluation_'+input.evaluation] }}</span>
			</div>
			<p v-if="input.display_input_info != false">{{ input.info || consistentPuncuation(getInput(inp_key).info) }}</p>
			<HelpText :class="{select_description: input.type == 'select'}" v-if="input.text" :text="input.text"></HelpText>
		</div>
	</section>
</template>

<script>
import {
	Brackets,
	WholeWord,
	CheckSquare,
	Menu,
	Gauge,
	Palette,
	Zap

} from 'lucide-vue'
import Data from '../../input_structure'

export default {
	name: 'help-input-list',
	components: {
		Brackets,
		WholeWord,
		CheckSquare,
		Menu,
		Gauge,
		Palette,
		Zap
	},
	props: {
		inputs: Object,
		category_key: String,
		page_key: String,
	},
	data: () => ({
		labels: {
			text: 'Text',
			number: 'Number',
			molang: 'Molang',
			toggle: 'Toggle',

			emitter: 'Per Emitter',
			particle: 'Per Particle',
			curve: 'Per Curve',
			spawned_emitter: 'Spawned Emitter Context',

			evaluation_once: 'Evaluated once',
			evaluation_per_tick: 'Evaluated each tick',
			evaluation_per_loop: 'Evaluated each loop',
			evaluation_per_use: 'Evaluated each time',
			evaluation_per_render: 'Evaluated each render',
			evaluation_per_particle: 'Evaluated on particle spawn',
		},
		input_context_color: {
			emitter: '#e98989',
			particle: '#f9da88',
			spawned_emitter: '#db57ae'
		}
	}),
	methods: {
		getInput(input_key) {
			let input = Data[this.category_key]?.[this.page_key]?.inputs?.[input_key];
			return input ?? 0;
		},
		isInputVisible(input_key) {
			let input = this.getInput(input_key);
			if (!input) return true;
			let group = Data[this.category_key]?.[this.page_key];
			return input.isVisible(group);
		},
		consistentPuncuation(input) {
			if (!input) return '';
			if (input.endsWith('.') || input.endsWith('!')) return input;
			return input + '.';
		}
	}
}
</script>

<style scoped>
	/*.input_help:not(.visible) {
		opacity: 0.8;
	}*/
	h2 > svg {
		height: 22px;
		margin-top: -5px;
		background-color: var(--color-bar);
		border: 1px solid var(--color-dark);
		border-radius: 3px;
	}
	.input_info_bar {
		background-color: var(--color-dark);
		height: 24px;
		border-radius: 4px;
		margin-bottom: 3px;
	}
	.input_type_label {
		padding: 1px 8px;
		height: 100%;
		display: inline-block;
		border-radius: 4px;
		color: var(--color-border);
		background-color: var(--color-accent);
	}
	.input_context_label {
		padding: 1px 8px;
		height: 100%;
		display: inline-block;
		border-radius: 4px;
		color: var(--color-border);
		background-color: var(--color-text);
	}
	.select_description {
		padding-left: 30px;
	}
</style>