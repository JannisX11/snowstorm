<template>
	<section>
		<template v-for="line in lines">
			<p v-if="typeof line == 'string'">{{ line }}</p>
			<p class="code_line" v-else-if="line.type == 'code'"><code>{{ line.code }}</code>{{ line.text }}</p>
			<p v-else-if="line.type == 'html'" v-html="line.content"></p>
			<h2 v-else-if="line.type == 'h2'">{{ line.text }}</h2>
			<h3 v-else-if="line.type == 'h3'">{{ line.text }}</h3>
			<h4 v-else-if="line.type == 'h4'">{{ line.text }}</h4>
			<p v-else-if="line.type == 'link'"><a :href="line.href" target="_blank" rel="noopener">{{ line.text }}</a></p>
			<HelpInputList v-else-if="line.type == 'input_list'" :inputs="line.inputs"></HelpInputList>
		</template>
	</section>
</template>

<script>



export default {
	name: 'help-text',
	props: {
		text: {
			type: [String, Array],
			required: true
		}
	},
	computed: {
		lines() {
			return this.text instanceof Array ? this.text : [this.text];
		}
	}
}
</script>

<style scoped>
	#help_panel p.code_line {
		display: flex;
		margin-bottom: 2px;
		line-height: inherit;
	}
	code {
		padding: 4px 8px;
		color: #50cca7;
		font-size: 0.92em;
		background-color: var(--color-dark);
		user-select: text;
        margin-right: 8px;
		height: fit-content;
        display: inline-block;
        text-indent: initial;
        width: 208px;
		flex-shrink: 0;
    }
</style>
<style>
	#help_panel p {
		margin-bottom: 12px;
		line-height: normal;
	}
	#help_panel h1 {
		margin-bottom: 12px;
		padding-bottom: 2px;
		border-bottom: 2px solid var(--color-selection);
	}
	#help_panel h2 {
		margin-top: 22px;
		margin-bottom: 6px;
	}
	#help_panel h3 {
		margin-top: 15px;
		margin-bottom: 5px;
		font-weight: 600;
	}
</style>