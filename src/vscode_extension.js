import {loadFile} from './import';
import {ExpandedInput} from './components/ExpressionBar'

const vscode = typeof acquireVsCodeApi == 'function' && acquireVsCodeApi()

if (vscode) {

    function updateContent(text) {
        if (text && typeof text == 'string') {
            let parsed = JSON.parse(text)
			loadFile(parsed)
			if (ExpandedInput.input) {
				ExpandedInput.input.focus()
			}
        }
    }

    window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				updateContent(text);

				vscode.setState({ text });

				return;
		}
    });
    
    const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
	document.addEventListener('keydown', function(e) {
		if ((e.ctrlKey || e.metaKey) && (e.which == 89 || e.which == 90)) {
			e.preventDefault()
			return false;
		}
	})
}

export default vscode
