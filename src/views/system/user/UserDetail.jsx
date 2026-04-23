import React from "react";
import { Form, Modal } from "antd";

// 用户详情弹窗
export default class UserDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<Modal open={modalVisible} title="查看用户信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="用户名称">
						<span>{record.userName}</span>
					</Form.Item>
					<Form.Item label="昵称">
						<span>{record.nickName}</span>
					</Form.Item>
					<Form.Item label="手机号码">
						<span>{record.phoneNumber}</span>
					</Form.Item>
					<Form.Item label="部门">
						<span>{record.departmentName}</span>
					</Form.Item>
					<Form.Item label="岗位">
						<span>{record.positionName}</span>
					</Form.Item>
					<Form.Item label="邮箱">
						<span>{record.email}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
