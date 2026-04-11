import React, { useState } from "react";
import { Upload, Button, message, Modal, Form, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { uploadFile } from "../../../services/system/fileService";

const { TextArea } = Input;

interface FileUploadProps {
	onSuccess: () => void;
}

// 文件上传弹窗
const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
	const [visible, setVisible] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();
	const [uploading, setUploading] = useState(false);

	const beforeUpload = (file: RcFile) => {
		setFileList([file]);
		setVisible(true);
		return false;
	};

	const handleCancel = () => {
		setVisible(false);
		setFileList([]);
		form.resetFields();
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (fileList.length === 0) {
				message.warning("请先选择文件");
				return;
			}

			setUploading(true);
			const file = fileList[0] as unknown as File;
			const result = await uploadFile(file, values.description);

			if (result.success) {
				message.success("文件上传成功");
				setVisible(false);
				setFileList([]);
				form.resetFields();
				onSuccess();
			} else {
				message.error(result.msg || "文件上传失败");
			}
		} catch (error) {
			message.error("文件上传失败");
		} finally {
			setUploading(false);
		}
	};

	return (
		<>
			<Upload beforeUpload={beforeUpload} fileList={fileList} showUploadList={false}>
				<Button type="primary" icon={<UploadOutlined />}>
					上传文件
				</Button>
			</Upload>
			<Modal
				title="上传文件"
				open={visible}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText="上传"
				cancelText="取消"
				confirmLoading={uploading}
			>
				<Form form={form} layout="vertical">
					<Form.Item name="description" label="文件描述" rules={[{ required: true, message: "请输入文件描述" }]}>
						<TextArea rows={4} placeholder="请输入文件描述" />
					</Form.Item>
					<div style={{ marginBottom: 16 }}>
						<strong>已选文件:</strong> {fileList[0]?.name}
					</div>
				</Form>
			</Modal>
		</>
	);
};

export default FileUpload;
