import { describe, expect, it, vi } from "vitest";
import { loadUserAvatar } from "./useUserAvatar";

vi.mock("@/api/modules/login", () => ({ getAvatarObjectUrl: vi.fn() }));

const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
};

describe("loadUserAvatar", () => {
	it("publishes a successfully loaded avatar URL", async () => {
		const result = deferred<string>();
		const setAvatarSrc = vi.fn();
		loadUserAvatar("7", {
			load: () => result.promise,
			setAvatarSrc,
			revoke: vi.fn()
		});

		result.resolve("blob:avatar-7");
		await result.promise;
		await Promise.resolve();

		expect(setAvatarSrc).toHaveBeenCalledWith("blob:avatar-7");
	});

	it("revokes a stale result without publishing it", async () => {
		const result = deferred<string>();
		const setAvatarSrc = vi.fn();
		const revoke = vi.fn();
		const dispose = loadUserAvatar("7", { load: () => result.promise, setAvatarSrc, revoke });

		dispose();
		result.resolve("blob:stale-avatar");
		await result.promise;
		await Promise.resolve();

		expect(revoke).toHaveBeenCalledWith("blob:stale-avatar");
		expect(setAvatarSrc).not.toHaveBeenCalledWith("blob:stale-avatar");
	});

	it("revokes the active Blob URL during cleanup", async () => {
		const result = deferred<string>();
		const revoke = vi.fn();
		const dispose = loadUserAvatar("7", {
			load: () => result.promise,
			setAvatarSrc: vi.fn(),
			revoke
		});
		result.resolve("blob:active-avatar");
		await result.promise;
		await Promise.resolve();

		dispose();

		expect(revoke).toHaveBeenCalledWith("blob:active-avatar");
	});

	it("revokes the active Blob URL only once when cleanup runs twice", async () => {
		const result = deferred<string>();
		const revoke = vi.fn();
		const dispose = loadUserAvatar("7", {
			load: () => result.promise,
			setAvatarSrc: vi.fn(),
			revoke
		});
		result.resolve("blob:active-avatar");
		await result.promise;
		await Promise.resolve();

		dispose();
		dispose();

		expect(revoke).toHaveBeenCalledTimes(1);
	});

	it("clears the published avatar synchronously before loading a changed or removed avatar", () => {
		const result = deferred<string>();
		const setAvatarSrc = vi.fn();

		loadUserAvatar(undefined, {
			load: () => result.promise,
			setAvatarSrc,
			revoke: vi.fn()
		});

		expect(setAvatarSrc).toHaveBeenCalledTimes(1);
		expect(setAvatarSrc).toHaveBeenCalledWith("");
	});

	it("falls back to an empty URL when loading fails", async () => {
		const result = deferred<string>();
		const setAvatarSrc = vi.fn();
		loadUserAvatar("7", {
			load: () => result.promise,
			setAvatarSrc,
			revoke: vi.fn()
		});

		result.reject(new Error("download failed"));
		await result.promise.catch(() => undefined);
		await Promise.resolve();

		expect(setAvatarSrc).toHaveBeenCalledWith("");
	});
});
