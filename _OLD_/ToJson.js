function ToJson(node) {
	let children = []
	let chCount = node.childNodes.length;
	for (let i = 0; i < chCount; i++) {
		children.push(ToJson(node.childNodes.item(i)))
	}
	return {
		tag: node.tagName,
		name: node.name,
		class: node.classList?.length > 0 ? node.classList : undefined,
		text: (node.tagName === 'BODY' || node.parentNode?.tagName === 'BODY') ? undefined : node.textContent,
		html: (node.parentNode?.tagName === 'BODY') ? node.innerHTML : undefined,
		children: children
	}
}

function DownloadJson(json) {
	document.contentType = 'application/json';
	document.body.innerHTML = '<pre>' + JSON.stringify(json, undefined, 4) + '</pre>'
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
		JSON.stringify(json, undefined, 4)
	);
	var dlAnchorElem = document.createElement('a');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", "Source.json");
	dlAnchorElem.click();
	dlAnchorElem.remove();
}