import React from "react";
import type { FlipClockSettings } from "./flipClockSettings";
import { getChangedDigitIndexes } from "./flipClockUtils";
import "./FlipClockDisplay.less";

export const getClockText = (date: Date, showSeconds: boolean): string => {
	const time = [date.getHours(), date.getMinutes(), ...(showSeconds ? [date.getSeconds()] : [])];
	return time.map(value => String(value).padStart(2, "0")).join(":");
};

export const getDateText = (date: Date): string =>
	new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date);

export const getWeekdayText = (date: Date): string => new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);

export const getFlipClockStageClassName = (isFullscreen: boolean): string =>
	`flip-clock-stage${isFullscreen ? " is-fullscreen" : ""}`;

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
	now: Date;
	settings: FlipClockSettings;
	previousClockText?: string;
	changedDigitIndexes?: number[];
	animate?: boolean;
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
