type ResolveCategoryOptions = {
	allowAll: boolean;
	fallback: string | null;
};

const resolveCategorySearchValue = (
	value: string | null,
	categoryIds: Array<string | number>,
	options: ResolveCategoryOptions
): string | null => {
	if (options.allowAll && value === "all") return "all";
	const validIds = new Set(categoryIds.map(String));
	return value && validIds.has(value) ? value : options.fallback;
};

export const resolveCategorySearchState = (
	value: string | null,
	categoryIds: Array<string | number>,
	options: ResolveCategoryOptions
): { selectedValue: string | null; shouldClear: boolean } => {
	const selectedValue = resolveCategorySearchValue(value, categoryIds, options);
	return {
		selectedValue,
		shouldClear: value !== null && value !== selectedValue
	};
};

export const setCategorySearchValue = (searchParams: URLSearchParams, value: string): URLSearchParams => {
	const nextSearchParams = new URLSearchParams(searchParams);
	nextSearchParams.set("category", value);
	return nextSearchParams;
};

export const deleteCategorySearchValue = (searchParams: URLSearchParams): URLSearchParams => {
	const nextSearchParams = new URLSearchParams(searchParams);
	nextSearchParams.delete("category");
	return nextSearchParams;
};
