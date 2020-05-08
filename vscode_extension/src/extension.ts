import * as vscode from 'vscode';
import { SnowstormEditorProvider } from './snowstormEditor';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor provider
	context.subscriptions.push(SnowstormEditorProvider.register(context));
}
