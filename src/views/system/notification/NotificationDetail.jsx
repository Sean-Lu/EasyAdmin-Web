import React from "react";
import { Form, Modal, Tag } from "antd";
import dayjs from "dayjs";

const noticeTypeMap = {
	1: { text: "普通", color: "blue" },
	2: { text: "重要", color: "orange" },
	3: { text: "紧急", color: "red" }
};

const renderSendChannels = record => {
	const channels = [];
	if (record.sendInSystem !== false) {
		channels.push({ text: "站内", color: "blue" });
	}
	if (record.sendEmail) {
		channels.push({ text: "邮件", color: "green" });
	}
	if (record.sendSms) {
		channels.push({ text: "短信", color: "purple" });
	}
	return channels.map(item => (
		<Tag color={item.color} key={item.text}>
			{item.text}
		</Tag>
	));
};

export default class NotificationDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;
		const type = noticeTypeMap[record.noticeType] || noticeTypeMap[1];

		return (
			<Modal open={modalVisible} title="查看通知" footer={null} destroyOnHidden={true} onCancel={onCancel} width={720}>
				<Form labelCol={{ span: 4 }} wrapperCol={{ span: 19 }} layout="horizontal">
					<Form.Item label="标题">
						<span>{record.title}</span>
					</Form.Item>
					<Form.Item label="类型">
						<Tag color={type.color}>{type.text}</Tag>
					</Form.Item>
					<Form.Item label="接收范围">
						<span>{record.targetSummary}</span>
					</Form.Item>
					<Form.Item label="发送方式">{renderSendChannels(record)}</Form.Item>
					<Form.Item label="发送时间">
						<span>{record.sendTime ? dayjs(record.sendTime).format("YYYY-MM-DD HH:mm:ss") : ""}</span>
					</Form.Item>
					<Form.Item label="内容">
						<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{record.content}</div>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
