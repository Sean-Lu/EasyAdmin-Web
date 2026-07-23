import { describe, expect, it } from "vitest";
import { ParamValueType, parseParamValue, serializeParamValue } from "./paramValueUtils";

describe("parameter value conversion", () => {
	it("converts boolean values between form and API formats", () => {
		expect(parseParamValue("true", ParamValueType.Boolean)).toBe(true);
		expect(serializeParamValue(false, ParamValueType.Boolean)).toBe("false");
	});

	it("converts numeric form values to strings for the API", () => {
		expect(parseParamValue("5", ParamValueType.Number)).toBe(5);
		expect(serializeParamValue(5, ParamValueType.Number)).toBe("5");
	});
});
