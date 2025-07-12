<template>
	<div id="event_list">
		<ul class="sortable">
			<li
				class="event"
				v-for="event_entry in group.events" :key="event_entry.uuid"
				v-bind:title="group.info" :id="'event-'+ event_entry.uuid"
			>
				<div class="event_header_bar">
					<div class="event_sort_handle" @mousedown="startSortingList($event)"><GripVertical /></div>
					<label>Event ID</label>
					<input type="text" :value="event_entry.id" @input="renameEvent(event_entry, $event)">
					<div class="remove_event_button" @click="removeEvent(event_entry)">
						Remove Event
					</div>
				</div>
				<event-subpart :subpart="event_entry.event" @modify_event="modifyEvent" />
			</li>
		</ul>
		<list-add-button title="Add Event" @click="addEvent()" />
	</div>
</template>

<script>
import { Plus, X, GripVertical } from 'lucide-vue'
import Vue from 'vue';
import EventSubpart from './EventSubpart.vue';
import registerEdit from '../../edits';
import { Config } from '../../emitter';
import { guid } from '../../util';
import sort from '../../sort'
import ListAddButton from '../Form/ListAddButton.vue';

Vue.component('event-subpart', EventSubpart);

export default {
	name: 'event-list',
	components: {
		Plus,
		X,
		GripVertical,
		ListAddButton,
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
			Config.events[id] = event_entry.event;
			this.group.events.push(event_entry);
			this.modifyEvent();
		},
		removeEvent(entry) {
			this.group.events.remove(entry);
			delete Config.events[entry.id];
			this.modifyEvent();
		},
		startSortingList(event) {
			sort(event, this.group.events)
		},
		modifyEvent(event, type) {
			registerEdit('edit event', event, type == 'text');
		}
	}
}
</script>


<style scoped>
	#event_list {
		margin-block: 12px;
	}
	.event {
		padding: 20px 6px;
		border-top: 2px solid var(--color-bar);
		border-bottom: 2px solid transparent;
	}
	.event:first-of-type {
		border-top-color: transparent;
		margin-top: 0;
		padding-top: 4px;
	}
	.event.sort_before {
		border-top: 2px solid var(--color-accent);
	}
	.event.sort_after {
		border-bottom: 2px solid var(--color-accent);
	}
	.event_header_bar {
		display: flex;
		gap: 4px;
		background-color: var(--color-bar);
		padding: 5px;
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
		padding-top: 2px;
	}

	.remove_event_button {
		padding: 4px;
		cursor: pointer;
	}
	.remove_event_button:hover {
		color: var(--color-highlight);
	}
	

</style>