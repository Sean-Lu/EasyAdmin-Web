const LOCK_ALLOWED_REQUESTS = new Set([
	"/auth/verifyPassword",
	"/auth/logout",
	"/auth/refreshToken",
	"/api/auth/verifyPassword",
	"/api/auth/logout",
	"/api/auth/refreshToken"
]);

class LockedRequestError extends Error {
	readonly code = "APP_LOCKED";

	constructor() {
		super("应用已锁定");
		this.name = "LockedRequestError";
	}
}

const isLockAllowedRequest = (url?: string, allowLockedAvatarPreload = false) =>
	Boolean(url && (LOCK_ALLOWED_REQUESTS.has(url) || (allowLockedAvatarPreload && url === "/file/downloadfile")));

export const assertRequestAllowedWhenLocked = (locked: boolean, url?: string, allowLockedAvatarPreload = false) => {
	if (locked && !isLockAllowedRequest(url, allowLockedAvatarPreload)) throw new LockedRequestError();
};

export const shouldSkipGlobalRequestErrorHandling = (error: unknown) => error instanceof LockedRequestError;
