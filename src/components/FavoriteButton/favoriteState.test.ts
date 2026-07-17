import { describe, expect, it } from "vitest";
import { FavoriteSourceType, FavoriteTargetType } from "@/services/user/favoriteTypes";
import { toFavoriteIdMap } from "./favoriteState";

describe("favorite state mapping", () => {
	it("maps only active direct favorites by target id", () => {
		expect(
			toFavoriteIdMap([
				{
					targetType: FavoriteTargetType.File,
					sourceType: FavoriteSourceType.Direct,
					targetId: "12",
					isFavorite: true,
					favoriteId: "90"
				},
				{
					targetType: FavoriteTargetType.File,
					sourceType: FavoriteSourceType.Direct,
					targetId: "13",
					isFavorite: false
				}
			])
		).toEqual({ "12": "90" });
	});
});
