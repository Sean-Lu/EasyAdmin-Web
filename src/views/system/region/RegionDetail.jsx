import React from "react";
import { Form, Modal } from "antd";

// 行政区划详情弹窗
export default class RegionDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;
		const levelMap = { 1: "省", 2: "市", 3: "区" };

		return (
			<Modal open={modalVisible} title="查看行政区划信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="上级行政区划">
						<span>{record.parentFullPath || "无"}</span>
					</Form.Item>
					<Form.Item label="行政区划名称">
						<span>{record.name}</span>
					</Form.Item>
					<Form.Item label="行政区划代码">
						<span>{record.code}</span>
					</Form.Item>
					<Form.Item label="层级">
						<span>{levelMap[record.level] || record.level}</span>
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
