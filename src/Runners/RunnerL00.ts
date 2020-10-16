import { SourceHtmlToJsonConverter, JsonToTableConverter } from '../Converters';
import { IRunner } from './IRunner';
class RunnerL00 implements IRunner {
	private GetRowsForTable(json: any): JsonToTableConverter.TRow[] {
		return (json as any[]).map(r => {
			return {
				'Original': r.html as string | undefined,
				'Child Count': r.nodes?.length?.toString() as string | undefined,
			};
		});
	}
	private ConvertHtmlToJson(node: Node): any {
		const chCount = node.childNodes.length;
		const children = [];
		for (let i = 0; i < chCount; i++) {
			const ch = this.ConvertHtmlToJson(node.childNodes.item(i));
			if (ch !== null)
				children.push(ch);
		}
		switch (node.nodeType) {
			case node.COMMENT_NODE:
				return null;
			case node.ELEMENT_NODE:
				const element = node as HTMLElement;
				if (element.parentElement?.id === 'Content' && element.tagName !== 'P')
					return null;
				if (element.classList.contains('mynote'))
					return null;
				return {
					type: element.parentElement?.id === 'Content' ? undefined : element.tagName,
					text: element.innerText?.trim() ?? element.textContent,
					html: element.parentElement?.id === 'Content' ? element.innerHTML?.trim() : undefined,
					class: element.classList.length > 0 ? element.classList : undefined,
					nodes: children
				};
			case node.TEXT_NODE:
				const trimmed = node.textContent?.trim() ?? '';
				if (trimmed === '')
					return null;
				return {
					type: 'TXT',
					text: trimmed
				};
			default:
				throw new Error(`Unhandled node type '${node.nodeType}'`);
		}
	}
	public async Run(): Promise<void> {
		const FILE_SRC = 'data/Source.html';
		const FILE_DST = IRunner.DIR_PARSE + '00.Source.json';
		const FILE_TST = IRunner.DIR_TESTS + '00.Source.html';
		const srcHtmlReader = new SourceHtmlToJsonConverter(FILE_SRC, FILE_DST, this.ConvertHtmlToJson);
		const htmlReaderTester = new JsonToTableConverter(FILE_DST, FILE_TST, this.GetRowsForTable);
		await srcHtmlReader.Convert();
		await htmlReaderTester.Convert();
	}
}
export { RunnerL00 };