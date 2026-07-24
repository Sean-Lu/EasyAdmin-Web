interface AudioContextLike {
	close: () => Promise<void>;
	createGain: () => GainNode;
	createOscillator: () => OscillatorNode;
	currentTime: number;
	destination: AudioDestinationNode;
	resume: () => Promise<void>;
	state: AudioContextState;
}

type AudioContextConstructor = new () => AudioContextLike;

export interface CountdownAudio {
	activate: () => Promise<void>;
	close: () => Promise<void>;
	playBeep: () => Promise<void>;
}

const getAudioContextConstructor = (): AudioContextConstructor | undefined =>
	(window.AudioContext ?? (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext) as
		| AudioContextConstructor
		| undefined;

export function createCountdownAudio(
	AudioContextClass: AudioContextConstructor | undefined = getAudioContextConstructor()
): CountdownAudio {
	let context: AudioContextLike | null = null;

	const getContext = () => {
		if (!context && AudioContextClass) context = new AudioContextClass();
		return context;
	};

	const activate = async () => {
		const activeContext = getContext();
		if (activeContext?.state === "suspended") await activeContext.resume();
	};

	const playBeep = async () => {
		const activeContext = getContext();
		if (!activeContext) return;
		await activate();
		const oscillator = activeContext.createOscillator();
		const gain = activeContext.createGain();
		oscillator.frequency.value = 880;
		gain.gain.value = 0.08;
		oscillator.connect(gain);
		gain.connect(activeContext.destination);
		oscillator.start();
		oscillator.stop(activeContext.currentTime + 0.35);
	};

	const close = async () => {
		if (!context) return;
		await context.close();
		context = null;
	};

	return { activate, close, playBeep };
}
