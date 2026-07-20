import { describe, expect, it } from "vitest";
import { createProtectedLoader } from "./lockLoadGuard";

describe("createProtectedLoader", () => {
	it("deduplicates in-flight loads and stops after success", async () => {
		let resolveLoad!: () => void;
		let calls = 0;
		const loader = createProtectedLoader();
		const task = () => {
			calls += 1;
			return new Promise<void>(resolve => {
				resolveLoad = resolve;
			});
		};

		const first = loader.run(false, task);
		const duplicate = loader.run(false, task);
		expect(calls).toBe(1);
		resolveLoad();
		await Promise.all([first, duplicate]);
		await loader.run(false, task);
		expect(calls).toBe(1);
	});

	it("defers while locked and retries after a failed attempt", async () => {
		let calls = 0;
		const loader = createProtectedLoader();
		const task = async () => {
			calls += 1;
			if (calls === 1) throw new Error("failed");
		};

		await loader.run(true, task);
		expect(calls).toBe(0);
		await expect(loader.run(false, task)).resolves.toBeUndefined();
		await expect(loader.run(false, task)).resolves.toBeUndefined();
		expect(calls).toBe(2);
	});

	it("retries when a load completes without usable data", async () => {
		let calls = 0;
		const loader = createProtectedLoader();
		const task = async () => {
			calls += 1;
			return calls > 1;
		};

		await loader.run(false, task);
		await loader.run(false, task);

		expect(calls).toBe(2);
	});
});
