import { IRunner, RunnerL00, RunnerL01 } from './Runners';
async function Main(): Promise<void> {
	const runners: IRunner[] = [
		new RunnerL00(),
		new RunnerL01()
	];
	for(const r of runners) {
		await r.Run();
	}
}
Main().catch(e => console.error(e));