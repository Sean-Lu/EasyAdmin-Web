import { describe, expect, it, vi } from "vitest";
import { createIdleLockMonitor } from "./useIdleLock";

class Events {
	listeners = new Map<string, Set<() => void>>();
	addEventListener(type: string, listener: () => void) {
		const listeners = this.listeners.get(type) ?? new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
	}
	removeEventListener(type: string, listener: () => void) {
		this.listeners.get(type)?.delete(listener);
	}
	emit(type: string) {
		this.listeners.get(type)?.forEach(listener => listener());
	}
}

describe("idle lock monitor", () => {
	it("records visible user activity at most once per second", () => {
		let now = 1000;
		const events = new Events();
		const record = vi.fn();
		const stop = createIdleLockMonitor({
			events,
			isVisible: () => true,
			now: () => now,
			setInterval: vi.fn(() => 1),
			clearInterval: vi.fn(),
			enabled: true,
			locked: false,
			lastActiveAt: 0,
			idleTimeoutMs: 5000,
			onActivity: record,
			onIdle: vi.fn()
		});

		events.emit("pointermove");
		now = 1500;
		events.emit("keydown");
		now = 2000;
		events.emit("touchstart");
		expect(record.mock.calls).toEqual([[1000], [2000]]);
		stop();
	});

	it("locks immediately when a visible page returns from an overdue state", () => {
		const events = new Events();
		const idle = vi.fn();
		createIdleLockMonitor({
			events,
			isVisible: () => true,
			now: () => 7000,
			setInterval: vi.fn(() => 1),
			clearInterval: vi.fn(),
			enabled: true,
			locked: false,
			lastActiveAt: 2000,
			idleTimeoutMs: 5000,
			onActivity: vi.fn(),
			onIdle: idle
		});

		events.emit("focus");
		events.emit("pageshow");

		expect(idle).toHaveBeenCalledOnce();
	});

	it("does not treat hidden-page input as activity or lock while hidden", () => {
		let visible = false;
		let tick: () => void = () => undefined;
		const events = new Events();
		const idle = vi.fn();
		const activity = vi.fn();
		createIdleLockMonitor({
			events,
			isVisible: () => visible,
			now: () => 7000,
			setInterval: callback => ((tick = callback), 1),
			clearInterval: vi.fn(),
			enabled: true,
			locked: false,
			lastActiveAt: 2000,
			idleTimeoutMs: 5000,
			onActivity: activity,
			onIdle: idle
		});

		events.emit("pointerdown");
		tick();
		expect(activity).not.toHaveBeenCalled();
		expect(idle).not.toHaveBeenCalled();
		visible = true;
		events.emit("visibilitychange");
		expect(idle).toHaveBeenCalledWith(7000);
	});

	it("installs nothing unless enabled and unlocked", () => {
		const events = new Events();
		const setInterval = vi.fn(() => 1);
		const stop = createIdleLockMonitor({
			events,
			isVisible: () => true,
			now: () => 1,
			setInterval,
			clearInterval: vi.fn(),
			enabled: false,
			locked: false,
			lastActiveAt: 0,
			idleTimeoutMs: 5000,
			onActivity: vi.fn(),
			onIdle: vi.fn()
		});
		expect(events.listeners.size).toBe(0);
		expect(setInterval).not.toHaveBeenCalled();
		stop();
	});
});
