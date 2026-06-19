import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Space, message } from "antd";
import { ArrowLeftOutlined, KeyOutlined } from "@ant-design/icons";
import { NotePasswordService } from "@/services/tool/noteService";

interface NotePasswordProps {
	onBack: () => void;
}

// 笔记密码页
const NotePassword: React.FC<NotePasswordProps> = ({ onBack }) => {
	const [hasPassword, setHasPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		void loadStatus();
	}, []);

	const loadStatus = async () => {
		const status = await NotePasswordService.status();
		setHasPassword(!!status?.hasPassword);
	};

	const save = async () => {
		const values = await form.validateFields();
		setLoading(true);
		try {
			if (hasPassword) {
				await NotePasswordService.change(values.oldPassword, values.newPassword);
				message.success("笔记密码已修改");
			} else {
				await NotePasswordService.set(values.password);
				message.success("笔记密码已设置");
			}
			form.resetFields();
			await loadStatus();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card
			title={
				<Space>
					<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
						返回
					</Button>
					<span>笔记密码</span>
				</Space>
			}
			extra={<KeyOutlined />}
		>
			<Form form={form} layout="vertical" style={{ maxWidth: 420 }}>
				{hasPassword ? (
					<>
						<Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: "请输入原密码" }]}>
							<Input.Password />
						</Form.Item>
						<Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 4, message: "请输入至少 4 位新密码" }]}>
							<Input.Password />
						</Form.Item>
					</>
				) : (
					<Form.Item name="password" label="设置密码" rules={[{ required: true, min: 4, message: "请输入至少 4 位密码" }]}>
						<Input.Password />
					</Form.Item>
				)}
				<Button type="primary" loading={loading} onClick={save}>
					保存
				</Button>
			</Form>
		</Card>
	);
};

export default NotePassword;
