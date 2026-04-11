import { Button, Form, Input, Modal, Switch } from "antd";

// 角色编辑弹窗
export default function RoleEdit({ modalVisible = false, onCancel = () => {}, onSubmit = () => {}, record = {} }) {
	const handleFinish = values => {
		onSubmit({ ...values, id: record.id });
	};

	return (
		<Modal open={modalVisible} title="编辑角色信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
			<Form
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 17 }}
				layout="horizontal"
				onFinish={handleFinish}
				initialValues={{
					...record,
					state: record.state === 1 // 转换为布尔值
				}}
			>
				<Form.Item
					name="name"
					label="角色名称"
					rules={[
						{
							required: true,
							message: "请输入角色名称"
						}
					]}
				>
					<Input placeholder="请输入角色名称" />
				</Form.Item>
				<Form.Item
					name="code"
					label="角色编码"
					rules={[
						{
							required: true,
							message: "请输入角色编码"
						}
					]}
				>
					<Input placeholder="请输入角色编码" />
				</Form.Item>
				<Form.Item
					name="description"
					label="角色描述"
					rules={[
						{
							required: false
						}
					]}
				>
					<Input.TextArea placeholder="请输入角色描述" rows={3} />
				</Form.Item>
				<Form.Item
					name="sort"
					label="排序"
					rules={[
						{
							required: true,
							message: "请输入排序值"
						}
					]}
				>
					<Input type="number" placeholder="请输入排序值" />
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
