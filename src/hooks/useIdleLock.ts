import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["keydown", "pointerdown", "pointermove", "touchstart"] as const;

interface EventSource {
	addEventListener(type: string, listener: () => void): void;
	removeEventListener(type: string, listener: () => void): void;
}

interface IdleLockMonitorOptions {
	events: EventSource;
	isVisible: () => boolean;
	now: () => number;
	setInterval: (callback: () => void, delay: number) => number;
	clearInterval: (timer: number) => void;
	enabled: boolean;
	locked: boolean;
	lastActiveAt: number;
	idleTimeoutMs: number;
	onActivity: (at: number) => void;
	onIdle: (at: number) => void;
}

const createIdleLockMonitor = (options: IdleLockMonitorOptions): (() => void) => {
	if (!options.enabled || options.locked) return () => undefined;

	let lastActivityWriteAt = Number.NEGATIVE_INFINITY;
	const recordVisibleActivity = () => {
		if (!options.isVisible()) return;
		const at = options.now();
		if (at - lastActivityWriteAt < 1000) return;
		lastActivityWriteAt = at;
		options.onActivity(at);
	};
	const checkIdle = () => {
		if (!options.isVisible()) return;
		const at = options.now();
		if (at - options.lastActiveAt >= options.idleTimeoutMs) options.onIdle(at);
	};

	ACTIVITY_EVENTS.forEach(event => options.events.addEventListener(event, recordVisibleActivity));
	options.events.addEventListener("visibilitychange", checkIdle);
	const timer = options.setInterval(checkIdle, 1000);
	return () => {
		ACTIVITY_EVENTS.forEach(event => options.events.removeEventListener(event, recordVisibleActivity));
		options.events.removeEventListener("visibilitychange", checkIdle);
		options.clearInterval(timer);
	};
};

interface UseIdleLockOptions {
	enabled: boolean;
	locked: boolean;
	lastActiveAt: number;
	idleTimeoutMinutes: number;
	onActivity: (at: number) => void;
	onIdle: (at: number) => void;
}

export const useIdleLock = (options: UseIdleLockOptions): void => {
	const latest = useRef(options);
	latest.current = options;
	useEffect(
		() =>
			createIdleLockMonitor({
				events: document,
				isVisible: () => document.visibilityState === "visible",
				now: Date.now,
				setInterval: (callback, delay) => window.setInterval(callback, delay),
				clearInterval: timer => window.clearInterval(timer),
				enabled: options.enabled,
				locked: options.locked,
				get lastActiveAt() {
					return latest.current.lastActiveAt;
				},
				idleTimeoutMs: options.idleTimeoutMinutes * 60 * 1000,
				onActivity: at => latest.current.onActivity(at),
				onIdle: at => latest.current.onIdle(at)
			}),
		[options.enabled, options.locked, options.idleTimeoutMinutes]
	);
};

export default useIdleLock;
