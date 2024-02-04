import { convertTouchEvent } from "./util";

export default function sort(event, list, options = {}) {
	let list_node = event.target;
	let original_child_node;
	while (list_node && !list_node.classList.contains('sortable')) {
		original_child_node = list_node;
		list_node = list_node.parentElement;
	}
	if (!list_node) return;
	let node_list = [...list_node.childNodes];
	let original_index = node_list.indexOf(original_child_node);
	let hover_index = original_index;

	convertTouchEvent(event);
	let move = (e2 => {
		convertTouchEvent(e2);
		let i = 0;
		for (let node of node_list) {
			if (node.matches(':hover')) {
				let height = node.clientHeight;
				let bounding_rect = node.getBoundingClientRect();
				let cursor_offset = e2.clientY - bounding_rect.top;
				console.log('test', i)
				if (cursor_offset > height/2) {
					i++;
				}
				console.log('test2', i)
				break;
			}
			i++;
		}
		if (i == node_list.length+1) {
			return;
		}
		hover_index = i;

		node_list.forEach(node => {
			node.classList.remove('sort_before');
			node.classList.remove('sort_after');
		})
		if (node_list[hover_index]) {
			node_list[hover_index].classList.add('sort_before');
		} else if (node_list[hover_index-1]) {
			node_list[hover_index-1].classList.add('sort_after');
		}
	})
	let end = (e2 => {
		document.removeEventListener('mousemove', move);
		document.removeEventListener('touchmove', move);
		document.removeEventListener('mouseup', end);
		document.removeEventListener('touchend', end);
		convertTouchEvent(e2);
		node_list.forEach(node => {
			node.classList.remove('sort_before');
			node.classList.remove('sort_after');
		})

		if (hover_index != original_index && hover_index >= 0 && hover_index <= list.length) {
			let original_entry = list.splice(original_index, 1)[0];
			if (original_index < hover_index) hover_index--;
			list.splice(hover_index, 0, original_entry);
		}
	
	})
	document.addEventListener('mousemove', move);
	document.addEventListener('touchmove', move);
	document.addEventListener('mouseup', end);
	document.addEventListener('touchend', end);
}