import { hydrateLock } from "@/redux/modules/lock/action";
import { LockRuntime } from "@/redux/interface";
import { parseLockRuntimeEnvelope } from "@/utils/lockStorage";

type HydrateDispatch = (runtime: Parameters<typeof hydrateLock>[0]) => void;
type RuntimeDispatch = (runtime: NonNullable<Parameters<typeof hydrateLock>[0]>) => void;

export const acceptNewerRuntime = (
	raw: string | null,
	userId: string,
	currentVersion: number,
	hydrate: RuntimeDispatch
): boolean => {
	if (!raw) return false;
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return false;
	}
	const envelope = parseLockRuntimeEnvelope(parsed);
	if (!envelope || envelope.userId !== userId || envelope.runtime.version <= currentVersion) return false;
	hydrate(envelope.runtime);
	return true;
};

export const completeLockHydrationAfterUserInfoFailure = (
	hydrate: HydrateDispatch,
	recordActivity: (at: number) => void,
	at: number
): void => {
	hydrate(null);
	recordActivity(at);
};

export const clearRuntimeForEmptyToken = (token: string, clear: () => void, reset: () => void): void => {
	if (!token) {
		clear();
		reset();
	}
};

export const isLockHydratedForToken = (token: string, hydratedToken: string): boolean => !token || token === hydratedToken;

export const shouldShowLockScreen = (token: string, locked: boolean): boolean => Boolean(token && locked);

export const shouldAcceptProfileUpdate = (currentUserId: string, updatedUserId: string): boolean =>
	!currentUserId || currentUserId === updatedUserId;

export const loadLockAvatar = async (
	avatarFileId: Parameters<typeof import("@/api/modules/login").getAvatarObjectUrl>[0],
	load: (avatarFileId: Parameters<typeof import("@/api/modules/login").getAvatarObjectUrl>[0]) => Promise<string>
): Promise<string> => {
	try {
		return await load(avatarFileId);
	} catch {
		return "";
	}
};

export const releaseLockAvatar = (avatarSrc: string, revoke: (avatarSrc: string) => void): void => {
	if (avatarSrc.startsWith("blob:")) revoke(avatarSrc);
};

export const refreshLockAvatar = async (
	active: boolean,
	avatarFileId: Parameters<typeof import("@/api/modules/login").getAvatarObjectUrl>[0],
	load: (avatarFileId: Parameters<typeof import("@/api/modules/login").getAvatarObjectUrl>[0]) => Promise<string>,
	options: { replace: (avatarSrc: string) => void; revoke: (avatarSrc: string) => void }
): Promise<boolean> => {
	const avatarSrc = await loadLockAvatar(avatarFileId, load);
	if (!active) {
		releaseLockAvatar(avatarSrc, options.revoke);
		return false;
	}
	options.replace(avatarSrc);
	return true;
};

export const applyPreloadedLockAvatar = (
	active: boolean,
	avatarSrc: string,
	options: {
		replace: (avatarSrc: string) => void;
		hydrate: (runtime: LockRuntime | null) => void;
		record: (at: number) => void;
		revoke: (avatarSrc: string) => void;
		runtime: LockRuntime | null;
		at: number;
	}
): boolean => {
	if (!active) {
		releaseLockAvatar(avatarSrc, options.revoke);
		return false;
	}
	options.replace(avatarSrc);
	options.hydrate(options.runtime);
	if (!options.runtime) options.record(options.at);
	return true;
};

interface AccessibilityElement {
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

export const setLockedContentAccessibility = (element: AccessibilityElement | null, locked: boolean): void => {
	if (!element) return;
	if (locked) {
		element.setAttribute("inert", "");
		element.setAttribute("aria-hidden", "true");
	} else {
		element.removeAttribute("inert");
		element.removeAttribute("aria-hidden");
	}
};
