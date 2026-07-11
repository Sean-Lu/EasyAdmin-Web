import { describe, expect, it } from "vitest";
import { createFreshUserInfoParams } from "./userInfoRequest";

describe("user info request cache control", () => {
	it("adds a unique query value when current user info must be reloaded after profile saving", () => {
		expect(createFreshUserInfoParams(123)).toEqual({ _t: 123 });
	});
});
