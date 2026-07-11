export const shouldLoadAfterUnlock = (locked: boolean, loaded: boolean) => !locked && !loaded;

export const createProtectedLoader = () => {
	let status: "idle" | "loading" | "loaded" = "idle";
	let pending: Promise<void> | null = null;

	return {
		run(locked: boolean, task: () => Promise<void>) {
			if (locked || status === "loaded") return Promise.resolve();
			if (pending) return pending;

			status = "loading";
			pending = task()
				.then(() => {
					status = "loaded";
				})
				.catch(() => {
					status = "idle";
				})
				.finally(() => {
					pending = null;
				});
			return pending;
		}
	};
};
