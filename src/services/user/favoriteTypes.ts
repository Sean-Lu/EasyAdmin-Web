import { BackendIdInput, PageReqBase } from "@/api/interface";

export enum FavoriteTargetType {
	Menu = 0,
	File = 1,
	Note = 2,
	Tool = 3
}

export enum FavoriteSourceType {
	Direct = 0,
	Share = 1
}

export enum FavoriteAvailabilityStatus {
	Normal = 0,
	ShareDisabled = 1,
	ShareExpired = 2,
	ShareTargetDeleted = 3
}

export interface FavoriteTargetReqDto {
	targetType: FavoriteTargetType;
	targetId: BackendIdInput;
}

export interface FavoriteStatusItemDto extends FavoriteTargetReqDto {
	sourceType: FavoriteSourceType;
	shareCode?: string;
	isFavorite: boolean;
	favoriteId?: BackendIdInput;
}

export interface FavoriteMutationResultDto {
	isFavorite: boolean;
	favoriteId?: BackendIdInput;
}

export interface FavoritePageReqDto extends PageReqBase {
	targetType: FavoriteTargetType;
	keyword?: string;
	status?: FavoriteAvailabilityStatus;
}

export interface FavoriteListItemDto {
	id: BackendIdInput;
	targetType: FavoriteTargetType;
	sourceType: FavoriteSourceType;
	directTargetId?: BackendIdInput;
	title: string;
	ownerName?: string;
	icon?: string;
	contentType?: string;
	path?: string;
	outLink?: string;
	outLinkOpenType?: number;
	shareCode?: string;
	status: FavoriteAvailabilityStatus;
	isAvailable: boolean;
	createTime?: string;
}
