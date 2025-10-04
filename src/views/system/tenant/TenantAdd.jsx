import React from "react";
import { Button, Form, Input, Modal, Switch } from "antd";

export default class TenantAdd extends React.Component {
	render() {
		const { modalVisible, handleCancel, handleFinish } = this.props;
		return (
			<Modal open={modalVisible} title="新增租户信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleFinish}
					initialValues={{
						state: true // 设置默认为启用状态
					}}
				>
					<Form.Item
						name="name"
						label="租户名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入租户名称" />
					</Form.Item>
					<Form.Item
						name="adminUserName"
						label="租管账号"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入租管账号" />
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
						<Input placeholder="请输入备注" />
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
						<Button key="cancel" onClick={handleCancel}>
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
