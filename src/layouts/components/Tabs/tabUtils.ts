export const upsertTab = (tabsList: Menu.MenuOptions[], tab: Menu.MenuOptions): Menu.MenuOptions[] => {
	const existingIndex = tabsList.findIndex(item => item.path === tab.path);
	if (existingIndex === -1) return [...tabsList, tab];

	const nextTabsList = [...tabsList];
	const existingTab = nextTabsList[existingIndex];
	nextTabsList[existingIndex] = {
		...existingTab,
		...tab,
		icon: tab.icon ?? existingTab.icon
	};
	return nextTabsList;
};
