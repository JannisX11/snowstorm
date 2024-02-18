
export const OptionValues = {
	grid_visible: true,
	minecraft_block_visible: false,
	axis_helper_visible: true,
}

try {
	let raw = window.localStorage && window.localStorage.getItem('snowstorm.options');
	if (raw) {
		let stored_values = JSON.parse(raw);
		for (let id in stored_values) {
			if (id in OptionValues) {
				OptionValues[id] = stored_values[id];
			}
		}
	}
} catch (err) {
	console.error('Failed to load settings', err);
}

export function setOption(id, value) {
	OptionValues[id] = value;
	localStorage.setItem('snowstorm.options', JSON.stringify(OptionValues));
}

