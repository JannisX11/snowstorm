<template>
	<div class="event_list">
		<ul>
			<li
				class="event"
				v-for="event_entry in group.events" :key="event_entry.uuid"
				v-bind:title="group.info" :id="'event-'+ event_entry.uuid"
			>
				<div class="event_header_bar">
					<div class="event_sort_handle"><GripHorizontal /></div>
					<label>Event ID</label>
					<input type="text" :value="event_entry.id" @input="renameEvent(event_entry, $event)">
					<div class="remove_event_button" @click="removeEvent(event_entry)">
						Remove Event
					</div>
				</div>
				<event-subpart :subpart="event_entry.event" @modify_event="modifyEvent" />
			</li>
		</ul>
		<div id="add_event_button" @click="addEvent()">
			<Plus :size="20" />
		</div>
	</div>
</template>

<script>
import { Plus, X, GripHorizontal } from 'lucide-vue'
import Vue from 'vue';
import EventSubpart from './EventSubpart.vue';
import registerEdit from '../../edits';
import { Config } from '../../emitter';
import { guid } from '../../util';

Vue.component('event-subpart', EventSubpart);

export default {
	name: 'event-list',
	components: {
		Plus,
		X,
		GripHorizontal
	},
	props: {
		group: Object
	},
	data() {return {
		names: {

		},
	}},
	methods: {
		renameEvent(event_entry, input_event) {
			let value = input_event.target.value;
			let old_value = event_entry.id;
			console.log(value, old_value)
			delete Config.events[old_value];
			Config.events[value] = event_entry.event;
			event_entry.id = value;
			this.modifyEvent();
		},
		addEvent() {
			let original_id = 'event';
			let id = original_id;
			let i = 0;
			while (this.group.events.find(e => e.id == id)) {
				i++;
				id = original_id + i;
			}
			let event_entry = {
				uuid: guid(),
				id,
				event: {}
			}
			this.group.events.push(event_entry);
			this.modifyEvent();
		},
		removeEvent(entry) {
			this.group.events.remove(entry);
			delete Config.events[entry.id];
			this.modifyEvent();
		},
		modifyEvent(event) {
			registerEdit('edit event', event);
		}
	}
}
</script>


<style scoped>
	.event {
		padding: 20px 10px;
		border-bottom: 2px solid var(--color-bar);
	}
	.event:last-of-type {
		border-bottom: none;
	}
	.event_header_bar {
		display: flex;
		margin-bottom: 4px;
	}
	.event_header_bar > label {
		padding: 4px;
		min-width: 80px;
		text-align: right;
	}
	.event_header_bar > input {
		margin-right: auto;
	}
	.event_sort_handle {
		cursor: grab;
	}

	.remove_event_button {
		padding: 4;
		cursor: pointer;
	}
	.remove_event_button:hover {
		color: var(--color-highlight);
	}
	
	#add_event_button {
		width: 100%;
		border: 1px dashed var(--color-bar);
		padding: 2px;
		cursor: pointer;
	}
	#add_event_button:hover {
		background-color: var(--color-dark);
	}
	#add_event_button > svg {
		margin: auto;
		opacity: 0.8;
		display: block;
	}

</style>