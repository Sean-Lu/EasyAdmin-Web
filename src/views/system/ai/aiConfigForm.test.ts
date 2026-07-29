import { describe, expect, it } from "vitest";
import { toAiConfigRequest } from "./aiConfigForm";

const valid = {
	baseUrl: "https://api.example.com/v1",
	model: "model",
	timeoutSeconds: 30,
	maxOutputTokens: 1024,
	temperature: 0.2
};

describe("toAiConfigRequest", () => {
	it("omits blank and masked keys while preserving numeric temperature", () => {
		expect(toAiConfigRequest({ ...valid, apiKey: "" })).not.toHaveProperty("apiKey");
		expect(toAiConfigRequest({ ...valid, apiKey: "sk-****test", maskedApiKey: "sk-****test" })).not.toHaveProperty("apiKey");
		expect(toAiConfigRequest({ ...valid, temperature: Number("0.7") }).temperature).toBe(0.7);
	});

	it("rejects invalid ranges", () => {
		expect(() => toAiConfigRequest({ ...valid, timeoutSeconds: 1 })).toThrow();
		expect(() => toAiConfigRequest({ ...valid, maxOutputTokens: 0 })).toThrow();
		expect(() => toAiConfigRequest({ ...valid, maxOutputTokens: 127 })).toThrow();
		expect(() => toAiConfigRequest({ ...valid, temperature: 3 })).toThrow();
	});
});
