import React from "react";
import { Button, Form, Input, Modal, Switch } from "antd";

export default class UserEdit extends React.Component {
	render() {
		const { modalVisible, record, handleCancel, handleFinish } = this.props;
		return (
			<Modal open={modalVisible} title="修改用户信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleFinish}
					initialValues={{
						...record
					}}
				>
					<Form.Item
						name="userName"
						label="用户名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入用户名称" />
					</Form.Item>
					<Form.Item
						name="nickName"
						label="昵称"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入昵称" />
					</Form.Item>
					<Form.Item
						name="phoneNumber"
						label="手机号码"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入手机号码" />
					</Form.Item>
					<Form.Item
						name="email"
						label="邮箱地址"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入邮箱地址" />
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
