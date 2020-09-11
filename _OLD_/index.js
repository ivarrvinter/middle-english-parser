function SaveDic() {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extracted, undefined, 2));
	var dlAnchorElem = document.createElement('a');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", "Gutenberg.json");
	dlAnchorElem.click();
	dlAnchorElem.remove();
}
async function OnClick() {
	let btn = document.getElementById('Button');
	btn.style.display = 'none';
	if (extracted === undefined) {
		// await ExtractDic(9500, 10500);
		await ExtractDic();
		btn.innerText = 'Save';
	}
	else {
		await SaveDic();
	}
	btn.style.display = undefined;
}