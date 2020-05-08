import {loadFile} from './import';

const vscode = typeof acquireVsCodeApi == 'function' && acquireVsCodeApi()

if (vscode) {

    function updateContent(text) {
        if (text && typeof text == 'string') {
            let parsed = JSON.parse(text)
            loadFile(parsed)
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
}

export default vscode
