import { useState, useImperativeHandle, Ref } from "react";
import { Modal, message, Form, Input } from "antd";
import md5 from "js-md5";
import http from "@/api";
import { ApiResultBase } from "@/api/interface";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void }>;
}

const PasswordModal = (props: Props) => {
	const [isModalVisible, setIsModalVisible] = useState(false);

	useImperativeHandle(props.innerRef, () => ({
		showModal
	}));

	const showModal = (params: { name: number }) => {
		setIsModalVisible(true);
	};

	const handleOk = async () => {
		form.submit();
	};

	const handleCancel = () => {
		form.resetFields(); // destroyOnClose 没有生效，临时先这么解决
		setIsModalVisible(false);
	};

	const onFinish = async (values: any) => {
		try {
			const apiRes = await http.post<ApiResultBase>("/user/changePassword", {
				oldPassword: md5(values.oldPassword),
				newPassword: md5(values.newPassword)
			});
			if (apiRes.success) {
				form.resetFields(); // destroyOnClose 没有生效，临时先这么解决
				setIsModalVisible(false);
				message.success("修改密码成功 🎉🎉🎉");
			} else {
				message.error("修改密码失败：" + apiRes.msg);
			}
		} catch (error) {
			console.error("修改密码异常", error);
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.error("修改密码表单提交失败", errorInfo);
	};

	const [form] = Form.useForm();

	return (
		<Modal title="修改密码" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}>
			<Form form={form} name="passwordForm" onFinish={onFinish} onFinishFailed={onFinishFailed}>
				<Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: "请输入旧密码!" }]}>
					<Input.Password placeholder="请输入旧密码" />
				</Form.Item>
				<Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: "请输入新密码!" }]}>
					<Input.Password placeholder="请输入新密码" />
				</Form.Item>
				<Form.Item
					name="confirmPassword"
					label="新密码"
					dependencies={["newPassword"]}
					hasFeedback
					rules={[
						{ required: true, message: "请确认新密码!" },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue("newPassword") === value) {
									return Promise.resolve();
								}
								return Promise.reject(new Error("两次输入的密码不一致!"));
							}
						})
					]}
				>
					<Input.Password placeholder="请再次输入新密码" />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default PasswordModal;
