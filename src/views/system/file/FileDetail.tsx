import React from "react";
import { Modal, Descriptions, Button, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { FileDto, FileStoreType } from "../../../services/system/fileService";
import dayjs from "dayjs";

interface FileDetailProps {
	visible: boolean;
	file: FileDto | null;
	onClose: () => void;
	onDownload: (id: string) => void;
}

// 文件详情弹窗
const FileDetail: React.FC<FileDetailProps> = ({ visible, file, onClose, onDownload }) => {
	if (!file) return null;

	const formatDate = (dateString: string) => {
		return dayjs(dateString).format("YYYY-MM-DD HH:mm:ss");
	};

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};

	const getStoreTypeText = (type: FileStoreType) => {
		const typeMap = {
			[FileStoreType.LocalFile]: "本地文件"
		};
		return typeMap[type] || type;
	};

	return (
		<Modal
			title="文件详情"
			open={visible}
			onCancel={onClose}
			footer={[
				<Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => onDownload(file.id)}>
					下载
				</Button>,
				<Button key="close" onClick={onClose}>
					关闭
				</Button>
			]}
			width={700}
		>
			<Descriptions bordered column={2}>
				<Descriptions.Item label="文件名">{file.name}</Descriptions.Item>
				<Descriptions.Item label="文件类型">{file.contentType}</Descriptions.Item>
				<Descriptions.Item label="文件大小">{formatSize(file.size)}</Descriptions.Item>
				<Descriptions.Item label="存储类型">
					<Tag color="blue">{getStoreTypeText(file.storeType)}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="上传时间">{formatDate(file.createTime)}</Descriptions.Item>
				<Descriptions.Item label="文件描述" span={2}>
					{file.description || "无"}
				</Descriptions.Item>
				<Descriptions.Item label="存储路径" span={2}>
					<code>{file.path}</code>
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
};

export default FileDetail;
