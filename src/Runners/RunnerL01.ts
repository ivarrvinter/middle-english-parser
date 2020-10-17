import { promises as FS } from 'fs';
import { IRunner } from './IRunner';
import { JsonToTableConverter } from '../Converters';
import { spawn } from 'child_process';
import { JSDOM } from 'jsdom';
type TSrcNode = {
	type: string;
	nodes: TSrcNode[];
	text: string | undefined;
	class: string[] | undefined;
};
type TSrcUnit = {
	html: string;
	nodes: TSrcNode[];
};
type TDstDef = {
	pos: string[];
	definition: string;
};
type TDstUnit = {
	word: string;
	html: string;
	nodes: TSrcNode[];
	refs: string[] | undefined;
	defs: TDstDef[] | undefined;
};
const allPos = [
	{ id: ' n.', txt: 'Noun' },
	{ id: ' v.', txt: 'Verb' },
	{ id: ' sb.', txt: 'Subjunctive' },
	{ id: ' subj.', txt: 'Subjunctive' },
	{ id: ' pron.', txt: 'Pronoun' },
	{ id: ' adj.', txt: 'Adjective' },
	{ id: ' conj.', txt: 'Conjunction' },
	{ id: ' num.', txt: 'Numeral' },
	{ id: ' card.', txt: 'Cardinal Adjective' },
	{ id: ' ord.', txt: 'Ordinal Adjective' },
	{ id: ' adv.', txt: 'Adverb' },
	{ id: ' prep.', txt: 'Preposition' },
	{ id: ' det.', txt: 'Determiner' },
	{ id: ' art.', txt: 'Article' },
	{ id: ' pp.', txt: 'Past Participle' },
	{ id: ' inter.', txt: 'Interjection' },
	{ id: ' interj.', txt: 'Interjection' },
	{ id: ' prefix', txt: 'Prefix' },
	{ id: ' prefix.', txt: 'Prefix' },
	{ id: ' suffix', txt: 'Suffix' },
	{ id: ' suffix.', txt: 'Suffix' },
	{ id: ' pl.', txt: 'Plural' },
	{ id: ' gen.', txt: 'Genitive' },
	{ id: ' comp.', txt: 'Comperative Adjective' },
	{ id: ' dat.', txt: 'Dative' },
	{ id: ' pt.', txt: '?POS:pt.?' },
	{ id: ' vb.', txt: 'Verb' },
	{ id: ' intrans.', txt: 'Interansitive' },
	{ id: ' imp.', txt: 'Imperative' },
	{ id: ' s.', txt: "Singular" },
	{ id: ' 1 pr.', txt: '1st Person' },
	{ id: ' 2 pr.', txt: '2nd Person' },
	{ id: ' tr.', txt: 'Transitive' }
];
const allRef = [
	'; see',
	'; See',
	'. see',
	'. See',
	'; cf',
	'; Cf',
	'. cf',
	'. Cf',
];
let logDebugs: boolean = false;
function CombineDefs(d1: TDstDef, d2: TDstDef): TDstDef {
	const posCombined: string[] = d1.pos;
	const defCombined: string = d1.definition + d2.definition;
	for (const p of d2.pos) {
		if (!posCombined.includes(p))
			posCombined.push(p);
	}
	const ret: TDstDef = {
		pos: posCombined,
		definition: defCombined
	};
	if (logDebugs) {
		console.log(`Combined = '${JSON.stringify(ret)}'`);
	}
	return ret;
}
class RunnerL01 implements IRunner {
	private GetRowsForTable(json: TDstUnit[]): JsonToTableConverter.TRow[] {
		const ret: JsonToTableConverter.TRow[] = [];
		json.forEach(u => {
			u.defs?.forEach(d => {
				ret.push({ 'Id': u.word, 'POS': `[${d.pos.join(', ')}]`, 'Def.': d.definition, 'Original': u.html });
			});
			u.refs?.forEach(r => {
				ret.push({ 'Id': u.word, 'Ref': r, 'Original': u.html });
			});
		});
		return ret;
	}
	private dom: JSDOM = new JSDOM('');
	public async Run(): Promise<void> {
		const FILE_SRC = IRunner.DIR_PARSE + '00.Source.json';
		const FILE_DST = IRunner.DIR_PARSE + '01.InText.json';
		const FILE_TST = IRunner.DIR_TESTS + '01.InText.html';
		console.log('Extracting Words, POS, Definitions & Refs from Text');
		const src = JSON.parse(await FS.readFile(FILE_SRC, 'utf-8')) as TSrcUnit[];
		const dst = src.map(this.Process.bind(this));
		await FS.writeFile(FILE_DST, JSON.stringify(dst, undefined, 2), 'utf-8');
		await (new JsonToTableConverter(FILE_DST, FILE_TST, this.GetRowsForTable)).Convert();
	}
	private Process(src: TSrcUnit): TDstUnit {
		try {
			this.dom.window.document.body.innerHTML = src.html;
			let text = (this.dom.window.document.body.textContent ?? 'NO_TEXT');
			// logDebugs = text.includes('adj. and sb.');
			while (text.includes('\n'))
				text = text.replace('\n', ' ');
			while (text.includes('\t'))
				text = text.replace('\t', ' ');
			while (text.includes('  '))
				text = text.replace('  ', ' ');
			text = text.trim();
			return {
				word: this.ExtractWord(src.nodes),
				html: src.html,
				nodes: src.nodes,
				defs: this.ExtractDefs(text),
				refs: this.ExtractRefs(text)
			};
		} catch (e) {
			throw Error(`Failed to parse '${JSON.stringify(src, undefined, 2)}'\nReason : ' + ${e}`);
		}
	}
	private ExtractWord(nodes: TSrcNode[]): string {
		for (const n of nodes) {
			const w = this.FindWordIn(n);
			if (w !== undefined)
				return w;
		}
		throw new Error('Failed to extract Word from ' + JSON.stringify(nodes));
	}
	private FindWordIn(node: TSrcNode): string | undefined {
		if (node.type === 'B' && node.text !== undefined) {
			return node.text;
		} else if (node.nodes !== undefined) {
			for (const n of node.nodes) {
				const w = this.FindWordIn(n);
				if (w !== undefined)
					return w;
			}
		}
		return undefined;
	}
	private ExtractDefs(text: string): TDstDef[] | undefined {
		let indices: number[] = [];
		if (logDebugs) {
			console.log(`\n-------------------------------------------------------------------------------------------------------------\n${text}`);
		}
		allPos.forEach(v => {
			let line = text;
			let lastIndex = 0;
			while (line.includes(v.id)) {
				const idx = line.indexOf(v.id);
				if (idx < 0) {
					break;
				} else {
					line = line.substr(idx + v.id.length);
					lastIndex += idx;
					indices.push(lastIndex);
				}
			}
		});
		indices = indices.sort((a, b) => a - b);
		if (logDebugs) {
			console.log(`Found ${indices.length} indices : [${indices.join(', ')}]`);
		}
		const subs: string[] = [];
		indices.forEach((v, i) => {
			if (i < indices.length - 1) {
				subs.push(text.substring(v, indices[i + 1]));
			} else {
				subs.push(text.substring(v));
			}
		});
		const ret: TDstDef[] = [];
		for (let s of subs) {
			const posList = [];
			for (const p of allPos) {
				if (s.includes(p.id)) {
					posList.push(p.txt);
					s = s.replace(p.id, '');
				}
			}
			for (const r of allRef) {
				if (s.includes(r)) {
					s = s.split(r, 2)[0];
				}
			}
			ret.push({
				pos: posList,
				definition: s
			});
		}
		if (logDebugs) {
			console.log(`Found, ${ret.length} defs : [\n\t${ret.map(d => JSON.stringify(d)).join('\n\t')}\n]`);
		}
		// Clean Up
		const final: TDstDef[] = [];
		for (let i = 1; i < ret.length; i++) {
			const prevDef = ret[i - 1].definition.trim().toLowerCase();
			if (prevDef === 'and' || prevDef === ',') {
				ret[i - 1].definition = '';
				ret[i - 1] = CombineDefs(ret[i - 1], ret[i]);
				const removed = ret.splice(i, 1);
				if (logDebugs) {
					console.log(`Removed Def '${i}' = ${JSON.stringify(removed)}`);
				}
			}
		}
		function CleanUpDef(d: string): string {
			let res = d;
			const trash = [' ', ',', ';'];
			function StartsWithAny(str: string, start: string[]) {
				for (const s of start) {
					if (str.startsWith(s))
						return s;
				}
				return null;
			}
			function EndsWithAny(str: string, end: string[]) {
				for (const e of end) {
					if (str.endsWith(e))
						return e;
				}
				return null;
			}
			let tmpStr: string | null = null;
			tmpStr = StartsWithAny(res, trash);
			while (res !== '' && tmpStr != null) {
				// console.log(`'${res}' Starts With '${tmpStr}'`);
				res = res.substring(tmpStr.length, res.length);
				tmpStr = StartsWithAny(res, trash);
			}
			tmpStr = EndsWithAny(res, trash);
			while (res !== '' && tmpStr != null) {
				// console.log(`'${res}' Ends With '${tmpStr}'`);
				res = res.substring(0, res.length - tmpStr.length);
				tmpStr = EndsWithAny(res, trash);
			}
			return res;
		}
		for (const r of ret) {
			const cleanDef = CleanUpDef(r.definition);
			r.definition = cleanDef;
		}
		if (logDebugs) {
			console.log(`Finally, ${ret.length} defs : [\n\t${ret.map(d => JSON.stringify(d)).join('\n\t')}\n]`);
		}
		return ret.length > 0 ? ret : undefined;
	}
	private ExtractRefs(text: string): string[] | undefined {
		return undefined;
		const refs: string[] = [];
		const refTrash = [
			'('
		];
		for (const r of allRef) {
			if (text.includes(r)) {
				let ref = text.split(r, 2)[0];
				for (const t of refTrash) {
					if (ref.includes(t)) {
						ref = ref.split(t)[0];
					}
				}
				refs.push(ref);
			}
		}
		return refs.length > 0 ? refs : undefined;
	}
}
export { RunnerL01 };