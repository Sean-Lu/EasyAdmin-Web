import dayjs from "dayjs";
import { getNextCronRuns } from "./utils";

self.onmessage = event => {
	try {
		const { expression, count } = event.data as { expression: string; count: number };
		const runs = getNextCronRuns(expression, dayjs(), count).map(run => run.toISOString());
		self.postMessage({ runs });
	} catch (error) {
		self.postMessage({ error: error instanceof Error ? error.message : "Cron 表达式计算失败" });
	}
};

export {};
