const fps = 30;
const delayThreshold = 1000 / fps;
let lastDelay = Date.now();
async function Delay(ms = 0) {
	if (Date.now() - lastDelay > delayThreshold) {
		await new Promise((resolve) => { setTimeout(resolve, ms); });
		lastDelay = Date.now();
	}
}