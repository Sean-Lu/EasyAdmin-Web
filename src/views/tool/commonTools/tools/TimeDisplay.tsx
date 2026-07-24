import React from "react";
import { splitTimeDisplay } from "./timeUtils";

interface TimeDisplayProps {
	value: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ value }) => (
	<div className="time-display" aria-label={value}>
		{splitTimeDisplay(value).map((part, index) => {
			if (part === ":") {
				return <span className="time-display-separator" aria-hidden="true" key={`${part}-${index}`} />;
			}
			return <span key={`${part}-${index}`}>{part}</span>;
		})}
	</div>
);

export default TimeDisplay;
