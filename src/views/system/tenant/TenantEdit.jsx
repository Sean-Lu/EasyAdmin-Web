import React from "react";
import { Button, DatePicker, Form, Input, Modal, Switch } from "antd";
import dayjs from "dayjs";

// 租户编辑弹窗
export default class TenantEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit, record } = this.props;
		return (
			<Modal open={modalVisible} title="修改租户信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onSubmit}
					initialValues={{
						...record,
						startTime: record?.startTime ? dayjs(record.startTime) : null,
						expireTime: record?.expireTime ? dayjs(record.expireTime) : null
					}}
				>
					<Form.Item name="code" label="租户编码">
						<Input disabled />
					</Form.Item>
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
					<Form.Item name="startTime" label="生效时间" dependencies={["expireTime"]}>
						<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="expireTime"
						label="到期时间"
						dependencies={["startTime"]}
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									const startTime = getFieldValue("startTime");
									if (!value || !startTime || value.isAfter(startTime)) {
										return Promise.resolve();
									}
									return Promise.reject(new Error("到期时间必须晚于生效时间"));
								}
							})
						]}
					>
						<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
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
