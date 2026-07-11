import dayjs, { Dayjs } from "dayjs";

const FIELD_RANGES: Array<[number, number]> = [
	[0, 59],
	[0, 59],
	[0, 23],
	[1, 31],
	[1, 12],
	[1, 7]
];

interface ParsedField {
	values: Set<number>;
	question: boolean;
}

export interface CronValidationResult {
	valid: boolean;
	error?: string;
}

function parseField(value: string, min: number, max: number, allowQuestion: boolean): ParsedField {
	const question = value === "?";
	if (question && allowQuestion) return { values: new Set(), question: true };
	if (!value || (question && !allowQuestion)) throw new Error("字段值无效");

	const values = new Set<number>();
	for (const segment of value.split(",")) {
		const [base, stepText] = segment.split("/");
		const step = stepText ? Number(stepText) : 1;
		if (!Number.isInteger(step) || step < 1) throw new Error("步长必须是正整数");

		let start = min;
		let end = max;
		if (base !== "*") {
			if (base.includes("-")) {
				const parts = base.split("-").map(Number);
				if (parts.length !== 2 || !Number.isInteger(parts[0]) || !Number.isInteger(parts[1])) throw new Error("范围格式无效");
				[start, end] = parts;
			} else {
				start = Number(base);
				end = stepText ? max : start;
			}
		}

		if (start < min || end > max || start > end) throw new Error(`字段范围应为 ${min}-${max}`);
		for (let current = start; current <= end; current += step) values.add(current);
	}
	return { values, question: false };
}

function parseCron(expression: string): ParsedField[] {
	const fields = expression.trim().split(/\s+/);
	if (fields.length !== 6) throw new Error("Quartz Cron 必须包含 6 个字段");
	return fields.map((field, index) =>
		parseField(field, FIELD_RANGES[index][0], FIELD_RANGES[index][1], index === 3 || index === 5)
	);
}

export function validateQuartzCron(expression: string): CronValidationResult {
	try {
		const fields = parseCron(expression);
		if (fields[3].question === fields[5].question) return { valid: false, error: "日期和星期字段必须有且只有一个使用 ?" };
		return { valid: true };
	} catch (error) {
		return { valid: false, error: error instanceof Error ? error.message : "Cron 表达式无效" };
	}
}

function matches(field: ParsedField, value: number): boolean {
	return field.question || field.values.has(value);
}

export function getNextCronRuns(expression: string, from: Dayjs = dayjs(), count = 5): Dayjs[] {
	const fields = parseCron(expression);
	if (fields[3].question === fields[5].question) throw new Error("日期和星期字段必须有且只有一个使用 ?");

	const result: Dayjs[] = [];
	let cursor = from.add(1, "second").startOf("second");
	const limit = from.add(366, "day");
	while (cursor.isBefore(limit) && result.length < count) {
		const dayOfWeek = cursor.day() === 0 ? 7 : cursor.day();
		const dateMatches = matches(fields[3], cursor.date());
		const weekMatches = matches(fields[5], dayOfWeek);
		const dayMatches = fields[3].question ? weekMatches : fields[5].question ? dateMatches : dateMatches || weekMatches;
		if (
			matches(fields[0], cursor.second()) &&
			matches(fields[1], cursor.minute()) &&
			matches(fields[2], cursor.hour()) &&
			matches(fields[4], cursor.month() + 1) &&
			dayMatches
		) {
			result.push(cursor);
		}
		cursor = cursor.add(1, "second");
	}
	return result;
}
