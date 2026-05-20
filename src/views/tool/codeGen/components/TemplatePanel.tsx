import React, { useState, useEffect } from "react";
import { Card, Button, Table, Checkbox, Space, Popconfirm, Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CodeOutlined } from "@ant-design/icons";
import {
	CodeGenTemplateDto,
	CodeGenTemplateType,
	addTemplate,
	updateTemplate,
	deleteTemplate,
	CodeGenCategoryDto
} from "@/services/tool/codeGenService";

const { Option } = Select;
const { TextArea } = Input;

interface TemplatePanelProps {
	templates: CodeGenTemplateDto[];
	selectedTemplates: number[];
	selectedCategory: number | null;
	categories: CodeGenCategoryDto[];
	onSelectTemplate: (id: number, checked: boolean) => void;
	onSelectAll: () => void;
	onRefresh: () => void;
}

/**
 * 代码模板面板
 */
const TemplatePanel: React.FC<TemplatePanelProps> = ({
	templates,
	selectedTemplates,
	selectedCategory,
	categories,
	onSelectTemplate,
	onSelectAll,
	onRefresh
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<CodeGenTemplateDto | null>(null);
	const [form] = Form.useForm();
	const isAllSelected = templates.length > 0 && templates.every(t => selectedTemplates.includes(t.id));
	useEffect(() => {
		if (modalVisible) {
			if (editingTemplate) {
				form.setFieldsValue(editingTemplate);
			} else {
				form.resetFields();
				form.setFieldsValue({ categoryId: selectedCategory || undefined });
			}
		}
	}, [modalVisible]);
	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			if (editingTemplate) {
				await updateTemplate({ ...values, id: editingTemplate.id });
			} else {
				await addTemplate({ ...values, state: 1 });
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
			content: "确定要删除该代码模板吗？",
			onOk: async () => {
				try {
					await deleteTemplate(id);
					message.success("删除成功");
					onRefresh();
				} catch (error) {
					message.error("删除失败");
				}
			}
		});
	};
	const openModal = (template?: CodeGenTemplateDto) => {
		setEditingTemplate(template || null);
		setModalVisible(true);
	};
	const columns = [
		{
			title: "选择",
			dataIndex: "selected",
			key: "selected",
			width: 50,
			render: (_: any, record: CodeGenTemplateDto) => (
				<Checkbox checked={selectedTemplates.includes(record.id)} onChange={e => onSelectTemplate(record.id, e.target.checked)} />
			)
		},
		{ title: "模板名称", dataIndex: "name", key: "name" },
		{ title: "模板编码", dataIndex: "code", key: "code", width: 120 },
		{ title: "文件路径", dataIndex: "filePath", key: "filePath", width: 250 },
		{
			title: "是否默认",
			dataIndex: "isDefault",
			key: "isDefault",
			width: 80,
			render: (val: boolean) => (val ? "是" : "否")
		},
		{
			title: "操作",
			key: "actions",
			width: 120,
			render: (_: any, record: CodeGenTemplateDto) => (
				<Space size="small">
					<Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
						编辑
					</Button>
					{record.templateType !== CodeGenTemplateType.BuiltIn && (
						<Popconfirm
							title="确认删除"
							description="确定要删除该模板吗？"
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
						<CodeOutlined style={{ fontSize: 16 }} />
						<span>代码模板</span>
					</div>
				}
				bordered
				style={{ marginBottom: 16, borderRadius: 8 }}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
					<div style={{ display: "flex", alignItems: "center" }}>
						<Checkbox checked={isAllSelected} onChange={onSelectAll} />
						<span style={{ marginLeft: 8, fontSize: 13 }}>{isAllSelected ? "取消全选" : "全选"}</span>
						<span style={{ marginLeft: 16, fontSize: 12, color: "#999" }}>已选择 {selectedTemplates.length} 个模板</span>
					</div>
					<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal()}>
						新增模板
					</Button>
				</div>
				{selectedCategory ? (
					<Table
						dataSource={templates}
						columns={columns}
						rowKey="id"
						pagination={{ pageSize: 5 }}
						bordered={false}
						size="small"
					/>
				) : (
					<div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
						<CodeOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
						<p style={{ marginBottom: 8 }}>请先选择代码模板分类</p>
						<p style={{ fontSize: 12 }}>选择分类后将显示该分类下的模板</p>
					</div>
				)}
			</Card>

			<Modal
				title={editingTemplate ? "编辑代码模板" : "新增代码模板"}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				onOk={handleSave}
				width={850}
			>
				<Form form={form} layout="vertical">
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						<Form.Item label="模板名称" name="name" rules={[{ required: true }]}>
							<Input placeholder="请输入模板名称" />
						</Form.Item>
						<Form.Item label="模板编码" name="code" rules={[{ required: true }]}>
							<Input placeholder="请输入模板编码" />
						</Form.Item>
						<Form.Item label="所属分类" name="categoryId" rules={[{ required: true }]}>
							<Select placeholder="请选择分类">
								{categories?.map(cat => (
									<Option key={cat.id} value={cat.id}>
										{cat.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item label="文件路径" name="filePath" rules={[{ required: true }]}>
							<Input placeholder="如：controller/{{ClassName}}Controller.java" />
						</Form.Item>
						<Form.Item label="排序号" name="sortOrder" initialValue={0}>
							<Input type="number" placeholder="请输入排序号" />
						</Form.Item>
						<Form.Item label="是否默认" name="isDefault" valuePropName="checked">
							<Checkbox>设为默认模板</Checkbox>
						</Form.Item>
					</div>
					<Form.Item label="模板内容" name="content" rules={[{ required: true }]}>
						<TextArea rows={15} placeholder="请输入模板内容，支持 Handlebars 语法" />
					</Form.Item>
					<Form.Item label="描述" name="description">
						<TextArea rows={2} placeholder="请输入模板描述" />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};
export default TemplatePanel;
