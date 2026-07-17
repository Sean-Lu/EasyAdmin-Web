import request from "@/api/index";
import { BackendIdInput, PageRes } from "@/api/interface";
import {
	FavoriteListItemDto,
	FavoriteMutationResultDto,
	FavoritePageReqDto,
	FavoriteStatusItemDto,
	FavoriteTargetReqDto,
	FavoriteTargetType
} from "./favoriteTypes";

export * from "./favoriteTypes";

export class FavoriteService {
	static async page(params: FavoritePageReqDto) {
		return (await request.post<PageRes<FavoriteListItemDto>>("/Favorite/Page", params)).data!;
	}

	static async add(targetType: FavoriteTargetType, targetId: BackendIdInput) {
		return (await request.post<FavoriteMutationResultDto>("/Favorite/Add", { targetType, targetId })).data!;
	}

	static async addShare(shareCode: string, accessToken?: string) {
		return (await request.post<FavoriteMutationResultDto>("/Favorite/AddShare", { shareCode, accessToken })).data!;
	}

	static async remove(id: BackendIdInput) {
		return (await request.post<FavoriteMutationResultDto>("/Favorite/Delete", { id })).data!;
	}

	static async status(targets: FavoriteTargetReqDto[]) {
		return (await request.post<FavoriteStatusItemDto[]>("/Favorite/Status", { targets })).data!;
	}

	static async shareStatus(shareCode: string) {
		return (await request.post<FavoriteStatusItemDto[]>("/Favorite/Status", { shareCode, targets: [] })).data!;
	}
}
