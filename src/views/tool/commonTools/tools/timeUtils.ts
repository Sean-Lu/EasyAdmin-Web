const pad = (value: number): string => String(value).padStart(2, "0");

export function formatDuration(totalSeconds: number, showHours = true): string {
	const safeSeconds = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const seconds = safeSeconds % 60;
	return showHours ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function normalizeCountdownInput(hours: number, minutes: number, seconds: number): number {
	const safeHours = Math.max(0, Math.floor(Number.isFinite(hours) ? hours : 0));
	const safeMinutes = Math.max(0, Math.floor(Number.isFinite(minutes) ? minutes : 0));
	const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
	return safeHours * 3600 + safeMinutes * 60 + safeSeconds;
}

export function getCountdownRemaining(initialSeconds: number, elapsedMilliseconds: number): number {
	return Math.max(0, Math.floor(initialSeconds) - Math.floor(Math.max(0, elapsedMilliseconds) / 1000));
}
