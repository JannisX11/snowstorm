import vscode from './vscode_extension'
import {generateFile} from './export'
import {compileJSON} from './util'

const EditListeners = {};

export default function registerEdit(id) {
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

export {EditListeners}