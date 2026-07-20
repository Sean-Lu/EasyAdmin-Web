import { describe, expect, it } from "vitest";
import { FavoriteListItemDto, FavoriteSourceType, FavoriteTargetType } from "@/services/user/favoriteTypes";
import { buildFavoriteOpenTarget } from "./favoriteRoutes";

describe("buildFavoriteOpenTarget", () => {
	it("builds direct and shared favorite targets", () => {
		expect(
			buildFavoriteOpenTarget({
				targetType: FavoriteTargetType.File,
				sourceType: FavoriteSourceType.Direct,
				directTargetId: "12",
				isAvailable: true
			} as FavoriteListItemDto)
		).toEqual({ url: "/system/file?openFileId=12", external: false });
		expect(
			buildFavoriteOpenTarget({
				targetType: FavoriteTargetType.Note,
				sourceType: FavoriteSourceType.Direct,
				directTargetId: "34",
				isAvailable: true
			} as FavoriteListItemDto)
		).toEqual({ url: "/user/note?openNoteId=34", external: false });
		expect(
			buildFavoriteOpenTarget(
				{
					sourceType: FavoriteSourceType.Share,
					shareCode: "abc",
					isAvailable: true
				} as FavoriteListItemDto,
				{ origin: "https://example.test", pathname: "/easyadmin/" }
			)
		).toEqual({ url: "https://example.test/easyadmin/#/share/abc", external: true });
		expect(
			buildFavoriteOpenTarget({ sourceType: FavoriteSourceType.Share, isAvailable: false } as FavoriteListItemDto)
		).toBeNull();
		expect(
			buildFavoriteOpenTarget({
				targetType: FavoriteTargetType.Tool,
				sourceType: FavoriteSourceType.Direct,
				path: "/tool/commonTools?tool=jsonParser",
				isAvailable: true
			} as FavoriteListItemDto)
		).toEqual({ url: "/tool/commonTools?tool=jsonParser", external: false });
	});
});
