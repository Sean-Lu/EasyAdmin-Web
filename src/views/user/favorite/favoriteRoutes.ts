import { OutLinkOpenType } from "@/enums/menu";
import { FavoriteListItemDto, FavoriteSourceType, FavoriteTargetType } from "@/services/user/favoriteTypes";
import { buildShareLink, ShareLinkLocation } from "../share/shareListLogic";

export interface FavoriteOpenTarget {
	url: string;
	external: boolean;
}

export const buildFavoriteOpenTarget = (
	item: FavoriteListItemDto,
	shareLinkLocation?: ShareLinkLocation
): FavoriteOpenTarget | null => {
	if (!item.isAvailable) return null;

	if (item.sourceType === FavoriteSourceType.Share) {
		return item.shareCode ? { url: buildShareLink(item.shareCode, shareLinkLocation), external: true } : null;
	}

	if (item.targetType === FavoriteTargetType.File && item.directTargetId) {
		return { url: `/system/file?openFileId=${encodeURIComponent(String(item.directTargetId))}`, external: false };
	}

	if (item.targetType === FavoriteTargetType.Note && item.directTargetId) {
		return { url: `/user/note?openNoteId=${encodeURIComponent(String(item.directTargetId))}`, external: false };
	}

	if (item.targetType === FavoriteTargetType.Tool) {
		return item.path ? { url: item.path, external: false } : null;
	}

	if (item.targetType === FavoriteTargetType.Menu) {
		if (item.outLink && item.outLinkOpenType === OutLinkOpenType.Blank) {
			return { url: item.outLink, external: true };
		}
		return item.path ? { url: item.path, external: false } : null;
	}

	return null;
};
