import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Watermark } from "antd";

const globalWatermarkStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	zIndex: 3000,
	pointerEvents: "none"
};

interface GlobalWatermarkProps {
	content?: string;
}

const GlobalWatermark = ({ content }: GlobalWatermarkProps) => {
	if (!content) return null;

	return createPortal(<Watermark content={content} style={globalWatermarkStyle} />, document.body);
};

export default GlobalWatermark;
