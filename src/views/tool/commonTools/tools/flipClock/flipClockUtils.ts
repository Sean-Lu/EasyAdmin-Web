export function getChangedDigitIndexes(previousValue: string | undefined, nextValue: string): number[] {
	const previousDigits = (previousValue ?? "").replace(/:/g, "");
	const nextDigits = nextValue.replace(/:/g, "");
	return Array.from(nextDigits).reduce<number[]>((changedIndexes, digit, index) => {
		if (previousDigits[index] !== digit) changedIndexes.push(index);
		return changedIndexes;
	}, []);
}
