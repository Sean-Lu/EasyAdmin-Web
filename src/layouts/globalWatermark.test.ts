import { describe, expect, it } from "vitest";
import { GLOBAL_WATERMARK_Z_INDEX, getGlobalWatermarkStyle } from "./GlobalWatermark";

describe("GlobalWatermark", () => {
	it("uses a fixed pointer-transparent layer above antd floating content", () => {
		expect(GLOBAL_WATERMARK_Z_INDEX).toBe(3000);
		expect(getGlobalWatermarkStyle()).toEqual({
			position: "fixed",
			inset: 0,
			zIndex: 3000,
			pointerEvents: "none"
		});
	});
});
