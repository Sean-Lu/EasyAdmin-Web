import { describe, expect, it } from "vitest";
import { parseJwt } from "./jwtParser";

const encodeSegment = (value: unknown): string => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const createToken = (header: unknown, payload: unknown, signature = "signature") =>
	`${encodeSegment(header)}.${encodeSegment(payload)}.${signature}`;

describe("parseJwt", () => {
	it("parses and formats an unpadded JWT", () => {
		const result = parseJwt(createToken({ alg: "HS256", typ: "JWT" }, { sub: "123", admin: true }));

		expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
		expect(result.payload).toEqual({ sub: "123", admin: true });
		expect(result.headerJson).toBe(JSON.stringify(result.header, null, 2));
		expect(result.payloadJson).toBe(JSON.stringify(result.payload, null, 2));
		expect(result.signature).toBe("signature");
	});

	it("decodes Unicode JSON as UTF-8", () => {
		const result = parseJwt(createToken({ alg: "none" }, { name: "张三", role: "管理员" }));

		expect(result.payload).toEqual({ name: "张三", role: "管理员" });
	});

	it("extracts numeric time claims", () => {
		const result = parseJwt(createToken({ alg: "none" }, { exp: 1710000000, iat: 1700000000, nbf: "ignored" }));

		expect(result.timeClaims.map(claim => claim.name)).toEqual(["exp", "iat"]);
		expect(result.timeClaims[0].date.toISOString()).toBe("2024-03-09T16:00:00.000Z");
	});

	it.each([
		["abc.def", "JWT 必须包含 Header、Payload 和 Signature 三个部分"],
		["abc..signature", "JWT 的三个部分均不能为空"],
		["***.e30.signature", "Header 不是合法的 Base64URL"],
		["_w.e30.signature", "Header 不是合法的 UTF-8 文本"],
		[`${Buffer.from("not json").toString("base64url")}.e30.signature`, "Header 不是合法的 JSON"],
		[createToken([], {}), "Header 的 JSON 顶层必须是对象"],
		[createToken({}, []), "Payload 的 JSON 顶层必须是对象"]
	])("rejects invalid JWT: %s", (token, expectedMessage) => {
		expect(() => parseJwt(token)).toThrow(expectedMessage);
	});
});
