import { useState, useRef } from "react";
import { Modal } from "antd";
import Draggable from "react-draggable";

/**
 * 可拖拽的 Modal 组件，继承 antd Modal 的所有功能
 * @extends Modal
 */
const DragableModal = ({ title, open, ...restProps }) => {
	const [disabled, setDisabled] = useState(true);
	const [bounds, setBounds] = useState({
		left: 0,
		top: 0,
		bottom: 0,
		right: 0
	});
	const draggleRef = useRef(null);

	const onStart = (event, uiData) => {
		const { clientWidth, clientHeight } = window.document.documentElement;
		const targetRect = draggleRef.current?.getBoundingClientRect();

		if (!targetRect) return;

		setBounds({
			left: -targetRect.left + uiData.x,
			right: clientWidth - (targetRect.right - uiData.x),
			top: -targetRect.top + uiData.y,
			bottom: clientHeight - (targetRect.bottom - uiData.y)
		});
	};

	const renderTitle = (
		<div
			style={{ width: "100%", cursor: "move" }}
			onMouseOver={() => disabled && setDisabled(false)}
			onMouseOut={() => setDisabled(true)}
			// 为了无障碍访问保留 onFocus 和 onBlur
			onFocus={() => {}}
			onBlur={() => {}}
		>
			{title}
		</div>
	);

	return (
		<Modal
			{...restProps}
			open={open}
			title={renderTitle}
			modalRender={modal => (
				<Draggable disabled={disabled} bounds={bounds} onStart={onStart}>
					<div ref={draggleRef}>{modal}</div>
				</Draggable>
			)}
		/>
	);
};

// 继承 Modal 的静态方法和属性
Object.assign(DragableModal, Modal);

export default DragableModal;
