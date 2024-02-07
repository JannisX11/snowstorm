<template>
	<div>
		<div class="highlighting_button" @click="openMenu()">
			<Zap :size="22" v-if="replace" />
			<Plus :size="22" v-else />
		</div>
		<ul v-if="is_open" ref="list" class="list">
			<li v-for="option in getEventIDs()" :key="option" @click="select(option)">
				<Zap :size="20" />
				{{ option }}
			</li>
			<template v-if="getEventIDs().length == 0">
				No events available
			</template>
		</ul>
	</div>
</template>

<script>
import { Plus, Zap } from 'lucide-vue'
import { Config } from '../../emitter';

export default {
	name: 'event-picker',
	components: {
		Plus, Zap
	},
	props: {
		blacklist: Array,
		replace: Boolean
	},
	data() {return {
		is_open: false
	}},
	methods: {
		openMenu() {
			if (this.is_open) return;
			this.is_open = true;
			this.click_listener = (e) => {
				if (this.$refs.list) {
					if (!this.$refs.list.contains(e.target)) {
						this.closeMenu();
					}
				}
			}
			setTimeout(() => {
				document.addEventListener('click', this.click_listener);
			}, 10);
		},
		closeMenu() {
			this.is_open = false;
			if (this.click_listener) {
				document.removeEventListener('click', this.click_listener);
				delete this.click_listener;
			}
		},
		select(option) {
			this.$emit('select', option);
			this.closeMenu();
		},
		getEventIDs() {
			let ids = Object.keys(Config.events);
			if (this.blacklist instanceof Array) {
				ids = ids.filter(id => !this.blacklist.includes(id));
			}
			return ids;
		},
	}
}
</script>


<style scoped>
	.list {
		position: absolute;
		width: 200px;
		min-height: 20px;
		max-height: 200px;
		overflow: auto;
		background-color: var(--color-dark);
		color: var(--color-text_grayed);
		border: 1px solid var(--color-border);
		z-index: 4;
		border-radius: 2px;
		text-align: center;
	}
	.list > li {
		cursor: pointer;
		height: 32px;
		padding: 4px 9px;
		color: var(--color-text);
		text-align: initial;
	}
	.list > li:hover {
		background-color: var(--color-interface);
		color: var(--color-highlight);
	}
	.list > li svg {
		margin-right: 2px;
	}
</style>