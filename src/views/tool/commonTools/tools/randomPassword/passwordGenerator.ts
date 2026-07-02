export interface PasswordOptions {
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	digits: boolean;
	symbols: boolean;
}

export type CharacterType = Exclude<keyof PasswordOptions, "length">;
export type RandomInteger = (maxExclusive: number) => number;

export const CHARACTER_SETS: ReadonlyArray<readonly [CharacterType, string]> = [
	["uppercase", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
	["lowercase", "abcdefghijklmnopqrstuvwxyz"],
	["digits", "0123456789"],
	["symbols", "!@#$%^&*()_+-=[]{}|;:,.<>?"]
];

export const validatePasswordOptions = (options: PasswordOptions): string | null => {
	if (!Number.isInteger(options.length)) return "密码长度必须是整数";
	if (options.length < 4 || options.length > 128) return "密码长度应在 4 到 128 位之间";

	const selectedSets = CHARACTER_SETS.filter(([type]) => options[type]);
	if (selectedSets.length === 0) return "至少选择一种字符类型";
	if (options.length < selectedSets.length) return "密码长度不能小于已选字符类型数量";

	return null;
};

const secureRandomInteger: RandomInteger = maxExclusive => {
	if (!globalThis.crypto?.getRandomValues) throw new Error("当前环境不支持安全随机数生成");

	const range = 0x100000000;
	const limit = Math.floor(range / maxExclusive) * maxExclusive;
	const values = new Uint32Array(1);
	let value: number;

	do {
		globalThis.crypto.getRandomValues(values);
		value = values[0];
	} while (value >= limit);

	return value % maxExclusive;
};

const pickCharacter = (characters: string, randomInteger: RandomInteger) => characters[randomInteger(characters.length)];

export const generatePassword = (options: PasswordOptions, randomInteger: RandomInteger = secureRandomInteger): string => {
	const validationMessage = validatePasswordOptions(options);
	if (validationMessage) throw new Error(validationMessage);

	const selectedSets = CHARACTER_SETS.filter(([type]) => options[type]).map(([, characters]) => characters);
	const allCharacters = selectedSets.join("");
	const password = selectedSets.map(characters => pickCharacter(characters, randomInteger));

	while (password.length < options.length) {
		password.push(pickCharacter(allCharacters, randomInteger));
	}

	for (let index = password.length - 1; index > 0; index--) {
		const targetIndex = randomInteger(index + 1);
		[password[index], password[targetIndex]] = [password[targetIndex], password[index]];
	}

	return password.join("");
};
