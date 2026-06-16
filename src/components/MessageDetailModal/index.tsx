import React from "react";
import { Modal, Tag } from "antd";
import dayjs from "dayjs";
import "./index.less";

export interface MessageDetailRecord {
	title?: string;
	content?: string;
	noticeType?: number;
	sendTime?: string;
}

export interface MessageDetailOptions {
	isDark?: boolean;
}

const noticeTypeMap = {
	1: { text: "普通", color: "blue" },
	2: { text: "重要", color: "orange" },
	3: { text: "紧急", color: "red" }
};

export const showMessageDetailModal = (record: MessageDetailRecord, onOk?: () => void, options: MessageDetailOptions = {}) => {
	const type = noticeTypeMap[record.noticeType as keyof typeof noticeTypeMap] || noticeTypeMap[1];
	const sendTime = record.sendTime ? dayjs(record.sendTime).format("YYYY-MM-DD HH:mm:ss") : "";
	const modalClassName = `message-detail-modal${options.isDark ? " message-detail-modal-dark" : ""}`;
	const darkModalStyle = options.isDark ? { backgroundColor: "#1f1f1f" } : undefined;

	Modal.info({
		icon: null,
		title: null,
		width: 640,
		okText: "我知道了",
		className: modalClassName,
		rootClassName: options.isDark ? "message-detail-modal-root-dark" : undefined,
		styles: options.isDark
			? {
					root: darkModalStyle,
					container: darkModalStyle,
					body: darkModalStyle
			  }
			: undefined,
		content: (
			<div className={`message-detail${options.isDark ? " message-detail-dark" : ""}`}>
				<div className="message-detail-header">
					<div className="message-detail-title">{record.title || "消息详情"}</div>
					<div className="message-detail-meta">
						<Tag color={type.color}>{type.text}</Tag>
						{sendTime && <span>{sendTime}</span>}
					</div>
				</div>
				<div className="message-detail-body">{record.content || "暂无内容"}</div>
			</div>
		),
		onOk
	});
};
