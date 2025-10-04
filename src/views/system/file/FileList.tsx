import React, { useState, useEffect } from "react";
import { Table, Button, Space, Modal, message, Card, Tag, Form, Input } from "antd";
import { DeleteOutlined, DownloadOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { FileDto, getFiles, deleteFile, downloadFile, FileStoreType, getFileById } from "../../../services/system/fileService";
import FileUpload from "./FileUpload";
import FileDetail from "./FileDetail";
import moment from "moment";

const { confirm } = Modal;

const FileList: React.FC = () => {
	const [files, setFiles] = useState<FileDto[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedFile, setSelectedFile] = useState<FileDto | null>(null);
	const [detailVisible, setDetailVisible] = useState<boolean>(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0
	});
	const [searchForm] = Form.useForm();

	useEffect(() => {
		fetchFiles();
	}, [pagination.current, pagination.pageSize]);

	const fetchFiles = async (values?: any) => {
		try {
			setLoading(true);
			const params = {
				pageNumber: pagination.current,
				pageSize: pagination.pageSize,
				...values
			};

			const result = await getFiles(params);
			setFiles(result.list || []);
			setPagination({
				...pagination,
				total: result.total || 0
			});
		} catch (error) {
			message.error("获取文件列表失败");
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination: any) => {
		setPagination(pagination);
	};

	const handleSearch = (values: any) => {
		setPagination({
			...pagination,
			current: 1
		});
		fetchFiles(values);
	};

	const handleReset = () => {
		searchForm.resetFields();
		fetchFiles();
	};

	const handleDelete = (id: string) => {
		confirm({
			title: "确定要删除这个文件吗？",
			icon: <ExclamationCircleOutlined />,
			okText: "确定",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				try {
					const result = await deleteFile(id);
					if (result.success) {
						message.success("文件删除成功");
						fetchFiles(searchForm.getFieldsValue());
					} else {
						message.error(result.msg || "删除文件失败");
					}
				} catch (error) {
					message.error("删除文件失败");
				}
			}
		});
	};

	const handleDownload = async (id: string) => {
		try {
			await downloadFile(id);
			message.success("下载开始");
		} catch (error) {
			message.error("下载文件失败");
		}
	};

	const showDetail = async (file: FileDto) => {
		// 方式1：不调用后端详情接口，直接取列表数据
		// setSelectedFile(file);
		// setDetailVisible(true);

		// 方式2：调用后端详情接口
		try {
			// 显示加载状态
			setLoading(true);

			// 调用接口获取最新文件详情
			const result = await getFileById(file.id);

			if (result.success && result.data) {
				setSelectedFile(result.data);
				setDetailVisible(true);
			} else {
				message.error(result.msg || "获取文件详情失败");
			}
		} catch (error) {
			message.error("获取文件详情失败");
			console.error("获取文件详情失败:", error);
		} finally {
			setLoading(false);
		}
	};

	const columns = [
		{
			title: "文件名",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: FileDto) => <a onClick={() => showDetail(record)}>{text}</a>
		},
		{
			title: "大小",
			dataIndex: "size",
			key: "size",
			render: (size: number) => {
				if (size < 1024) return `${size} B`;
				if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
				return `${(size / (1024 * 1024)).toFixed(2)} MB`;
			}
		},
		{
			title: "类型",
			dataIndex: "contentType",
			key: "contentType"
		},
		{
			title: "存储类型",
			dataIndex: "storeType",
			key: "storeType",
			render: (type: FileStoreType) => {
				const typeMap = {
					[FileStoreType.LocalFile]: <Tag color="blue">本地文件</Tag>
				};
				return typeMap[type] || type;
			}
		},
		{
			title: "上传时间",
			dataIndex: "createTime",
			key: "createTime",
			render: (date: string) => moment(date).format("YYYY-MM-DD HH:mm:ss")
		},
		{
			title: "操作",
			key: "actions",
			width: 180,
			render: (_: any, record: FileDto) => (
				<Space size="middle">
					<Button type="primary" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record.id)}>
						下载
					</Button>
					<Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						删除
					</Button>
				</Space>
			)
		}
	];

	return (
		<Card /*title="文件管理"*/>
			<Form form={searchForm} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
				<Form.Item name="name" label="文件名">
					<Input placeholder="请输入文件名" allowClear />
				</Form.Item>
				<Form.Item name="description" label="描述">
					<Input placeholder="请输入描述" allowClear />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
					</Space>
				</Form.Item>
			</Form>

			<Space style={{ marginBottom: 8 }}>
				<FileUpload onSuccess={() => fetchFiles(searchForm.getFieldsValue())} />
			</Space>

			<Table
				columns={columns}
				dataSource={files}
				rowKey="id"
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				bordered={true}
			/>

			<FileDetail
				visible={detailVisible}
				file={selectedFile}
				onClose={() => setDetailVisible(false)}
				onDownload={handleDownload}
			/>
		</Card>
	);
};

export default FileList;
