const vscode = require('vscode')
const {SnowstormEditorProvider} = require('./snowstormEditor')

function activate(context) {
	context.subscriptions.push(
		new SnowstormEditorProvider(context).getRegistration(),
		vscode.commands.registerCommand('snowstorm.switchToSnowstorm', uri => {
			const resource = uri || vscode.window.activeTextEditor?.document.uri
			if (resource) {
				return vscode.commands.executeCommand('vscode.openWith', resource, 'x11.snowstorm')
			}
		})
	)
}

exports.activate = activate;