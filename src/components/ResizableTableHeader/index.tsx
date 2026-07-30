import type { MouseEvent as ReactMouseEvent, ThHTMLAttributes } from "react";

/** 可调整列宽的表头单元格属性 */
export interface ResizableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
	/** 当前列宽 */
	width?: number;
	/** 列宽变化回调 */
	onResize?: (width: number) => void;
}

/** 为 Ant Design Table 提供鼠标拖拽调整列宽的表头单元格 */
const ResizableHeaderCell = ({ width, onResize, children, style, ...restProps }: ResizableHeaderCellProps) => {
	const startResize = (event: ReactMouseEvent<HTMLDivElement>) => {
		if (!width || !onResize) return;

		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = width;
		const previousCursor = document.body.style.cursor;
		const previousUserSelect = document.body.style.userSelect;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			// 保留基本内容展示空间，避免列被拖动至不可操作
			onResize(Math.max(100, startWidth + moveEvent.clientX - startX));
		};
		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = previousCursor;
			document.body.style.userSelect = previousUserSelect;
		};

		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<th {...restProps} style={{ ...style, position: "relative" }}>
			{children}
			{width && onResize && (
				<div
					role="separator"
					aria-orientation="vertical"
					onMouseDown={startResize}
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						bottom: 0,
						zIndex: 1,
						width: 8,
						cursor: "col-resize"
					}}
				/>
			)}
		</th>
	);
};

export default ResizableHeaderCell;
