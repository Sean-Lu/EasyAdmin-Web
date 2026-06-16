export const toSafeIdParam = (id?: string | number | null) => {
	if (id === undefined || id === null) return "";
	const value = String(id).trim();
	return value === "0" ? "" : value;
};

export const hasSafeIdParam = (id?: string | number | null) => toSafeIdParam(id) !== "";
