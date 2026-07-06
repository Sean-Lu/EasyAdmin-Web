import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Watermark } from "antd";

export const GLOBAL_WATERMARK_Z_INDEX = 3000;

export const getGlobalWatermarkStyle = (): CSSProperties => ({
	position: "fixed",
	inset: 0,
	zIndex: GLOBAL_WATERMARK_Z_INDEX,
	pointerEvents: "none"
});

interface GlobalWatermarkProps {
	content?: string;
}

const GlobalWatermark = ({ content }: GlobalWatermarkProps) => {
	if (!content) return null;

	return createPortal(<Watermark content={content} style={getGlobalWatermarkStyle()} />, document.body);
};

export default GlobalWatermark;
