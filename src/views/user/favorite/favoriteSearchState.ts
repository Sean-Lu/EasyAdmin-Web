import { FavoriteAvailabilityStatus } from "@/services/user/favoriteTypes";

export interface FavoriteSearchValues {
	keyword?: string;
	status?: FavoriteAvailabilityStatus;
}

export interface FavoriteSearchState extends FavoriteSearchValues {
	refreshVersion: number;
}

export const initialFavoriteSearchState: FavoriteSearchState = { refreshVersion: 0 };

export const applyFavoriteSearch = (current: FavoriteSearchState, values: FavoriteSearchValues): FavoriteSearchState => ({
	keyword: values.keyword?.trim() || undefined,
	status: values.status,
	refreshVersion: current.refreshVersion + 1
});

export const resetFavoriteSearch = (current: FavoriteSearchState): FavoriteSearchState => ({
	refreshVersion: current.refreshVersion + 1
});
