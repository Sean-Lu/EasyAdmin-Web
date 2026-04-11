import React from "react";
import { Form, Modal } from "antd";

// 参数详情弹窗
export default class ParamDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<Modal open={modalVisible} title="查看参数信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="参数名称">
						<span>{record.paramName}</span>
					</Form.Item>
					<Form.Item label="参数键名">
						<span>{record.paramKey}</span>
					</Form.Item>
					<Form.Item label="参数键值">
						<span>{record.paramValue}</span>
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
