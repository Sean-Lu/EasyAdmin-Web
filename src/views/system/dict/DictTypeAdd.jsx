import React from "react";
import { Button, Form, Input, InputNumber, Modal, Switch } from "antd";

export default class DictTypeAdd extends React.Component {
	render() {
		const { modalVisible, onCancel, onFinish } = this.props;
		return (
			<Modal open={modalVisible} title="新增字典类型" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onFinish}
					initialValues={{
						state: true,
						sort: 1
					}}
				>
					<Form.Item
						name="name"
						label="类型名称"
						rules={[
							{
								required: true,
								message: "请输入类型名称"
							}
						]}
					>
						<Input placeholder="请输入类型名称" />
					</Form.Item>
					<Form.Item
						name="code"
						label="类型编码"
						rules={[
							{
								required: true,
								message: "请输入类型编码"
							}
						]}
					>
						<Input placeholder="请输入类型编码" />
					</Form.Item>
					<Form.Item
						name="sort"
						label="排序"
						rules={[
							{
								required: false
							}
						]}
					>
						<InputNumber min={1} />
					</Form.Item>
					<Form.Item
						name="state"
						label="状态"
						valuePropName="checked"
						rules={[
							{
								required: false
							}
						]}
					>
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item
						name="remark"
						label="备注"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input.TextArea placeholder="请输入备注" rows={3} />
					</Form.Item>
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="cancel" onClick={onCancel}>
							取消
						</Button>
						<Button key="submit" type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
							确定
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
