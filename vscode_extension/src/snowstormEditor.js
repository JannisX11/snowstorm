const vscode = require('vscode');
const Path = require('path');
const fs = require('fs');

//Find
/**
 * @callback checkFileCallback
 * @param {{name: string, path: string, content: (string|object)}} x - test
 */
/**
 * Find a file in a directory based on content within the file, optionally optimized via file name match
 * @param {string[]} base_directories List of base directory paths to search in
 * @param {{recursive: boolean, filter_regex: RegExp, priority_regex: RegExp, json: boolean}} options 
 * @param {checkFileCallback} check_file 
 */
function findFileFromContent(base_directories, options, check_file) {
	let deprioritized_files = [];

	function checkFile(path) {
		try {
			let content;
			if (options.read_file !== false) content = fs.readFileSync(path, 'utf-8');
			
			return check_file(path, options.json ? JSON.parse(content, false) : content);

		} catch (err) {
			console.error(err);
			return false;
		}
	}

	let searchFolder = (path) => {
		let files;
		try {
			files = fs.readdirSync(path, {withFileTypes: true});
		} catch (err) {
			files = [];
		}
		for (let dirent of files) {
			if (dirent.isDirectory()) continue;

			if (!options.filter_regex || options.filter_regex.exec(dirent.name)) {
				let new_path = path + Path.sep + dirent.name;
				if (!options.priority_regex || options.priority_regex.exec(dirent.name)) {
					// priority checking
					let result = checkFile(new_path);
					if (result) return result;
				} else {
					deprioritized_files.push(new_path);
				}
			}
		}
		if (options.recursive !== false) {
			for (let dirent of files) {
				if (!dirent.isDirectory()) continue;

				let result = searchFolder(path + Path.sep + dirent.name);
				if (result) return result;
			}
		}
	}
	for (let directory of base_directories) {
		let result = searchFolder(directory);
		if (result) return result;
	}

	for (let path of deprioritized_files) {
		let result = checkFile(path);
		if (result) return result;
	}
}

function getParticleFileFromIdentifier(identifier, document_path) {
	let path_arr = document_path.split(Path.sep);
	let particle_index = path_arr.indexOf('particles');
	path_arr.splice(particle_index+1);
	let filePath = path_arr.join(Path.sep);
	let name = identifier.split(':')[1];
	let files = findFileFromContent([filePath], {filter_regex: /\.json$/i, priority_regex: new RegExp(name, 'i'), json: true}, (path, content) => {
		let file_id = content && content?.particle_effect?.description?.identifier;
		if (file_id == identifier) {
			return [path, content];
		}
	}) || [];
	return files;
}

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
		const savedDocumentSubscription = vscode.workspace.onDidSaveTextDocument(e => {
			if (e.uri.toString() === document.uri.toString()) {
				webviewPanel.webview.postMessage({
					type: 'request_save_texture',
					fromExtension: true
				});
			}
		})

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
			saveDocumentSubscription.dispose();
			savedDocumentSubscription.dispose();
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'save': {
					this.updateText(document, e.content);
					latest_change_from_snowstorm = true;
					break;
				}
				case 'save_texture': {
					if (typeof e.content != 'string' || !e.content.startsWith('data:')) return;
					let path_arr = document.fileName.split(Path.sep);
					let particle_index = path_arr.indexOf('particles')
					path_arr.splice(particle_index)
					let filePath = Path.join(path_arr.join(Path.sep), e.path.replace(/\.png$/, '')+'.png')
					
					let dirname = Path.dirname(filePath);
					if (!fs.existsSync(dirname)) {
						fs.mkdirSync(dirname, {recursive: true});
					}

					let content = e.content.split(',')[1];
					if (content) {
						fs.writeFileSync(filePath, content, {encoding: 'base64'});
					}
					break;
				}
				case 'view_code': {
					if (e.side) vscode.commands.executeCommand('workbench.action.splitEditor')
					vscode.commands.executeCommand('workbench.action.toggleEditorType');
					break;
				}
				case 'link': {
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(e.link));
					break;
				}
				case 'request_texture': {
					let path_arr = document.fileName.split(Path.sep);
					let path_arr_full = path_arr.slice(0, -1);
					let particle_index = path_arr.indexOf('particles')
					path_arr.splice(particle_index)

					const filePathCandidates = [
						// Path relative to the 'particles' ancestor folder of this document
						Path.join(path_arr.join(Path.sep), e.path.replace(/\.png$/, '')+'.png'),

						// Path relative to this document's folder
						Path.join(path_arr_full.join(Path.sep), e.path.replace(/\.png$/, '')+'.png'),

						// Texture file in the same folder as the document
						Path.join(path_arr_full.join(Path.sep), Path.basename(e.path).replace(/\.png$/, '')+'.png')
						
					];
					let fileFound = false;
					for (const filePath of filePathCandidates) {
						if (fs.existsSync(filePath)) {
							const tex_url = webviewPanel.webview.asWebviewUri(vscode.Uri.file(filePath));
							webviewPanel.webview.postMessage({
								type: 'provide_texture',
								request_id: e.request_id,
								url: tex_url.toString(),
								fromExtension: true,
							});
							fileFound = true;
							break;
						}
					}
					if (!fileFound) {
						webviewPanel.webview.postMessage({
							type: 'provide_texture',
							request_id: e.request_id,
							url: null,
							fromExtension: true
						});
					}
					break;
				}
				case 'request_particle_file': {
					let [match_path, match_content] = getParticleFileFromIdentifier(e.identifier, document.fileName);
					if (match_content) {
						webviewPanel.webview.postMessage({
							type: 'provide_particle_file',
							request_id: e.request_id,
							content: JSON.stringify(match_content),
							fromExtension: true
						});
					} else {
						webviewPanel.webview.postMessage({
							type: 'provide_particle_file',
							request_id: e.request_id,
							content: null,
							fromExtension: true
						});
					}
					break;
				}
				case 'open_particle_file_tab': {
					let [match_path] = getParticleFileFromIdentifier(e.identifier, document.fileName);
					if (match_path) {
						(async function() {
							let uri = vscode.Uri.file(match_path);
							vscode.workspace.openTextDocument(uri).then(doc => {
								vscode.window.showTextDocument(doc, { preview: true });
							})
						})()
					}
					break;
				}
				case 'texture_autocomplete': {
					let json_path_arr = document.fileName.split(Path.sep);
					let json_particle_index = json_path_arr.indexOf('particles');
					json_path_arr.splice(json_particle_index);
					let directory_path = Path.join(json_path_arr.join(Path.sep), e.path);

					let list = [];
					try {
						list = fs.readdirSync(directory_path);
					} catch (err) {}
					webviewPanel.webview.postMessage({
						type: 'texture_autocomplete',
						list,
						fromExtension: true
					});
					break;
				}
			}
		});
		
		updateWebview();
	}

	getHtmlForWebview(webview) {

		const scriptUri = webview.asWebviewUri(vscode.Uri.file(
			Path.join(this.context.extensionPath, 'snowstorm', 'app.js')
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
