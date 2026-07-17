import { BackendIdInput } from "@/api/interface";
import { resolveCategorySearchState } from "@/utils/categorySearchParams";

type TodoCategory = {
	id: BackendIdInput;
};

export const resolveTodoCategorySelection = (searchValue: string | null, categories: TodoCategory[]) => {
	const fallback = categories.length > 0 ? String(categories[0].id) : null;
	const { selectedValue, shouldClear } = resolveCategorySearchState(
		searchValue,
		categories.map(category => category.id),
		{ allowAll: false, fallback }
	);
	const categoryId = selectedValue ? categories.find(category => String(category.id) === selectedValue)?.id ?? null : null;

	return { categoryId, selectedValue, shouldClear };
};
