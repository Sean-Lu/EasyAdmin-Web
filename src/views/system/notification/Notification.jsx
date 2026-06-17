import React from "react";
import { Button, Col, Form, Input, Row, Select, Tag } from "antd";
import dayjs from "dayjs";
import StandardTable from "../../../components/StandardTable";
import NotificationAdd from "./NotificationAdd";
import NotificationDetail from "./NotificationDetail";
import { api } from "../../../actions/system/api";

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

export default class Notification extends React.Component {
	searchFormRef = React.createRef();

	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="标题" name="title">
						<Input placeholder="请输入通知标题" />
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="类型" name="noticeType">
						<Select
							placeholder="请选择类型"
							allowClear
							options={[
								{ value: 1, label: "普通" },
								{ value: 2, label: "重要" },
								{ value: 3, label: "紧急" }
							]}
						/>
					</Form.Item>
				</Col>
				<Col>
					<div style={{ float: "right" }}>
						<Button type="primary" htmlType="submit">
							查询
						</Button>
						<Button style={{ marginLeft: 8 }} onClick={onSearchFormReset}>
							重置
						</Button>
					</div>
				</Col>
			</Row>
		);
	};

	renderModal = (
		record,
		addModalVisible,
		hideAddModal,
		onAddFinish,
		updateModalVisible,
		hideUpdateModal,
		onUpdateFinish,
		detailModalVisible,
		hideDetailModal
	) => {
		return (
			<>
				<NotificationAdd modalVisible={addModalVisible} onCancel={hideAddModal} onSubmit={onAddFinish} />
				<NotificationDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	handleAddValues = values => {
		const sendChannels = values.sendChannels || ["inSystem"];

		return {
			...values,
			sendChannels: undefined,
			sendInSystem: sendChannels.includes("inSystem"),
			sendEmail: sendChannels.includes("email"),
			sendSms: sendChannels.includes("sms"),
			sendToAll: !!values.sendToAll,
			userIds: values.userIds || [],
			roleIds: values.roleIds || [],
			departmentIds: values.departmentIds || []
		};
	};

	render() {
		const columns = [
			{
				title: "标题",
				dataIndex: "title",
				align: "center",
				width: 220
			},
			{
				title: "类型",
				dataIndex: "noticeType",
				align: "center",
				width: 100,
				render: text => {
					const type = noticeTypeMap[text] || noticeTypeMap[1];
					return <Tag color={type.color}>{type.text}</Tag>;
				}
			},
			{
				title: "接收范围",
				dataIndex: "targetSummary",
				align: "center",
				width: 240
			},
			{
				title: "发送方式",
				align: "center",
				width: 150,
				render: (_, record) => renderSendChannels(record)
			},
			{
				title: "发送时间",
				dataIndex: "sendTime",
				align: "center",
				width: 170,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "")
			}
		];

		return (
			<StandardTable
				code={"system.notification"}
				searchFormRef={this.searchFormRef}
				columns={columns}
				renderSearchForm={this.renderSearchForm}
				renderModal={this.renderModal}
				handleAddValues={this.handleAddValues}
				apiAdd={api.notification.add}
				apiDelete={api.notification.delete}
				apiUpdateState={api.notification.updateState}
				apiPage={api.notification.page}
				apiDetail={api.notification.detail}
				recordOperateColWidth={120}
			/>
		);
	}
}
