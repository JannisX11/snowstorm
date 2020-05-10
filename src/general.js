

var OpenOverlay;
class Overlay {
	constructor(el, options) {
		options = options||0;

		this.el = el;
		this.backdrop = options.backdrop;
		this.onopen = options.onopen;
		this.onclose = options.onclose;
	}
	open(d) {
		OpenOverlay = this;
		this.el.fadeIn(200)
		if (this.backdrop) {
			$('#backdrop').fadeIn(200)
		}
		if (this.onopen) {
			this.onopen(d)
		}
	}
	close(d) {
		if (this.onclose) {
			this.onclose(d)
		}
		OpenOverlay = null;
		this.el.fadeOut(200)
		if (this.backdrop) {
			$('#backdrop').fadeOut(200)
		}
	}
}

(function() {
	let previous_text;
	setInterval(_ => {
		if (open_mode == 'code') {
			var content = compileJSON(generateFile())
			if (content != previous_text) {
				$('code#code').text(content);
				Prism.highlightAll();
				previous_text = content;
			}
		}
	}, 200)
})()


var ExpandedInput, MolangSheet;

