import { IConverter } from './IConverter';
import { PathLike, promises as FS } from 'fs';
import { JSDOM } from 'jsdom';
const DEFAULT_STYLE = `
html {
	color: white;
	background: black;
}
body, table, tbody, thead {
	margin: 0;
	padding: 0;
	width: 100%;
}
td, th {
	padding: 10px;
	border: 5px groove gray;
}
th {
	text-decoration: bold;
}
`;
namespace JsonToTableConverter {
	export type TRow = {
		[id: string]: string | undefined;
	};
}
class JsonToTableConverter implements IConverter {
	public constructor(
		private readonly source: PathLike,
		private readonly destin: PathLike,
		private readonly GetRows: (json: any) => JsonToTableConverter.TRow[],
		private readonly fields?: string[]
	) { }
	public style: string = DEFAULT_STYLE;
	public async Convert(): Promise<void> {
		console.log(`Creating Table '${this.destin}'`);
		const rows = this.GetRows(await this.OpenJsonFile(this.source));
		const html = this.ConvertRowsToTable(rows);
		console.log(`Writing Table '${this.destin}'`);
		await FS.writeFile(this.destin, html, 'utf-8');
	}
	private async OpenJsonFile(path: PathLike): Promise<any> {
		const str = await FS.readFile(path, 'utf-8');
		return JSON.parse(str);
	}
	private rFields: string[] = [];
	private ConvertRowsToTable(rows: JsonToTableConverter.TRow[]): string {
		this.FillRowFields(rows);
		const dom = new JSDOM('');
		const doc = dom.window.document;
		const table = doc.createElement('table');
		table.append(this.WriteTableHead(doc));
		table.append(this.WriteTableBody(doc, rows));
		doc.body.append(table);
		const style = doc.createElement('style');
		style.innerHTML = this.style;
		doc.head.append(style);
		return dom.serialize();
	}
	private FillRowFields(rows: JsonToTableConverter.TRow[]) {
		if (this.fields === undefined) {
			this.rFields = [];
			rows.forEach(v => {
				Object.keys(v).forEach(k => {
					if (!this.rFields.includes(k))
						this.rFields.push(k);
				});
			});
		} else {
			this.rFields = this.fields;
		}
	}
	private WriteTableHead(doc: Document): HTMLElement {
		const tHead = doc.createElement('thead');
		const hRow = doc.createElement('tr');
		this.rFields.forEach(f => {
			const th = doc.createElement('th');
			th.innerHTML = f;
			hRow.append(th);
		});
		tHead.append(hRow);
		return tHead;
	}
	private WriteTableBody(doc: Document, rows: JsonToTableConverter.TRow[]): HTMLElement {
		const tBody = doc.createElement('tbody');
		rows.forEach(r => {
			const tr = doc.createElement('tr');
			this.rFields.forEach(f => {
				const td = doc.createElement('td');
				const tt = r[f];
				if (tt === undefined) {
					td.style.backgroundColor = 'darkred';
				} else {
					td.innerHTML = tt;
				}
				tr.append(td);
			});
			tBody.append(tr);
		});
		return tBody;
	}
}
export { JsonToTableConverter };