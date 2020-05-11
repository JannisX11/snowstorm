import vscode from './vscode_extension'
import {generateFile} from './export'
import {compileJSON} from './util'

const EditListeners = {};
let timeout;
let typing_merge_threshold = 600;

function processEdit(id) {
    if (vscode) {
        
        let content = compileJSON(generateFile())
        vscode.postMessage({
            type: 'save',
            content
        });
    } else {
        for (var key in EditListeners) {
            let handler = EditListeners[key];
            handler(id)
        }
    }
}

export default function registerEdit(id, event) {
    if (event instanceof InputEvent || event instanceof KeyboardEvent) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            processEdit(id);
            timeout = null;
        }, typing_merge_threshold)
    } else {
        processEdit(id);
    }
}

export {EditListeners}
