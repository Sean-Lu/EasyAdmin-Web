export function calculateCronRuns(expression: string, count: number): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL("./cronCalculator.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = event => {
			worker.terminate();
			if (event.data.error) {
				reject(new Error(event.data.error));
				return;
			}
			resolve(event.data.runs as string[]);
		};
		worker.onerror = error => {
			worker.terminate();
			reject(error);
		};
		worker.postMessage({ expression, count });
	});
}
