import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowLeftOutlined,
	BgColorsOutlined,
	DeleteOutlined,
	FullscreenExitOutlined,
	FullscreenOutlined,
	SettingOutlined,
	UploadOutlined
} from "@ant-design/icons";
import { Button, ColorPicker, Divider, Drawer, Space, Switch, Tooltip, Typography, message } from "antd";
import screenfull from "screenfull";
import { useSelector } from "react-redux";
import { loadFlipClockSettings, saveFlipClockSettings, type FlipClockSettings } from "./flipClockSettings";
import { getChangedDigitIndexes } from "./flipClockUtils";
import "./index.less";

interface FlipClockProps {
	onBack: () => void;
}

const BACKGROUND_PRESETS = ["#101828", "#0f172a", "#172554", "#0f766e", "#7c2d12", "#3b0764"];
const MAX_BACKGROUND_IMAGE_SIZE = 2 * 1024 * 1024;

const getClockText = (date: Date, showSeconds: boolean): string => {
	const time = [date.getHours(), date.getMinutes(), ...(showSeconds ? [date.getSeconds()] : [])];
	return time.map(value => String(value).padStart(2, "0")).join(":");
};

const getDateText = (date: Date): string =>
	new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date);

const getWeekdayText = (date: Date): string => new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);

const FlipDigits: React.FC<{
	value: string;
	previousValue?: string;
	changedDigitIndexes: number[];
}> = ({ value, previousValue, changedDigitIndexes }) => {
	let digitIndex = 0;
	const currentDigits = value.replace(/:/g, "");
	const previousDigits = (previousValue ?? value).replace(/:/g, "");
	return (
		<div className="flip-clock-digits" aria-label={value}>
			{value.split(":").map((part, index) => (
				<React.Fragment key={`${part}-${index}`}>
					{index > 0 && <span className="flip-clock-separator">:</span>}
					{part.split("").map(digit => {
						const currentDigitIndex = digitIndex++;
						const isFlipping = changedDigitIndexes.includes(currentDigitIndex);
						const previousDigit = previousDigits[currentDigitIndex] ?? currentDigits[currentDigitIndex] ?? digit;
						return (
							<span
								className={`flip-digit${isFlipping ? " is-flipping" : ""}`}
								key={`${currentDigitIndex}-${digit}-${previousDigit}-${isFlipping}`}
							>
								<span className="flip-digit-half flip-digit-half-top">
									<span>{digit}</span>
								</span>
								<span className="flip-digit-half flip-digit-half-bottom">
									<span>{previousDigit}</span>
								</span>
								{isFlipping && (
									<>
										<span className="flip-digit-flap flip-digit-flap-top">
											<span>{previousDigit}</span>
										</span>
										<span className="flip-digit-flap flip-digit-flap-bottom">
											<span>{digit}</span>
										</span>
									</>
								)}
							</span>
						);
					})}
				</React.Fragment>
			))}
		</div>
	);
};

const FlipClock: React.FC<FlipClockProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => Boolean(state.global.themeConfig.isDark));
	const pageRef = useRef<HTMLDivElement>(null);
	const [now, setNow] = useState(() => new Date());
	const [settings, setSettings] = useState<FlipClockSettings>(() => loadFlipClockSettings(window.localStorage));
	const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const clockText = useMemo(() => getClockText(now, settings.showSeconds), [now, settings.showSeconds]);
	const dateText = useMemo(() => getDateText(now), [now]);
	const weekdayText = useMemo(() => getWeekdayText(now), [now]);
	const previousClockTextRef = useRef<string>();
	const changedDigitIndexes = getChangedDigitIndexes(previousClockTextRef.current, clockText);

	useEffect(() => {
		const intervalId = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(intervalId);
	}, []);

	useEffect(() => {
		previousClockTextRef.current = clockText;
	}, [clockText]);

	useEffect(() => {
		const handleFullScreenChange = () => {
			const fullscreen = screenfull.isFullscreen;
			setIsFullscreen(fullscreen);
			if (fullscreen) setSettingsOpen(false);
		};
		if (!screenfull.isEnabled) return undefined;
		screenfull.on("change", handleFullScreenChange);
		return () => screenfull.off("change", handleFullScreenChange);
	}, []);

	const updateSettings = (next: Partial<FlipClockSettings>) => {
		setSettings(current => {
			const updated = { ...current, ...next };
			saveFlipClockSettings(window.localStorage, updated);
			return updated;
		});
	};

	const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
			message.warning("请选择 PNG、JPG、WEBP 或 GIF 图片");
			return;
		}
		if (file.size > MAX_BACKGROUND_IMAGE_SIZE) {
			message.warning("背景图片不能超过 2MB");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") updateSettings({ backgroundImage: reader.result });
		};
		reader.readAsDataURL(file);
	};

	const toggleFullscreen = async () => {
		if (!screenfull.isEnabled) {
			message.warning("当前浏览器不支持全屏");
			return;
		}
		if (screenfull.isFullscreen) await screenfull.exit();
		else if (pageRef.current) await screenfull.request(pageRef.current);
	};

	const handleBack = async () => {
		if (screenfull.isFullscreen) await screenfull.exit();
		onBack();
	};

	return (
		<div
			ref={pageRef}
			className={`flip-clock-page${isFullscreen ? " is-fullscreen" : ""}`}
			style={{
				backgroundColor: settings.backgroundColor,
				backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined
			}}
		>
			<div className="flip-clock-toolbar">
				<Button className="flip-clock-back" icon={<ArrowLeftOutlined />} onClick={() => void handleBack()}>
					返回百宝箱
				</Button>
				<div className="flip-clock-title">
					<Typography.Title level={2}>翻页时钟</Typography.Title>
					<Typography.Text>专注模式 · 当前本地时间</Typography.Text>
				</div>
				<Space className="flip-clock-actions">
					<Tooltip title="时钟设置">
						<Button aria-label="打开时钟设置" icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)} />
					</Tooltip>
					<Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
						<Button
							aria-label={isFullscreen ? "退出全屏" : "全屏"}
							icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
							onClick={() => void toggleFullscreen()}
						/>
					</Tooltip>
				</Space>
			</div>

			<div className="flip-clock-stage">
				{(settings.showDate || settings.showWeekday) && (
					<div className="flip-clock-date-info">
						{settings.showDate && <span>{dateText}</span>}
						{settings.showDate && settings.showWeekday && <span className="date-info-separator">·</span>}
						{settings.showWeekday && <span>{weekdayText}</span>}
					</div>
				)}
				<FlipDigits value={clockText} previousValue={previousClockTextRef.current} changedDigitIndexes={changedDigitIndexes} />
				{isFullscreen && <div className="flip-clock-exit-hint">按 Esc 退出全屏</div>}
			</div>

			<Drawer
				className={`flip-clock-settings-drawer${isDark ? " flip-clock-settings-drawer-dark" : ""}`}
				title={
					<>
						<SettingOutlined /> 时钟设置
					</>
				}
				placement="right"
				width={360}
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			>
				<div className={`flip-clock-setting-section${settings.backgroundImage ? " has-background-image" : ""}`}>
					<div className="flip-clock-setting-section-title">
						<BgColorsOutlined /> 背景色
					</div>
					<div className="background-mode-switch">
						<button
							className={!settings.backgroundImage ? "is-active" : ""}
							onClick={() => updateSettings({ backgroundImage: "" })}
						>
							纯色
						</button>
						<button
							className={settings.backgroundImage ? "is-active" : ""}
							onClick={() => document.getElementById("flip-clock-background-image")?.click()}
						>
							背景图
						</button>
					</div>
					<div className="background-selection">
						<div className="background-presets">
							{BACKGROUND_PRESETS.map(color => (
								<button
									aria-label={`选择背景色 ${color}`}
									className={`color-preset${settings.backgroundColor === color ? " is-active" : ""}`}
									key={color}
									onClick={() => updateSettings({ backgroundColor: color })}
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
						<div className="custom-color-control">
							<span>自定义</span>
							<ColorPicker
								value={settings.backgroundColor}
								onChange={color => updateSettings({ backgroundColor: color.toHexString() })}
								showText={false}
							/>
							<Typography.Text className="color-value">{settings.backgroundColor.toUpperCase()}</Typography.Text>
						</div>
					</div>
				</div>
				<div className="flip-clock-background-image-section">
					<div className="background-image-header">
						<span>背景图</span>
						<Button
							size="small"
							icon={<UploadOutlined />}
							onClick={() => document.getElementById("flip-clock-background-image")?.click()}
						>
							{settings.backgroundImage ? "替换" : "上传图片"}
						</Button>
					</div>
					{settings.backgroundImage && (
						<div className="background-image-preview">
							<img src={settings.backgroundImage} alt="背景预览" />
							<Button type="text" danger icon={<DeleteOutlined />} onClick={() => updateSettings({ backgroundImage: "" })}>
								清除图片
							</Button>
						</div>
					)}
					<input
						id="flip-clock-background-image"
						className="background-image-input"
						type="file"
						accept="image/png,image/jpeg,image/webp,image/gif"
						onChange={handleBackgroundImageUpload}
					/>
				</div>
				<Divider />
				<div className="flip-clock-setting-row">
					<span>显示日期</span>
					<Switch checked={settings.showDate} onChange={showDate => updateSettings({ showDate })} />
				</div>
				<div className="flip-clock-setting-row">
					<span>显示星期</span>
					<Switch checked={settings.showWeekday} onChange={showWeekday => updateSettings({ showWeekday })} />
				</div>
				<div className="flip-clock-setting-row">
					<span>显示秒</span>
					<Switch checked={settings.showSeconds} onChange={showSeconds => updateSettings({ showSeconds })} />
				</div>
			</Drawer>
		</div>
	);
};

export default FlipClock;
