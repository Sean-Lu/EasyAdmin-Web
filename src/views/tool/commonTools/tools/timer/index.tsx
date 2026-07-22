import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftOutlined, PauseOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";
import { formatDuration } from "../timeUtils";
import "./index.less";

interface TimerProps {
	onBack: () => void;
}

const Timer: React.FC<TimerProps> = ({ onBack }) => {
	const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
	const [running, setRunning] = useState(false);
	const startedAtRef = useRef<number | null>(null);

	useEffect(() => {
		if (!running) return undefined;
		const startedAt = startedAtRef.current ?? Date.now();
		startedAtRef.current = startedAt;
		const intervalId = window.setInterval(() => {
			setElapsedMilliseconds(Date.now() - startedAt);
		}, 250);
		return () => window.clearInterval(intervalId);
	}, [running]);

	const toggleRunning = () => {
		if (running) {
			setElapsedMilliseconds(Date.now() - (startedAtRef.current ?? Date.now()));
			startedAtRef.current = null;
			setRunning(false);
			return;
		}
		startedAtRef.current = Date.now() - elapsedMilliseconds;
		setRunning(true);
	};

	const reset = () => {
		startedAtRef.current = null;
		setElapsedMilliseconds(0);
		setRunning(false);
	};

	return (
		<div className="time-tool-page timer-page">
			<div className="time-tool-header">
				<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
					返回百宝箱
				</Button>
				<Typography.Title level={2}>计时器</Typography.Title>
				<Typography.Text type="secondary">记录一段经过的时间</Typography.Text>
			</div>
			<Card className="time-tool-card">
				<div className="time-display">{formatDuration(Math.floor(elapsedMilliseconds / 1000))}</div>
				<Space size="middle">
					<Button type="primary" size="large" icon={running ? <PauseOutlined /> : <PlayCircleOutlined />} onClick={toggleRunning}>
						{running ? "暂停" : elapsedMilliseconds > 0 ? "继续" : "开始"}
					</Button>
					<Button size="large" icon={<ReloadOutlined />} onClick={reset}>
						重置
					</Button>
				</Space>
			</Card>
		</div>
	);
};

export default Timer;
