import { MenuType, OutLinkOpenType } from "@/enums/menu";

export type MenuAction = { type: "none" } | { type: "navigate"; url: string } | { type: "external"; url: string };

export const findMenuById = (menus: Menu.MenuOptions[], id: string): Menu.MenuOptions | undefined => {
	for (const menu of menus) {
		if (menu.id === id) return menu;
		const child = menu.children && findMenuById(menu.children, id);
		if (child) return child;
	}
	return undefined;
};

export const findMenuByPath = (menus: Menu.MenuOptions[], path: string): Menu.MenuOptions | undefined => {
	for (const menu of menus) {
		if (menu.path === path) return menu;
		const child = menu.children && findMenuByPath(menu.children, path);
		if (child) return child;
	}
	return undefined;
};

export const getSelectedMenuId = (menus: Menu.MenuOptions[], path: string): string | undefined => {
	return findMenuByPath(menus, path)?.id;
};

export const getAncestorMenuIds = (menus: Menu.MenuOptions[], id: string): string[] => {
	for (const menu of menus) {
		if (menu.id === id) return [];
		if (menu.children) {
			const childAncestors = getAncestorMenuIds(menu.children, id);
			if (childAncestors.length > 0 || menu.children.some(child => child.id === id)) {
				return menu.id ? [menu.id, ...childAncestors] : childAncestors;
			}
		}
	}
	return [];
};

export const mergeOpenMenuIds = (openMenuIds: string[], ancestorMenuIds: string[]): string[] => {
	return [...new Set([...openMenuIds, ...ancestorMenuIds])];
};

export const getMenuAction = (menu: Menu.MenuOptions): MenuAction => {
	if (menu.type === MenuType.Directory) return { type: "none" };
	if (menu.type === MenuType.External && menu.outLinkOpenType === OutLinkOpenType.Blank && menu.outLink) {
		return { type: "external", url: menu.outLink };
	}
	return menu.path ? { type: "navigate", url: menu.path } : { type: "none" };
};
