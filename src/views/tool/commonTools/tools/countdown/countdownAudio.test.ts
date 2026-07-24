import { describe, expect, it, vi } from "vitest";
import { createCountdownAudio } from "./countdownAudio";

describe("countdown audio", () => {
	it("resumes the audio context before playing and reuses it", async () => {
		const oscillator = {
			connect: vi.fn(),
			frequency: { value: 0 },
			start: vi.fn(),
			stop: vi.fn()
		};
		const context = {
			close: vi.fn(async () => undefined),
			createGain: vi.fn(() => ({ connect: vi.fn(), gain: { value: 0 } })),
			createOscillator: vi.fn(() => oscillator),
			currentTime: 0,
			destination: {},
			resume: vi.fn(async () => undefined),
			state: "suspended"
		};
		const AudioContextClass = vi.fn(() => context);
		const audio = createCountdownAudio(AudioContextClass as unknown as typeof AudioContext);

		await audio.activate();
		await audio.playBeep();

		expect(AudioContextClass).toHaveBeenCalledTimes(1);
		expect(context.resume).toHaveBeenCalledTimes(2);
		expect(oscillator.start).toHaveBeenCalledTimes(1);
		expect(oscillator.stop).toHaveBeenCalledTimes(1);
	});
});
