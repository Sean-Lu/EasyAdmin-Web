import React from "react";
import { Form, Modal } from "antd";

export default class DepartmentDetail extends React.Component {
	render() {
		const { modalVisible, record, handleCancel } = this.props;

		return (
			<Modal open={modalVisible} title="查看部门信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="上级部门">
						<span>{record.parentFullPath || "无"}</span>
					</Form.Item>
					<Form.Item label="部门名称">
						<span>{record.name}</span>
					</Form.Item>
					<Form.Item label="负责人">
						<span>{record.leaderName || "无"}</span>
					</Form.Item>
					<Form.Item label="联系电话">
						<span>{record.phone || "无"}</span>
					</Form.Item>
					<Form.Item label="排序">
						<span>{record.sort}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
					<Form.Item label="备注">
						<span>{record.remark || "无"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
