export const LOGIN_REDIRECT_KEY = "redirectUrl";

const EXPLICIT_LOGOUT_KEY = "easyadmin:explicit-logout";

export const beginExplicitLogout = (): void => {
	localStorage.removeItem(LOGIN_REDIRECT_KEY);
	sessionStorage.setItem(EXPLICIT_LOGOUT_KEY, "1");
};

export const finishExplicitLogout = (): void => {
	sessionStorage.removeItem(EXPLICIT_LOGOUT_KEY);
};

export const captureLoginRedirect = (pathname: string): void => {
	if (sessionStorage.getItem(EXPLICIT_LOGOUT_KEY)) {
		localStorage.removeItem(LOGIN_REDIRECT_KEY);
		return;
	}

	localStorage.setItem(LOGIN_REDIRECT_KEY, pathname);
};

export const consumeAuthorizedLoginRedirect = (authorizedPaths: string[], fallback: string, forbidden: string): string => {
	const redirectUrl = localStorage.getItem(LOGIN_REDIRECT_KEY);
	localStorage.removeItem(LOGIN_REDIRECT_KEY);

	if (!redirectUrl || redirectUrl === "/login") return fallback;
	return authorizedPaths.includes(redirectUrl) ? redirectUrl : forbidden;
};
