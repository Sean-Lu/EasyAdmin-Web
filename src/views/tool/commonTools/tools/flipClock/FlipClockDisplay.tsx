import React from "react";
import type { FlipClockSettings } from "./flipClockSettings";
import { getChangedDigitIndexes } from "./flipClockUtils";
import "./FlipClockDisplay.less";

/** 获取时钟显示文本 */
export const getClockText = (date: Date, showSeconds: boolean): string => {
	const time = [date.getHours(), date.getMinutes(), ...(showSeconds ? [date.getSeconds()] : [])];
	return time.map(value => String(value).padStart(2, "0")).join(":");
};

/** 获取日期显示文本 */
export const getDateText = (date: Date): string =>
	new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date);

/** 获取星期显示文本 */
export const getWeekdayText = (date: Date): string => new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);

/** 获取时钟舞台样式类名 */
export const getFlipClockStageClassName = (isFullscreen: boolean): string =>
	`flip-clock-stage${isFullscreen ? " is-fullscreen" : ""}`;

/** 获取翻页数字各图层的显示值 */
export const getFlipDigitLayerValues = (currentDigit: string, previousDigit: string, isFlipping: boolean) => ({
	staticTop: currentDigit,
	staticBottom: isFlipping ? previousDigit : currentDigit,
	flapTop: previousDigit,
	flapBottom: currentDigit
});

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
						const layerValues = getFlipDigitLayerValues(digit, previousDigit, isFlipping);
						return (
							<span
								className={`flip-digit${isFlipping ? " is-flipping" : ""}`}
								key={`${currentDigitIndex}-${digit}-${previousDigit}-${isFlipping}`}
							>
								<span className="flip-digit-half flip-digit-half-top">
									<span>{layerValues.staticTop}</span>
								</span>
								<span className="flip-digit-half flip-digit-half-bottom">
									<span>{layerValues.staticBottom}</span>
								</span>
								{isFlipping && (
									<>
										<span className="flip-digit-flap flip-digit-flap-top">
											<span>{layerValues.flapTop}</span>
										</span>
										<span className="flip-digit-flap flip-digit-flap-bottom">
											<span>{layerValues.flapBottom}</span>
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

export interface FlipClockDisplayProps {
	/** 当前时间 */
	now: Date;
	/** 时钟显示设置 */
	settings: FlipClockSettings;
	/** 上一次的时钟文本，用于计算翻页前的数字 */
	previousClockText?: string;
	/** 指定需要翻页的数字位置，未传入时根据前后文本自动计算 */
	changedDigitIndexes?: number[];
	/** 是否启用翻页动画，默认启用 */
	animate?: boolean;
	/** 是否使用全屏布局 */
	isFullscreen?: boolean;
}

export const FlipClockDisplay: React.FC<FlipClockDisplayProps> = ({
	now,
	settings,
	previousClockText,
	changedDigitIndexes,
	animate = true,
	isFullscreen = false
}) => {
	const clockText = getClockText(now, settings.showSeconds);
	const dateText = getDateText(now);
	const weekdayText = getWeekdayText(now);
	const digitChanges = animate ? changedDigitIndexes ?? getChangedDigitIndexes(previousClockText, clockText) : [];

	return (
		<div className={getFlipClockStageClassName(isFullscreen)}>
			{(settings.showDate || settings.showWeekday) && (
				<div className="flip-clock-date-info">
					{settings.showDate && <span>{dateText}</span>}
					{settings.showDate && settings.showWeekday && <span className="date-info-separator">·</span>}
					{settings.showWeekday && <span>{weekdayText}</span>}
				</div>
			)}
			<FlipDigits value={clockText} previousValue={previousClockText} changedDigitIndexes={digitChanges} />
		</div>
	);
};

export default FlipClockDisplay;
