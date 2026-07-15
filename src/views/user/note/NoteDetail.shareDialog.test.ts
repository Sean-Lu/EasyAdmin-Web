import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("NoteDetail sharing dialog", () => {
	test("mounts outside editor-mode conditions", () => {
		const source = readFileSync(resolve(__dirname, "NoteDetail.tsx"), "utf8");
		const dialogPosition = source.indexOf("<ShareDialog");
		const readonlyPreviewPosition = source.indexOf("{readonly && (");

		expect(dialogPosition).toBeGreaterThan(readonlyPreviewPosition);
	});
});
