export const MenuType = {
	Directory: 0,
	Internal: 1,
	External: 2
} as const;

export const MenuTypeMap: Record<number, string> = {
	[MenuType.Directory]: "目录",
	[MenuType.Internal]: "内部菜单",
	[MenuType.External]: "外链菜单"
};

export const getMenuTypeLabel = (value: number): string => {
	return MenuTypeMap[value] || "未知";
};

export const getMenuTypeOptions = (): { value: number; label: string }[] => {
	return Object.entries(MenuTypeMap).map(([value, label]) => ({
		value: Number(value),
		label
	}));
};

export const OutLinkOpenType = {
	Inline: 0,
	Blank: 1
};

export const OutLinkOpenTypeMap: Record<number, string> = {
	[OutLinkOpenType.Inline]: "内嵌打开(iframe)",
	[OutLinkOpenType.Blank]: "新标签页打开"
};

export const getOutLinkOpenTypeLabel = (value: number): string => {
	return OutLinkOpenTypeMap[value] || "未知";
};

export const getOutLinkOpenTypeOptions = (): { value: number; label: string }[] => {
	return Object.entries(OutLinkOpenTypeMap).map(([value, label]) => ({
		value: Number(value),
		label
	}));
};
