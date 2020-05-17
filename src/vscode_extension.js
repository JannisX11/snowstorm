const vscode = typeof acquireVsCodeApi == 'function' && acquireVsCodeApi()

if (vscode) {
	document.addEventListener('keydown', function(e) {
		if ((e.ctrlKey || e.metaKey) && (e.which == 89 || e.which == 90)) {
			e.preventDefault()
			return false;
		}
	})
}

export default vscode
