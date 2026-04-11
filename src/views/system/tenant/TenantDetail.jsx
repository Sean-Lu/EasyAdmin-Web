import React from "react";
import { Form, Modal } from "antd";

// 租户详情弹窗
export default class TenantDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<Modal open={modalVisible} title="查看租户信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="租户名称">
						<span>{record.name}</span>
					</Form.Item>
					<Form.Item label="租管账号">
						<span>{record.adminUserName}</span>
					</Form.Item>
					<Form.Item label="备注">
						<span>{record.remark}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
