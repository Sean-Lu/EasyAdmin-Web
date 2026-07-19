import { IdleTimeoutMinutes, LockPreference, LockRuntime } from "@/redux/interface";

export const LOCK_RUNTIME_KEY = "easyadmin:lock:runtime";
const lockPreferenceKey = (userId: string) => `easyadmin:lock:preference:${userId}`;
export const ALLOWED_IDLE_TIMEOUTS = [5, 10, 15, 30, 60] as const;
const DEFAULT_LOCK_PREFERENCE: LockPreference = { autoLockEnabled: false, idleTimeoutMinutes: 15 };

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const parseJson = (value: string | null): unknown => {
	if (value === null) return null;
	try {
		return JSON.parse(value) as unknown;
	} catch {
		return null;
	}
};

const isIdleTimeout = (value: unknown): value is IdleTimeoutMinutes =>
	typeof value === "number" && (ALLOWED_IDLE_TIMEOUTS as readonly number[]).includes(value);

const parseLockPreference = (value: unknown): LockPreference => {
	if (!isRecord(value) || typeof value.autoLockEnabled !== "boolean" || !isIdleTimeout(value.idleTimeoutMinutes)) {
		return { ...DEFAULT_LOCK_PREFERENCE };
	}
	return { autoLockEnabled: value.autoLockEnabled, idleTimeoutMinutes: value.idleTimeoutMinutes };
};

export const readLockPreference = (userId: string): LockPreference =>
	parseLockPreference(parseJson(localStorage.getItem(lockPreferenceKey(userId))));

export const writeLockPreference = (userId: string, preference: LockPreference): void => {
	localStorage.setItem(lockPreferenceKey(userId), JSON.stringify(parseLockPreference(preference)));
};

const parseLockRuntime = (value: unknown): LockRuntime | null => {
	if (
		!isRecord(value) ||
		typeof value.locked !== "boolean" ||
		(value.lockedAt !== null && (typeof value.lockedAt !== "number" || !Number.isFinite(value.lockedAt))) ||
		typeof value.lastActiveAt !== "number" ||
		!Number.isFinite(value.lastActiveAt) ||
		typeof value.version !== "number" ||
		!Number.isFinite(value.version)
	) {
		return null;
	}
	return {
		locked: value.locked,
		lockedAt: value.lockedAt,
		lastActiveAt: value.lastActiveAt,
		version: value.version
	};
};

interface LockRuntimeEnvelope {
	userId: string;
	runtime: LockRuntime;
}

export const parseLockRuntimeEnvelope = (value: unknown): LockRuntimeEnvelope | null => {
	if (!isRecord(value) || typeof value.userId !== "string") return null;
	const runtime = parseLockRuntime(value.runtime);
	return runtime ? { userId: value.userId, runtime } : null;
};

export const readLockRuntime = (userId: string): LockRuntime | null => {
	const envelope = parseLockRuntimeEnvelope(parseJson(localStorage.getItem(LOCK_RUNTIME_KEY)));
	if (!envelope || envelope.userId !== userId) {
		clearLockRuntime();
		return null;
	}
	return envelope.runtime;
};

export const writeLockRuntime = (userId: string, runtime: LockRuntime): void => {
	const validated = parseLockRuntime(runtime);
	if (validated) localStorage.setItem(LOCK_RUNTIME_KEY, JSON.stringify({ userId, runtime: validated }));
};

export const clearLockRuntime = (): void => localStorage.removeItem(LOCK_RUNTIME_KEY);
