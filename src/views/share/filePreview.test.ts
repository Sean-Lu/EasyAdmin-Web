import { describe, expect, test } from "vitest";
import { isPreviewableImage } from "./filePreview";

describe("shared file preview", () => {
	test("recognizes image MIME types for inline preview", () => {
		expect(isPreviewableImage("image/jpeg")).toBe(true);
		expect(isPreviewableImage("IMAGE/PNG")).toBe(true);
		expect(isPreviewableImage("application/pdf")).toBe(false);
		expect(isPreviewableImage(undefined)).toBe(false);
	});
});
