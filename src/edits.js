import vscode from './vscode_extension'
import {generateFile} from './export'
import {compileJSON} from './util'

const EditListeners = {};

export default function registerEdit(id) {
    console.trace('EDIT', id)
    if (vscode) {
        
        let content = compileJSON(generateFile())
        vscode.postMessage({
            type: 'save',
            content
        });
        console.log('Posted Save')
    } else {
        for (var key in EditListeners) {
            let handler = EditListeners[key];
            handler(id)
        }
    }
}
export {EditListeners}