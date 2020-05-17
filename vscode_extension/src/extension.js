const {SnowstormEditorProvider} = require('./snowstormEditor')
console.log(SnowstormEditorProvider)

function activate(context) {
	context.subscriptions.push(new SnowstormEditorProvider(context).getRegistration());
}

exports.activate = activate;