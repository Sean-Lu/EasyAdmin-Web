import React from "react";
import { Button, Form, Input, Modal, Switch } from "antd";

const { TextArea } = Input;

// 参数编辑弹窗
export default class ParamEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit, record } = this.props;
		return (
			<Modal open={modalVisible} title="修改参数信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onSubmit}
					initialValues={{
						...record
					}}
				>
					<Form.Item
						name="paramName"
						label="参数名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入参数名称" />
					</Form.Item>
					<Form.Item
						name="paramKey"
						label="参数键名"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入参数键名" />
					</Form.Item>
					<Form.Item
						name="paramValue"
						label="参数键值"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入参数键值" />
					</Form.Item>
					<Form.Item name="remark" label="备注">
						<TextArea placeholder="请输入备注" autoSize={{ minRows: 3, maxRows: 5 }} />
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
