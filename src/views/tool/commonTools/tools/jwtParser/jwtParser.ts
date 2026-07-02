export type JwtObject = Record<string, unknown>;
export type JwtTimeClaimName = "exp" | "iat" | "nbf";

export interface JwtTimeClaim {
	name: JwtTimeClaimName;
	value: number;
	date: Date;
}

export interface ParsedJwt {
	header: JwtObject;
	payload: JwtObject;
	headerJson: string;
	payloadJson: string;
	signature: string;
	timeClaims: JwtTimeClaim[];
}

const decodeBase64Url = (segment: string, partName: "Header" | "Payload"): string => {
	if (!/^[A-Za-z0-9_-]+$/.test(segment) || segment.length % 4 === 1) {
		throw new Error(`${partName} 不是合法的 Base64URL`);
	}

	const base64 = segment
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(segment.length / 4) * 4, "=");
	let binary: string;

	try {
		binary = atob(base64);
	} catch {
		throw new Error(`${partName} 不是合法的 Base64URL`);
	}

	const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		throw new Error(`${partName} 不是合法的 UTF-8 文本`);
	}
};

const parseObjectSegment = (segment: string, partName: "Header" | "Payload"): JwtObject => {
	const json = decodeBase64Url(segment, partName);
	let value: unknown;

	try {
		value = JSON.parse(json);
	} catch {
		throw new Error(`${partName} 不是合法的 JSON`);
	}

	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${partName} 的 JSON 顶层必须是对象`);
	}

	return value as JwtObject;
};

const extractTimeClaims = (payload: JwtObject): JwtTimeClaim[] => {
	const names: JwtTimeClaimName[] = ["exp", "iat", "nbf"];
	return names.flatMap(name => {
		const value = payload[name];
		if (typeof value !== "number" || !Number.isFinite(value)) return [];

		const date = new Date(value * 1000);
		return Number.isNaN(date.getTime()) ? [] : [{ name, value, date }];
	});
};

export const parseJwt = (token: string): ParsedJwt => {
	const parts = token.trim().split(".");
	if (parts.length !== 3) {
		throw new Error("JWT 必须包含 Header、Payload 和 Signature 三个部分");
	}
	if (parts.some(part => part.length === 0)) {
		throw new Error("JWT 的三个部分均不能为空");
	}

	const [headerSegment, payloadSegment, signature] = parts;
	const header = parseObjectSegment(headerSegment, "Header");
	const payload = parseObjectSegment(payloadSegment, "Payload");

	return {
		header,
		payload,
		headerJson: JSON.stringify(header, null, 2),
		payloadJson: JSON.stringify(payload, null, 2),
		signature,
		timeClaims: extractTimeClaims(payload)
	};
};
