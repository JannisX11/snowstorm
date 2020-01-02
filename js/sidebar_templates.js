(function() {
	Vue.component('input-group', {
		props: {
			group: Object,
			group_key: String,
			subject_key: String
		},
		components: {
			'color-picker': VueColor.Chrome,
		},
		template: `
		<ul>
			<li
				class="input_wrapper"
				v-for="(input, key) in group"
				v-if="input && input.isInput"
				v-show="!input.enabled_modes || group._selected_mode === null || input.enabled_modes.includes(group._selected_mode)"
				v-bind:title="input.info"
				v-bind:id="subject_key +'-'+ group_key +'-'+ key"
			>
				<label v-bind:for="key" v-if="input.label">{{ input.label }}</label>
				<div class="tool input_expand_button" v-if="input.expandable" @click="input.toggleExpand()" title="Expand">
					<i v-if="!input.expanded" class="fas fa-caret-down"></i>
					<i v-else class="fas fa-caret-up"></i>
				</div>
				<template  v-if="input.type == 'list'">
					<!--List-->
					<div class="tool" v-on:click="input.value.push('')"><i class="fas fa-plus-circle"></i></div>
					<ul class="input_list">
						<li v-for="(item, index) in input.value">
							<input
								v-model="input.value[index]"
								v-bind:index="index"
								v-bind:placeholder="input.placeholder"
								v-on:input="input.change($event)"
								v-on:focus="input.focus(index, $event)">
							<div class="tool" v-on:click="input.value.remove(item)"><i class="fas fa-times-circle"></i></div>
						</li>
					</ul>
				</template>
				<div v-else class="input_right" :axes="input.axis_count" :class="{expandable: input.expandable, expanded: input.expanded}">
					<template v-if="input.axis_count == 1">
						<!--Text-->
						<input
							v-if="input.type == 'text' || input.type == 'molang'"
							v-model="input.value"
							v-bind:placeholder="input.placeholder"
							v-on:input="input.change($event)"
							v-on:focus="input.focus(-1, $event)">
						<!--Number-->
						<input
							v-if="input.type == 'number'" type="number"
							v-model="input.value"
							v-on:input="input.change($event)">
					</template>
					<template v-else>
						<!--Text-->
						<input class="input_vector"
							v-if="input.type == 'text' || input.type == 'molang'"
							v-for="i in input.axis_count"
							v-model="input.value[i-1]"
							v-bind:index="i-1"
							v-bind:placeholder="input.placeholder"
							v-on:input="input.change($event)"
							v-on:focus="input.focus(i-1, $event)">
						<!--Number-->
						<input class="input_vector" type="number"
							v-for="i in input.axis_count"
							v-model="input.value[i-1]"
							v-bind:index="i-1"
							v-if="input.type == 'number'"
							v-on:input="input.change($event)">
					</template>
					<!--Check-->
					<input v-if="input.type == 'checkbox'" v-bind:id="key" type="checkbox" v-model="input.value">
					<!--Select-->
					<select v-if="input.type == 'select'" v-bind:id="key" v-model="input.meta_value" v-on:change="input.change($event)">
						<option v-for="(s_label, s_key) in input.options" v-bind:id="s_key">{{s_label}}</option>
					</select>
					<!--Color-->
					<color-picker v-if="input.type == 'color'" v-model="input.value" v-on:input="input.change($event)"></color-picker>
					<!--Image-->
					<template v-if="input.type == 'image'">
						<div class="input_texture_preview"></div>
						<div class="tool" v-on:click="input.reset()"><i class="fas fa-times-circle"></i></div>
						<input  v-bind:id="key" type="file" accept=".png" v-on:change="input.change($event)">
					</template>
				</div>
			</li>
		</ul>
		`
	})
})()