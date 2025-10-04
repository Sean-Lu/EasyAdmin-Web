import React from "react";
import { Form, Modal } from "antd";

export default class MenuDetail extends React.Component {
	render() {
		const { modalVisible, record, handleCancel } = this.props;

		return (
			<Modal open={modalVisible} title="查看菜单信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="上级菜单">
						<span>{record.parentFullPath}</span>
					</Form.Item>
					<Form.Item label="菜单名称">
						<span>{record.title}</span>
					</Form.Item>
					<Form.Item label="菜单路由">
						<span>{record.path}</span>
					</Form.Item>
					<Form.Item label="外部链接">
						<span>{record.outLink}</span>
					</Form.Item>
					<Form.Item label="图标">
						<span>{record.icon}</span>
					</Form.Item>
					<Form.Item label="排序">
						<span>{record.sort}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
