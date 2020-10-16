import { JSDOM } from 'jsdom';
import { IConverter } from './IConverter';
import { PathLike, promises as FS } from 'fs';
class SourceHtmlToJsonConverter implements IConverter {
	public constructor(
		private readonly source: PathLike,
		private readonly destin: PathLike,
		private readonly ConvertHtmlToJson: (json: any) => any
	) { }
	public async Convert(): Promise<void> {
		const html = await this.ExtractHtmlFromFile();
		console.log('Converting Source Html to Json');
		const json = this.ConvertHtmlToJson(html);
		if (json === null)
			console.error('Failed to extract Html from Source !');
		else {
			console.log(`Writing Converted Json to  '${this.destin.toString()}'`);
			await this.WriteJsonToTarget((json as any).nodes);
		}
	}
	private async WriteJsonToTarget(jsonContent: object | null) {
		if (jsonContent === null)
			throw new Error(`Failed to extract Html from ${this.source}`);
		else
			await FS.writeFile(this.destin, JSON.stringify(jsonContent, undefined, 4), { encoding: 'utf-8', flag: 'w' });
	}
	private async ExtractHtmlFromFile() {
		const dom = new JSDOM(await FS.readFile(this.source, 'utf8'));
		const htmlContent = dom.window.document.getElementById('Content');
		if (htmlContent === null)
			throw new Error(`No element with id 'Content' was found in source file '${this.source}'`);
		return htmlContent;
	}
}
export { SourceHtmlToJsonConverter };