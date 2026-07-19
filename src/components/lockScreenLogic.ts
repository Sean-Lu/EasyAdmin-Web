interface BusinessUnlockError {
	type: "business-error";
	message: string;
}
type UnlockAttemptResult = "empty" | "success" | "rejected" | "network-error" | BusinessUnlockError;
export type UnlockError = "rejected" | "network-error" | BusinessUnlockError;

const businessError = (error: unknown): BusinessUnlockError | null => {
	if (typeof error !== "object" || error === null) return null;
	const message = (error as { msg?: unknown }).msg;
	return typeof message === "string" && message.trim() ? { type: "business-error", message } : null;
};

const attemptUnlock = async (
	password: string,
	verify: (passwordHash: string) => Promise<boolean>
): Promise<UnlockAttemptResult> => {
	if (!password.trim()) return "empty";
	try {
		const { default: md5 } = await import("js-md5");
		return (await verify(md5(password))) ? "success" : "rejected";
	} catch (error) {
		return businessError(error) || "network-error";
	}
};

interface UnlockDependencies {
	verify: (passwordHash: string) => Promise<boolean>;
	now: () => number;
	unlock: (at: number) => void;
	resetFields: () => void;
	setError: (error: UnlockError | null) => void;
}

export const runUnlock = async (password: string, dependencies: UnlockDependencies): Promise<UnlockAttemptResult> => {
	dependencies.setError(null);
	const result = await attemptUnlock(password, dependencies.verify);
	if (result === "empty") return result;
	dependencies.resetFields();
	if (result === "success") dependencies.unlock(dependencies.now());
	else dependencies.setError(result as UnlockError);
	return result;
};

export const unlockErrorTranslationKey = (error: UnlockError | null): string | null => {
	if (error && typeof error === "object") return error.message;
	if (error === "rejected") return "lockScreen.wrongPassword";
	if (error === "network-error") return "lockScreen.networkFailure";
	return null;
};

interface SwitchAccountDependencies {
	logout: () => Promise<unknown>;
	clearToken: (token: string) => void;
	clearTabs: (tabs: []) => void;
	resetRuntime: () => void;
	removeStorage: (key: string) => void;
	clearRuntime: () => void;
	navigateLogin: () => void;
	broadcastLogout?: () => void;
}

export const switchAccountCleanup = async (dependencies: SwitchAccountDependencies): Promise<void> => {
	try {
		await dependencies.logout();
	} catch {
		// Local cleanup must continue when the server is unavailable.
	}
	dependencies.clearToken("");
	dependencies.clearTabs([]);
	dependencies.resetRuntime();
	dependencies.removeStorage("Token");
	dependencies.removeStorage("token");
	dependencies.removeStorage("refreshToken");
	dependencies.clearRuntime();
	dependencies.broadcastLogout?.();
	dependencies.navigateLogin();
};
