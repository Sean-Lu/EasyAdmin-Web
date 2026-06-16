import React, { useState, useEffect } from "react";
import { Card, Button, Table, Radio, Space, Popconfirm, Modal, Form, Input, Select, InputNumber, Checkbox, message } from "antd";
import { PlusOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { BackendId, BackendIdInput } from "@/api/interface";
import {
	DbConnectionConfigDto,
	CodeGenDbType,
	addDbConfig,
	updateDbConfig,
	deleteDbConfig,
	testDbConnection
} from "@/services/tool/codeGenService";

const { Option } = Select;

interface DbConfigPanelProps {
	dbConfigs: DbConnectionConfigDto[];
	selectedDbConfig: BackendId | null;
	onSelectDbConfig: (id: BackendId) => void;
	onRefresh: () => void;
}

/**
 * 数据库配置面板
 */
const DbConfigPanel: React.FC<DbConfigPanelProps> = ({ dbConfigs, selectedDbConfig, onSelectDbConfig, onRefresh }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [editingConfig, setEditingConfig] = useState<DbConnectionConfigDto | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		if (modalVisible) {
			if (editingConfig) {
				form.setFieldsValue({ ...editingConfig, password: editingConfig.password || "" });
			} else {
				form.resetFields();
			}
		}
	}, [modalVisible]);

	const handleTestConnection = async (id: BackendIdInput) => {
		try {
			await testDbConnection(id);
			message.success("数据库连接成功");
		} catch (error) {
			message.error("数据库连接失败");
		}
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			if (editingConfig) {
				await updateDbConfig({ ...values, id: editingConfig.id });
			} else {
				await addDbConfig(values);
			}
			message.success("保存成功");
			setModalVisible(false);
			onRefresh();
		} catch (error) {
			message.error("保存失败");
		}
	};

	const handleDelete = async (id: BackendIdInput) => {
		Modal.confirm({
			title: "确认删除",
			content: "确定要删除该数据库配置吗？",
			onOk: async () => {
				try {
					await deleteDbConfig(id);
					message.success("删除成功");
					onRefresh();
				} catch (error) {
					message.error("删除失败");
				}
			}
		});
	};

	const openModal = (config?: DbConnectionConfigDto) => {
		setEditingConfig(config || null);
		setModalVisible(true);
	};

	const columns = [
		{
			title: "选择",
			dataIndex: "selected",
			key: "selected",
			width: 60,
			render: (_: any, record: DbConnectionConfigDto) => (
				<Radio checked={selectedDbConfig === record.id} onClick={() => onSelectDbConfig(record.id)} />
			)
		},
		{ title: "配置名称", dataIndex: "name", key: "name", width: 100 },
		{
			title: "数据库类型",
			dataIndex: "dbType",
			key: "dbType",
			width: 100,
			render: (type: number) => ["MySQL", "SQL Server", "PostgreSQL"][type]
		},
		// { title: "主机", dataIndex: "host", key: "host", width: 80 },
		// { title: "数据库", dataIndex: "database", key: "database", width: 80 },
		{
			title: "操作",
			key: "actions",
			width: 260,
			fixed: "right" as const,
			render: (_: any, record: DbConnectionConfigDto) => (
				<Space size="small">
					<Button type="text" size="small" icon={<CheckCircleOutlined />} onClick={() => handleTestConnection(record.id)}>
						测试连接
					</Button>
					<Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
						编辑
					</Button>
					<Popconfirm
						title="确认删除"
						description="确定要删除该数据库配置吗？"
						onConfirm={() => handleDelete(record.id)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="text" size="small" danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<>
			<Card
				title={
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<DatabaseOutlined style={{ fontSize: 16 }} />
						<span>数据库配置</span>
					</div>
				}
				bordered
				style={{ marginBottom: 16, borderRadius: 8 }}
				extra={
					<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal()}>
						新增配置
					</Button>
				}
			>
				<Table
					dataSource={dbConfigs}
					columns={columns}
					rowKey="id"
					pagination={{ pageSize: 4 }}
					bordered={false}
					scroll={{ x: "max-content" }}
					size="small"
				/>
			</Card>

			<Modal
				title={editingConfig ? "编辑数据库配置" : "新增数据库配置"}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				onOk={handleSave}
				width={500}
			>
				<Form form={form} layout="vertical">
					<Form.Item label="配置名称" name="name" rules={[{ required: true }]}>
						<Input placeholder="请输入配置名称" />
					</Form.Item>
					<Form.Item label="数据库类型" name="dbType" rules={[{ required: true }]}>
						<Select placeholder="请选择数据库类型">
							<Option value={CodeGenDbType.MySql}>MySQL</Option>
							<Option value={CodeGenDbType.SqlServer}>SQL Server</Option>
							<Option value={CodeGenDbType.PostgreSql}>PostgreSQL</Option>
						</Select>
					</Form.Item>
					<Form.Item label="主机" name="host" rules={[{ required: true }]}>
						<Input placeholder="localhost" />
					</Form.Item>
					<Form.Item label="端口" name="port" rules={[{ required: true }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="数据库名" name="database" rules={[{ required: true }]}>
						<Input placeholder="请输入数据库名称" />
					</Form.Item>
					<Form.Item label="用户名" name="username" rules={[{ required: true }]}>
						<Input placeholder="root" />
					</Form.Item>
					<Form.Item label="密码" name="password">
						<Input.Password placeholder={editingConfig?.password ? "已设置密码，留空则不修改" : "请输入密码"} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default DbConfigPanel;
