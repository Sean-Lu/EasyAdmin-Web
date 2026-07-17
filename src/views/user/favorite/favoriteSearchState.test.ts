import { describe, expect, it } from "vitest";
import { FavoriteAvailabilityStatus } from "@/services/user/favoriteTypes";
import { applyFavoriteSearch, initialFavoriteSearchState, resetFavoriteSearch } from "./favoriteSearchState";

describe("favorite search state", () => {
	it("refreshes repeated searches and preserves the displayed status", () => {
		const first = applyFavoriteSearch(initialFavoriteSearchState, {
			keyword: "  文件  ",
			status: FavoriteAvailabilityStatus.ShareExpired
		});
		const repeated = applyFavoriteSearch(first, {
			keyword: "  文件  ",
			status: FavoriteAvailabilityStatus.ShareExpired
		});

		expect(first).toEqual({
			keyword: "文件",
			status: FavoriteAvailabilityStatus.ShareExpired,
			refreshVersion: 1
		});
		expect(repeated.refreshVersion).toBe(2);
	});

	it("refreshes repeated resets", () => {
		const first = resetFavoriteSearch(initialFavoriteSearchState);
		const repeated = resetFavoriteSearch(first);

		expect(first).toEqual({ refreshVersion: 1 });
		expect(repeated).toEqual({ refreshVersion: 2 });
	});
});
