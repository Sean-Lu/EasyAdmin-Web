const DEFAULT_APP_NAME = "EasyAdmin";

/** 获取应用名称 */
export const getAppName = (env: Record<string, unknown>): string => {
	const value = String(env.VITE_APP_NAME ?? "")
		.trim()
		.replace(/^(['"])(.*)\1$/, "$2")
		.trim();

	return value || DEFAULT_APP_NAME;
};

export const APP_NAME = getAppName(import.meta.env);
