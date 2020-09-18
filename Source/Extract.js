function ToJson(node) {
	if (node.parentNode.tagName === 'BODY' && node.tagName !== 'P')
		return undefined;
	let children = []
	let chCount = node.childNodes.length;
	for (let i = 0; i < chCount; i++) {
		let ret = ToJson(node.childNodes.item(i))
		if (ret !== undefined)
			children.push(ret)
	}
	return {
		tag: node.tagName,
		name: node.name,
		class: node.classList?.length > 0 ? node.classList : undefined,
		text: node.tagName === 'BODY' ? undefined : node.textContent,
		html: (node.parentNode?.tagName === 'BODY') ? node.innerHTML : undefined,
		children: children.length > 0 ? children : undefined
	}
}

function DownloadJson(json) {
	json = json['children']
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