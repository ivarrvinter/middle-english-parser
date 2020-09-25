function ToJson(node) {
	let children = []
	let chCount = node.childNodes.length;
	for (let i = 0; i < chCount; i++) {
		let ret = ToJson(node.childNodes.item(i))
		if (ret !== undefined)
			children.push(ret)
	}
	return {
		tag: node.tagName, id: node.id, name: node.name,
		class: node.classList?.length > 0 ? node.classList : undefined,
		text: node.id === 'Content' ? undefined : node.textContent,
		html: (node.parentNode?.id === 'Content') ? node.innerHTML : undefined,
		children: children.length > 0 ? children : undefined
	}
}

function DownloadJson(json) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
		JSON.stringify(json, undefined, 4)
	);
	var dlAnchorElem = document.createElement('a');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", "Source.json");
	dlAnchorElem.click();
	dlAnchorElem.remove();
}

let extracted = null;

function OnClickExtract() {
	extracted = ToJson(document.getElementById('Content'));
	extracted = extracted['children'];
	document.getElementById('Content').innerHTML = '<pre>' + JSON.stringify(extracted, undefined, 4) + '</pre>'
}

function OnClickDownload() {
	if (extracted == null) {
		OnClickExtract();
	}
	DownloadJson(extracted);
}