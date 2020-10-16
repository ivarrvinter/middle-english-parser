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
	pos: string;
	definition: string;
};
type TDstUnit = {
	word: string;
	html: string;
	nodes: TSrcNode[];
	refs: string[] | undefined;
	defs: TDstDef[] | undefined;
};
class RunnerL01 implements IRunner {
	private GetRowsForTable(json: TDstUnit[]): JsonToTableConverter.TRow[] {
		const ret: JsonToTableConverter.TRow[] = [];
		json.forEach(u => {
			if ((u.defs === undefined || u.defs.length === 0) && (u.refs === undefined || u.refs.length === 0))
				ret.push({ 'Id': u.word });
			else {
				u.defs?.forEach(d => {
					ret.push({ 'Id': u.word, 'POS': d.pos, 'Def.': d.definition });
				});
				u.refs?.forEach(r => {
					ret.push({ 'Id': u.word, 'Ref': r });
				});
			}
		});
		console.log(ret.length);
		if (ret.length > 0)
			console.log(ret[0]);
		return ret;
	}
	public async Run(): Promise<void> {
		const FILE_SRC = IRunner.DIR_PARSE + '00.Source.json';
		const FILE_DST = IRunner.DIR_PARSE + '01.InText.json';
		const FILE_TST = IRunner.DIR_TESTS + '01.InText.html';
		console.log('Extracting Words, POS, Definitions & Refs from Text');
		const src = JSON.parse(await FS.readFile(FILE_SRC, 'utf-8')) as TSrcUnit[];
		const dst = src.map(this.Process.bind(this));
		await FS.writeFile(FILE_DST, JSON.stringify(dst, undefined, 2), 'utf-8');
		await (new JsonToTableConverter(FILE_DST, FILE_TST, this.GetRowsForTable, [
			'Id', 'POS', 'Def.', 'Ref'
		])).Convert();
	}
	private Process(src: TSrcUnit): TDstUnit {
		try {
			const text = /* new JSDOM(src.html).window.document.body.textContent ?? */ 'NO TEXT';
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
		return [{ pos: '', definition: '' }];
		throw new Error('Method not implemented.');
	}
	private ExtractRefs(text: string): string[] | undefined {
		return [''];
		throw new Error('Method not implemented.');
	}
}
export { RunnerL01 };