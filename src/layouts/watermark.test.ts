import { describe, expect, it } from "vitest";
import { DEFAULT_WATERMARK_MODE, DEFAULT_WATERMARK_TEXT, getWatermarkContent } from "./watermark";

describe("getWatermarkContent", () => {
	it("returns undefined when watermark is disabled", () => {
		expect(getWatermarkContent({ watermark: false }, { nickName: "Admin", userName: "admin" })).toBeUndefined();
	});

	it("uses EasyAdmin for default and blank custom text", () => {
		expect(DEFAULT_WATERMARK_MODE).toBe("custom");
		expect(DEFAULT_WATERMARK_TEXT).toBe("EasyAdmin");
		expect(getWatermarkContent({ watermark: true }, {})).toBe("EasyAdmin");
		expect(getWatermarkContent({ watermark: true, watermarkMode: "custom", watermarkText: "  " }, {})).toBe("EasyAdmin");
	});

	it("trims configured custom text", () => {
		expect(getWatermarkContent({ watermark: true, watermarkMode: "custom", watermarkText: "  Internal  " }, {})).toBe("Internal");
	});

	it("prefers nickname and falls back to username in user mode", () => {
		expect(
			getWatermarkContent(
				{ watermark: true, watermarkMode: "user", watermarkText: "ignored" },
				{ nickName: "  Administrator  ", userName: "admin" }
			)
		).toBe("Administrator");
		expect(
			getWatermarkContent(
				{ watermark: true, watermarkMode: "user", watermarkText: "ignored" },
				{ nickName: "  ", userName: "  admin  " }
			)
		).toBe("admin");
	});

	it("returns undefined in user mode when both names are missing", () => {
		expect(getWatermarkContent({ watermark: true, watermarkMode: "user", watermarkText: "ignored" }, {})).toBeUndefined();
	});
});
