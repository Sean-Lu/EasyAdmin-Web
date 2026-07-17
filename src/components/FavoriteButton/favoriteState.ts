import { BackendIdInput } from "@/api/interface";
import { FavoriteSourceType, FavoriteStatusItemDto } from "@/services/user/favoriteTypes";

export const toFavoriteIdMap = (items: FavoriteStatusItemDto[]): Record<string, BackendIdInput> =>
	items.reduce<Record<string, BackendIdInput>>((result, item) => {
		if (item.sourceType === FavoriteSourceType.Direct && item.isFavorite && item.favoriteId) {
			result[String(item.targetId)] = item.favoriteId;
		}
		return result;
	}, {});
