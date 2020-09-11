function RenderRow(itemIndex, entry, htmlId = undefined) {
	let ret = '<tr';
	htmlId = entry.id;
	if (htmlId !== undefined)
		ret += ' id="Word' + htmlId + '"';
	ret += '>';
	ret += '<td>' + itemIndex + '</td>';
	ret += '<td>' + entry.id + '</td>';
	ret += '<td>' + entry.def + '</td>';
	ret += '<td>' + entry.pos.text + '</td>';
	ret += '<td>' + entry.aff.text + '</td>';
	ret += '<td>' + entry.src + '</td>';
	// See
	ret += '<td>';
	entry.see.forEach(ext => {
		ret += '<a href="#Word_' + ext + '">' + ext + '</a>';
	});
	ret += '</td>';
	// Original
	ret += '<td>' + entry.html + '</td>';
	ret += '</tr>';
	return ret;
}
async function RenderTable(writeLog) {
	let ret = '<table><thead class="TableHead">';
	let itemIndex = 0;
	ret += RenderRow('Index', {
		id: 'Word',
		pos: { text: 'Part of Speech' },
		aff: { text: 'Affix' },
		see: ['References'],
		src: 'Source Language',
		def: 'Definition',
		html: 'Original'
	});
	ret = ret.replace('<a href="#Word_References">References</a>', '<p>References</p>');
	ret += '</thead><tbody>';
	for (let initial in extracted) {
		for (let id in extracted[initial]) {
			let entries = extracted[initial][id];
			for (let index in entries) {
				let entry = entries[index];
				ret += '\t' + RenderRow(itemIndex, entry) + '\n';
				itemIndex++;
			}
			writeLog('Rendering : ' + id);
			await Delay();
		}
	}
	ret += '</tbody></table>';
	writeLog('');
	await Delay();
	return ret;
}