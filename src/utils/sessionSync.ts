export const LOGOUT_EVENT_KEY = "easyadmin:session:event";

export interface LogoutEvent {
	type: "logout";
	version: 1;
	at: number;
}

export const createLogoutEvent = (at: number): LogoutEvent => ({ type: "logout", version: 1, at });

const parseLogoutEvent = (raw: string | null): LogoutEvent | null => {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw) as Partial<LogoutEvent>;
		return value.type === "logout" && value.version === 1 && typeof value.at === "number" && Number.isFinite(value.at)
			? (value as LogoutEvent)
			: null;
	} catch {
		return null;
	}
};

export const broadcastLogout = (at = Date.now()): void => {
	localStorage.setItem(LOGOUT_EVENT_KEY, JSON.stringify(createLogoutEvent(at)));
};

export const handleLogoutStorageEvent = (key: string | null, raw: string | null, cleanup: () => void): boolean => {
	if (key !== LOGOUT_EVENT_KEY || !parseLogoutEvent(raw)) return false;
	cleanup();
	return true;
};

interface RemoteLogoutDependencies {
	setToken(token: string): void;
	setTabsList(tabs: []): void;
	resetRuntime(): void;
	clearRuntime(): void;
	removeStorage(key: string): void;
	navigateLogin(): void;
}

export const applyRemoteLogout = (dependencies: RemoteLogoutDependencies): void => {
	dependencies.setToken("");
	dependencies.setTabsList([]);
	dependencies.resetRuntime();
	dependencies.clearRuntime();
	for (const key of ["Token", "token", "refreshToken"]) dependencies.removeStorage(key);
	dependencies.navigateLogin();
};
