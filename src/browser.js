import vscode from './vscode_extension'

if (!vscode) {
    window.onbeforeunload = function() {
        return 'Your changes might not be saved';
    }

    async function registerSW() {
        try {
            await navigator.serviceWorker.register('./service_worker.js');
        } catch (err) {
            console.log(err)
        }
	}
    if ('serviceWorker' in navigator) {
        registerSW();
    }
}
