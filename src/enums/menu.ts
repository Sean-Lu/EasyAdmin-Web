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
