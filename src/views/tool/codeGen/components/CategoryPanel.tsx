import React, { useState, useEffect } from "react";
import { Card, Button, Table, Radio, Space, Popconfirm, Modal, Form, Input, InputNumber, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";
import { CodeGenCategoryDto, addCategory, updateCategory, deleteCategory } from "@/services/tool/codeGenService";

const { TextArea } = Input;

interface CategoryPanelProps {
	categories: CodeGenCategoryDto[];
	selectedCategory: number | null;
	onSelectCategory: (id: number | null) => void;
	onRefresh: () => void;
	compact?: boolean;
}

/**
 * 代码分类面板
 */
const CategoryPanel: React.FC<CategoryPanelProps> = ({
	categories,
	selectedCategory,
	onSelectCategory,
	onRefresh,
	compact = false
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [editingCategory, setEditingCategory] = useState<CodeGenCategoryDto | null>(null);
	const [form] = Form.useForm();
	useEffect(() => {
		if (modalVisible) {
			if (editingCategory) {
				form.setFieldsValue(editingCategory);
			} else {
				form.resetFields();
			}
		}
	}, [modalVisible]);
	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			if (editingCategory) {
				await updateCategory({ ...values, id: editingCategory.id, state: editingCategory.state });
			} else {
				await addCategory(values);
			}
			message.success("保存成功");
			setModalVisible(false);
			onRefresh();
		} catch (error) {
			message.error("保存失败");
		}
	};
	const handleDelete = async (id: number) => {
		Modal.confirm({
			title: "确认删除",
			content: "确定要删除该分类吗？",
			onOk: async () => {
				try {
					await deleteCategory(id);
					message.success("删除成功");
					onRefresh();
				} catch (error) {
					message.error("删除失败");
				}
			}
		});
	};
	const openModal = (category?: CodeGenCategoryDto) => {
		setEditingCategory(category || null);
		setModalVisible(true);
	};
	const columns = [
		{
			title: "选择",
			dataIndex: "selected",
			key: "selected",
			width: compact ? 50 : 60,
			render: (_: any, record: CodeGenCategoryDto) => (
				<Radio checked={selectedCategory === record.id} onChange={() => onSelectCategory(record.id)} value={record.id} />
			)
		},
		{ title: "分类名称", dataIndex: "name", key: "name", width: compact ? 110 : 220 },
		{ title: "分类编码", dataIndex: "code", key: "code", width: compact ? 140 : 180 },
		...(!compact
			? [
					{
						title: "是否内置",
						dataIndex: "isBuiltIn",
						key: "isBuiltIn",
						width: 80,
						render: (val: boolean) => (val ? "是" : "否")
					}
			  ]
			: []),
		{
			title: "操作",
			key: "actions",
			width: 130,
			fixed: "right" as const,
			render: (_: any, record: CodeGenCategoryDto) => (
				<Space size="small">
					<Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
						编辑
					</Button>
					{!record.isBuiltIn && (
						<Popconfirm
							title="确认删除"
							description="确定要删除该分类吗？"
							onConfirm={() => handleDelete(record.id)}
							okText="确定"
							cancelText="取消"
						>
							<Button type="text" size="small" danger icon={<DeleteOutlined />}>
								删除
							</Button>
						</Popconfirm>
					)}
				</Space>
			)
		}
	];
	return (
		<>
			<Card
				title={
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<FolderOutlined style={{ fontSize: 16 }} />
						<span>代码模板分类</span>
					</div>
				}
				bordered
				style={{ marginBottom: 16, borderRadius: 8 }}
				extra={
					<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal()} title="新增分类">
						新增分类
					</Button>
				}
			>
				<Table
					dataSource={categories}
					columns={columns}
					rowKey="id"
					pagination={false}
					bordered={false}
					size="small"
					scroll={{ x: compact ? 530 : 730 }}
					onRow={record => ({
						onClick: () => onSelectCategory(record.id)
					})}
				/>
			</Card>

			<Modal
				title={editingCategory ? "编辑分类" : "新增分类"}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				onOk={handleSave}
				width={450}
			>
				<Form form={form} layout="vertical">
					<Form.Item label="分类名称" name="name" rules={[{ required: true }]}>
						<Input placeholder="请输入分类名称" />
					</Form.Item>
					<Form.Item label="分类编码" name="code" rules={[{ required: true }]}>
						<Input placeholder="请输入分类编码" />
					</Form.Item>
					<Form.Item label="排序号" name="sortOrder">
						<InputNumber style={{ width: "100%" }} placeholder="默认按创建顺序" />
					</Form.Item>
					<Form.Item label="描述" name="description">
						<TextArea rows={2} placeholder="请输入分类描述" />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};
export default CategoryPanel;
