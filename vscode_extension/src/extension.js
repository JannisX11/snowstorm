const {SnowstormEditorProvider} = require('./snowstormEditor')

function activate(context) {
	context.subscriptions.push(new SnowstormEditorProvider(context).getRegistration());
}

exports.activate = activate;