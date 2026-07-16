export const LOGIN_REDIRECT_KEY = "redirectUrl";

const EXPLICIT_LOGOUT_KEY = "easyadmin:explicit-logout";

const getInternalPathname = (location: string): string | null => {
	if (!location.startsWith("/") || location.startsWith("//")) return null;
	return location.split(/[?#]/, 1)[0] || null;
};

export const beginExplicitLogout = (): void => {
	localStorage.removeItem(LOGIN_REDIRECT_KEY);
	sessionStorage.setItem(EXPLICIT_LOGOUT_KEY, "1");
};

export const finishExplicitLogout = (): void => {
	sessionStorage.removeItem(EXPLICIT_LOGOUT_KEY);
};

export const captureLoginRedirect = (location: string): void => {
	if (sessionStorage.getItem(EXPLICIT_LOGOUT_KEY)) {
		localStorage.removeItem(LOGIN_REDIRECT_KEY);
		return;
	}

	const pathname = getInternalPathname(location);
	if (!pathname || pathname === "/login") return;

	localStorage.setItem(LOGIN_REDIRECT_KEY, location);
};

export const consumeAuthorizedLoginRedirect = (authorizedPaths: string[], fallback: string, forbidden: string): string => {
	const redirectUrl = localStorage.getItem(LOGIN_REDIRECT_KEY);
	localStorage.removeItem(LOGIN_REDIRECT_KEY);

	if (!redirectUrl || redirectUrl === "/login") return fallback;
	const pathname = getInternalPathname(redirectUrl);
	return pathname && authorizedPaths.includes(pathname) ? redirectUrl : forbidden;
};
