import vscode from './vscode_extension'
import {generateFile} from './export'
import {compileJSON} from './util'

const EditListeners = {};
let timeout;
let typing_merge_threshold = 600;
let last_edit_id = '';

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

function wrapTimeoutInit() {
    if (timeout) {
        clearTimeout(timeout);
        processEdit(last_edit_id)
    }
}
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'request_content_update':
            wrapTimeoutInit()
            return;
    }
});

export default function registerEdit(id, event, cooldown) {
    last_edit_id = id;
    if (event instanceof InputEvent || event instanceof KeyboardEvent || cooldown) {
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
