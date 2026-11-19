export interface Judgement {
	/** 位置正确的数字个数（A） */
	a: number;
	/** 数字正确但位置不对的个数（B） */
	b: number;
}

/** 生成一串互不重复的随机数字作为密码 */
export function createSecret(length: number): string {
	if (!Number.isInteger(length) || length < 3 || length > 5) throw new RangeError("密码位数需在 3 到 5 之间");
	const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	for (let index = digits.length - 1; index > 0; index--) {
		const target = Math.floor(Math.random() * (index + 1));
		[digits[index], digits[target]] = [digits[target], digits[index]];
	}
	return digits.slice(0, length).join("");
}

/** 校验玩家输入，返回错误提示；合法时返回 null */
export function validateGuess(guess: string, length: number): string | null {
	if (guess.length !== length) return `请输入 ${length} 位数字`;
	if (!/^\d+$/.test(guess)) return "只能包含数字";
	if (new Set(guess).size !== length) return "数字不能重复";
	return null;
}

/** 与秘密数字比较，统计 1A2B 反馈；重复数字按出现次数取小，避免重复计数 */
export function judgeGuess(secret: string, guess: string): Judgement {
	let a = 0;
	for (let index = 0; index < secret.length; index++) {
		if (guess[index] === secret[index]) a++;
	}
	let common = 0;
	for (const digit of new Set(guess)) {
		const inSecret = [...secret].filter(item => item === digit).length;
		const inGuess = [...guess].filter(item => item === digit).length;
		common += Math.min(inSecret, inGuess);
	}
	return { a, b: common - a };
}
