import { beforeEach, describe, expect, it } from "vitest";
import { loadFlipClockSettings, saveFlipClockSettings } from "./flipClockSettings";

describe("flip clock settings", () => {
	const data = new Map<string, string>();
	const storage = {
		clear: () => data.clear(),
		getItem: (key: string) => data.get(key) ?? null,
		removeItem: (key: string) => data.delete(key),
		setItem: (key: string, value: string) => data.set(key, value),
		key: (index: number) => Array.from(data.keys())[index] ?? null,
		length: 0
	} as unknown as Storage;

	beforeEach(() => storage.clear());

	it("returns defaults for empty storage", () => {
		expect(loadFlipClockSettings(storage)).toEqual({
			backgroundColor: "#101828",
			backgroundImage: "",
			showSeconds: true,
			showDate: false,
			showWeekday: false
		});
	});

	it("round-trips valid settings", () => {
		const settings = {
			backgroundColor: "#0f766e",
			backgroundImage: "data:image/png;base64,abc",
			showSeconds: false,
			showDate: true,
			showWeekday: true
		};
		saveFlipClockSettings(storage, settings);
		expect(loadFlipClockSettings(storage)).toEqual(settings);
	});

	it("ignores malformed settings", () => {
		storage.setItem("easyadmin.flip-clock.settings", "not-json");
		expect(loadFlipClockSettings(storage).showSeconds).toBe(true);
	});

	it("ignores malformed background images", () => {
		storage.setItem("easyadmin.flip-clock.settings", JSON.stringify({ backgroundImage: "not-an-image" }));
		expect(loadFlipClockSettings(storage).backgroundImage).toBe("");
	});

	it("falls back when date display settings are missing", () => {
		storage.setItem("easyadmin.flip-clock.settings", JSON.stringify({ showDate: "yes", showWeekday: 1 }));
		const settings = loadFlipClockSettings(storage);
		expect(settings.showDate).toBe(false);
		expect(settings.showWeekday).toBe(false);
	});
});
