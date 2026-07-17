import type { ShareListItemDto, ShareListStatus } from "@/services/share/shareService";

export const getShareStatusLabel = (status: ShareListStatus) => {
	switch (status) {
		case 1:
			return "已停用";
		case 2:
			return "已过期";
		case 3:
			return "内容已删除";
		default:
			return "正常";
	}
};

export const getShareStatusColor = (status: ShareListStatus) => {
	switch (status) {
		case 1:
			return "default";
		case 2:
			return "warning";
		case 3:
			return "error";
		default:
			return "success";
	}
};

export type ShareLinkLocation = Pick<Location, "origin" | "pathname">;

export const buildShareLink = (shareCode: string, location: ShareLinkLocation = window.location) =>
	`${location.origin}${location.pathname}#/share/${shareCode}`;

export const canOpenTarget = (item: ShareListItemDto) => item.targetAvailable;

export const buildShareTargetRoute = ({ targetType, targetId }: Pick<ShareListItemDto, "targetType" | "targetId">) => {
	const encodedTargetId = encodeURIComponent(String(targetId));
	return targetType === 1 ? `/user/note?openNoteId=${encodedTargetId}` : `/system/file?openFileId=${encodedTargetId}`;
};
