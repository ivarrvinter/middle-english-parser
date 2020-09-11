let extracted = undefined;
const CLEANUP_IGNORES = [
	'S2.— ', 'S2.—', 'S2. ', 'S2.',
]
const POS_ALL = {
	'n.': 'Noun',
	'v.': 'Verb',
	'sb.': 'Subjunctive',
	'pron.': 'Pronoun',
	'adj.': 'Adjective',
	'conj.': 'Conjunction',
	'interj.': 'Interjection',
	'adv.': 'Adverb',
	'prep.': 'Preposition',
	'det.': 'Determiner',
	'art.': 'Article',
	'pp.': 'Past Participle',
	'interj.': 'Interjection'
};
const AFFIX_ALL = {
	'prefix': 'Prefix',
	'infix': 'Infix',
	'suffix': 'Suffix',
}
const NOUN_ALL = {
	'gen.pl.': 'Genitive plural',
	'sb.': 'Substantive',
	'pl.': 'Plural',
	'acc.': 'Accusative',
	'gen.': 'Genitive',
	'dat.': 'Dative',
	'nom.': 'Nominative'
}
const DIALECT_ALL = {
	'AF.': 'Anglo-French',
	'OF.': 'Old French',
	'Lat.': 'Latin'
}

function CleanUp(txt) {
	for (let i = 0; i < CLEANUP_IGNORES.length; i++) {
		txt = txt.replace(CLEANUP_IGNORES[i], '');
	}
	return txt;
}

function ExtractId(element) {
	return element.getElementsByTagName('b')[0].innerText.split(',');
}
function ExtractPos(element) {
	let posElements = element.getElementsByTagName('i');
	for (let i = 0; i < posElements.length; i++) {
		let e = posElements.item(i);
		let posId = e.innerText;
		if (posId !== undefined && posId in POS_ALL)
			return { element: e, text: POS_ALL[posId] };
	}
	return { element: undefined, text: '' };
}
function ExtractAffix(element) {
	let affixElements = element.getElementsByTagName('i');
	for (let i = 0; i < affixElements.length; i++) {
		let e = affixElements.item(i);
		let affixId = e.innerText;
		if (affixId !== undefined && affixId in AFFIX_ALL)
			return { element: e, text: AFFIX_ALL[affixId] };
	}
	return { element: undefined, text: '' };
}
function ExtractSee(element) {
	let str = element.innerHTML;
	let idx = str.lastIndexOf('<a');
	const INDICES_BEFORE_LINK_TO_SEARCH_FOR_CF = 5;
	const INDICES_BEFORE_LINK_TO_SEARCH_FOR_SEE = 5;
	let idxCfSearch = idx - INDICES_BEFORE_LINK_TO_SEARCH_FOR_CF;
	idxCfSearch = idxCfSearch < 0 ? 0 : idxCfSearch;
	let beforeCf = str.slice(idxCfSearch, idx + 1);
	let idxSeeSearch = idx - INDICES_BEFORE_LINK_TO_SEARCH_FOR_SEE;
	idxSeeSearch = idxSeeSearch < 0 ? 0 : idxSeeSearch;
	let beforeSee = str.slice(idxSeeSearch, idx + 1);
	if (beforeCf.toLowerCase().includes('cf.') || beforeSee.toLowerCase().includes('see')) {
		str = str.slice(idx);
		let e = document.createElement('a');
		e.innerHTML = str;
		let id = e.href.split('#')[1];
		let ext = document.getElementById(id);
		if (ext == undefined) {
			return ['UNDEFINED'];
		}
		if (ext != undefined) {
			return [ExtractId(ext)];
		}
	}
	return [];
	// let externs = element.getElementsByClassName('external');
	// let ret = [];
	// for (let i = 0; i < externs.length; i++) {
	// 	let e = externs.item(i);
	// 	let id = e.href.split('#')[1];
	// 	let ext = document.getElementById(id);
	// 	if (ext !== undefined)
	// 		ret.push(ExtractId(ext));
	// }
	// return ret;
}
function ExtractSrcLang(element) {
	let txt = CleanUp(element.innerText);
	let dIndices = []
	for (let d in DIALECT_ALL) {
		dIndices.push({
			dialect: d,
			index: txt.indexOf(d)
		});
	}
	for (let i = 0; i < dIndices.length; i++) {
	}
	return '';
}
function CleanUpDefinition(def) {
	if (def == null)
		return '';
	let log = '';
	let letters = /^[A-Za-z]+$/;
	for (let i = 0; i < def.length; i++) {
		let ch = def.charAt(i);
		log += "<pre>" + i.toString() + ":'" + ch + "'</pre>";
		if (i == def.length - 1 || ch.match(letters) && ch === ch.toUpperCase()) {
			log += "<pre>Entered If</pre>";
			do {
				i--;
				ch = def.charAt(i);
				log += "<pre>" + i.toString() + ":'" + ch + "'</pre>";
			} while (ch === ' ' || ch === ',' || ch === ';')
			log += 'Ch = [" " | ";" | ","]'
			let ret = def.slice(0, i + 1);
			if (ret.trim() === '')
				return 'DEBUG : No Definition';
			return ret;
		}
	}
	log += "<pre>Input='" + def + "'</pre>"
	return log;
	return 'DEBUG : CleanUpDefinition Failed !';
}
function ExtractDefinition(element) {
	let italics = element.getElementsByTagName('i');
	if (italics.length > 0) {
		let iE = italics.item(0);
		let chs = element.childNodes;
		let chCount = chs.length;
		let found = false;
		for (let i = 0; i < chCount; i++) {
			let ch = chs[i];
			if (found)
				return CleanUpDefinition(ch.nodeValue);
			found = found | (ch == iE);
		}
		if (found)
			return 'DEBUG : Node Found, Not Parsed !';
		return 'DEBUG : Node Not found !';
	}
	return 'DEBUG : Italics Not found !';
}

function ParseLine(element) {
	let parsed = {};
	parsed.id = ExtractId(element);
	parsed.pos = ExtractPos(element);
	parsed.aff = ExtractAffix(element);
	parsed.see = ExtractSee(element);
	parsed.src = ExtractSrcLang(element);
	parsed.def = ExtractDefinition(element);
	parsed.html = element.innerHTML;
	let ret = []
	for (let i in parsed.id) {
		ret[i] = Object.assign({}, parsed);
		ret[i].id = ret[i].id[i];
	}
	return ret;
}

async function ExtractDic(start = 0, end = -1) {
	extracted = {};
	let inputElements = document.getElementById('Input').getElementsByTagName('p');
	if (end < 0)
		end = inputElements.length;
	let input = [];
	let output = document.getElementById('Output');
	output.innerText = 'Initializing Extractor . . .';
	await Delay();
	for (let i = start; i < end; i++) {
		let e = inputElements.item(i);
		if (e === null || e.classList.contains('mynote') || e.classList.contains('notation'))
			continue;
		input.push(e);
		output.innerText = 'Initializing Extractor : ' + (i - start) + ' / ' + (end - start);
		await Delay();
	}
	let count = input.length;
	for (let i = 0; i < count; i++) {
		output.innerText = 'Processing : ' + i + ' / ' + count;
		let words = ParseLine(input[i]);
		for (let i in words) {
			let w = words[i];
			let id = w.id; let initial = id[0].toUpperCase();
			if (!(initial in extracted)) {
				extracted[initial] = {};
			}
			if (!(id in extracted[initial])) {
				extracted[initial][id] = {};
			}
			let index = Object.keys(extracted[initial][id]).length;
			extracted[initial][id][index] = w;
			await Delay();
		}
	};
	document.getElementById('Input').style.display = 'none';
	document.getElementById('Output').innerHTML = await RenderTable(log => output.innerText = log);
}