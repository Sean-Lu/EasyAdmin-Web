import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftOutlined, PauseOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, InputNumber, Space, Typography, message } from "antd";
import { formatDuration, getCountdownRemaining, normalizeCountdownInput } from "../timeUtils";
import "./index.less";

interface CountdownProps {
	onBack: () => void;
}

const playCompletionBeep = () => {
	const AudioContextClass =
		window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!AudioContextClass) return;
	const context = new AudioContextClass();
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	oscillator.frequency.value = 880;
	gain.gain.value = 0.08;
	oscillator.connect(gain);
	gain.connect(context.destination);
	oscillator.start();
	oscillator.stop(context.currentTime + 0.35);
	void context.close();
};

const Countdown: React.FC<CountdownProps> = ({ onBack }) => {
	const [input, setInput] = useState({ hours: 0, minutes: 5, seconds: 0 });
	const [totalSeconds, setTotalSeconds] = useState(300);
	const [remainingSeconds, setRemainingSeconds] = useState(300);
	const [running, setRunning] = useState(false);
	const startedAtRef = useRef<number | null>(null);
	const lastBeepedRef = useRef(false);
	const configuredSeconds = useMemo(() => normalizeCountdownInput(input.hours, input.minutes, input.seconds), [input]);

	useEffect(() => {
		if (!running) return undefined;
		const startedAt = startedAtRef.current ?? Date.now();
		startedAtRef.current = startedAt;
		const intervalId = window.setInterval(() => {
			const nextRemaining = getCountdownRemaining(totalSeconds, Date.now() - startedAt);
			setRemainingSeconds(nextRemaining);
			if (nextRemaining === 0) {
				if (!lastBeepedRef.current) {
					lastBeepedRef.current = true;
					playCompletionBeep();
				}
				setRunning(false);
			}
		}, 200);
		return () => window.clearInterval(intervalId);
	}, [running, totalSeconds]);

	const updateInput = (key: keyof typeof input, value: number | null) => {
		setInput(current => ({ ...current, [key]: Math.max(0, value ?? 0) }));
	};

	const toggleRunning = () => {
		if (running) {
			setRunning(false);
			startedAtRef.current = null;
			return;
		}
		if (remainingSeconds === 0) {
			message.warning("请先设置大于 0 的倒计时时间");
			return;
		}
		if (remainingSeconds === totalSeconds) lastBeepedRef.current = false;
		startedAtRef.current = Date.now() - (totalSeconds - remainingSeconds) * 1000;
		setRunning(true);
	};

	const applyInput = () => {
		setTotalSeconds(configuredSeconds);
		setRemainingSeconds(configuredSeconds);
		startedAtRef.current = null;
		lastBeepedRef.current = false;
		setRunning(false);
	};

	const reset = () => {
		setRemainingSeconds(totalSeconds);
		startedAtRef.current = null;
		lastBeepedRef.current = false;
		setRunning(false);
	};

	return (
		<div className="time-tool-page countdown-page">
			<div className="time-tool-header">
				<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
					返回百宝箱
				</Button>
				<Typography.Title level={2}>倒计时</Typography.Title>
				<Typography.Text type="secondary">设置时间，到点后播放提示音</Typography.Text>
			</div>
			<Card className="time-tool-card">
				<div className="countdown-inputs">
					<label>
						小时
						<InputNumber
							min={0}
							max={99}
							value={input.hours}
							disabled={running}
							onChange={value => updateInput("hours", value)}
						/>
					</label>
					<label>
						分钟
						<InputNumber
							min={0}
							max={59}
							value={input.minutes}
							disabled={running}
							onChange={value => updateInput("minutes", value)}
						/>
					</label>
					<label>
						秒
						<InputNumber
							min={0}
							max={59}
							value={input.seconds}
							disabled={running}
							onChange={value => updateInput("seconds", value)}
						/>
					</label>
					<Button disabled={running} onClick={applyInput}>
						应用时间
					</Button>
				</div>
				<div className="time-display">{formatDuration(remainingSeconds)}</div>
				<Space size="middle">
					<Button type="primary" size="large" icon={running ? <PauseOutlined /> : <PlayCircleOutlined />} onClick={toggleRunning}>
						{running ? "暂停" : remainingSeconds < totalSeconds ? "继续" : "开始"}
					</Button>
					<Button size="large" icon={<ReloadOutlined />} onClick={reset}>
						重置
					</Button>
				</Space>
				{!running && remainingSeconds === 0 && (
					<Alert className="countdown-finished" type="success" showIcon message="倒计时结束" />
				)}
			</Card>
		</div>
	);
};

export default Countdown;
