import React from "react";
import { Form, Modal } from "antd";

// 岗位详情弹窗
export default class PositionDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<Modal open={modalVisible} title="查看岗位信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="岗位名称">
						<span>{record.name}</span>
					</Form.Item>
					<Form.Item label="岗位编码">
						<span>{record.code}</span>
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
