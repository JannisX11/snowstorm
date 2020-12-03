const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

module.exports.SnowstormEditorProvider = class SnowstormEditorProvider {

	constructor(context) {
		this.context = context
	}
	getRegistration() {
		return vscode.window.registerCustomEditorProvider('x11.snowstorm', this);
	}


	resolveCustomTextEditor(document, webviewPanel, _token) {

		webviewPanel.webview.options = {
			enableScripts: true,
			
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		let latest_change_from_snowstorm = false;

		console.log('Loading Snowstorm')

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
				fromExtension: true
			});
		}

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString() && !latest_change_from_snowstorm) {
				updateWebview();
			}
			latest_change_from_snowstorm = false;
		});
		const saveDocumentSubscription = vscode.workspace.onWillSaveTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				webviewPanel.webview.postMessage({
					type: 'request_content_update',
					fromExtension: true
				});
				setTimeout(() => {
					e.document.save();
				}, 60)
				return false;
			}
			return true;
		})

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
			saveDocumentSubscription.dispose();
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'save':
					this.updateText(document, e.content);
					latest_change_from_snowstorm = true;
					break;
				case 'view_code':
					if (e.side) vscode.commands.executeCommand('workbench.action.splitEditor')
					vscode.commands.executeCommand('workbench.action.toggleEditorType');
					break;
				case 'link':
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(e.link));
					break;
				case 'request_texture':
					let path_arr = document.fileName.split(path.sep);
					let particle_index = path_arr.indexOf('particles')
					path_arr.splice(particle_index)
					let filePath = path.join(path_arr.join(path.sep), e.path.replace(/\.png$/, '')+'.png')

					if (fs.existsSync(filePath)) {
						const tex_url = webviewPanel.webview.asWebviewUri(vscode.Uri.file(filePath));
						webviewPanel.webview.postMessage({
							type: 'provide_texture',
							url: tex_url.toString(),
							fromExtension: true
						});
					} else {
						webviewPanel.webview.postMessage({
							type: 'provide_texture',
							url: null,
							fromExtension: true
						});
					}
					break;
			}
		});
		
		updateWebview();
	}

	getHtmlForWebview(webview) {

		const scriptUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'snowstorm', 'app.js')
		));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					* {
						margin: 0;
						padding: 0;
					}
					#app {
						margin-left: -20px;
					}
				</style>
			</head>
			<body>
				<div id="app"></div>
				<script src="${scriptUri}" charset="utf-8"></script>
			</body>
		</html>`
	}

	updateText(document, text) {

		let original = document.getText().replace(/\r/g, '');

		if (text === original) return;

		if (!text || !original || text.substr(0, 16) !== original.substr(0, 16)) {

			const edit = new vscode.WorkspaceEdit();
			edit.replace(
				document.uri,
				new vscode.Range(0, 0, document.lineCount, 0),
				text);
			
			return vscode.workspace.applyEdit(edit);
		}
		
		// Find start of change
		let start_i = 0;
		let start_line = 0;
		let start_pos = 0;
		for (let char of original) {
			if (original[start_i] !== text[start_i]) {
				break;
			}

			if (char == '\n') {
				start_line++;
				start_pos = 0;
			}
			start_pos++;
			start_i++;
		}

		// Find end of change
		let total_lines = (original.match(/\n/g) || []).length + 1;
		let end_i = original.length-1;
		let end_text_i = text.length;
		let end_line = total_lines-1;
		let end_pos = 0;
		let unmatched = false;
		while (end_i >= 0) {
			if (original[end_i] == '\n') {
				if (unmatched) break;
				end_line--;
			}
			if (original[end_i] !== text[text.length - (original.length - end_i)] || end_i < start_i || end_text_i <= start_i) {
				unmatched = true;
			}
			if (unmatched) {
				end_pos++;
			} else {
				end_text_i--;
			}
			end_i--;
		}

		text = text.substring(start_i, end_text_i);

		const edit = new vscode.WorkspaceEdit();
		edit.replace(
			document.uri,
			new vscode.Range(start_line, start_pos-1, end_line, end_pos),
			text);
		
		return vscode.workspace.applyEdit(edit);

	}
}
