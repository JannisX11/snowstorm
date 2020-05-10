import vscode from './vscode_extension'

if (!vscode) {
    window.onbeforeunload = function() {
        return 'Your changes might not be saved';
    }
}
