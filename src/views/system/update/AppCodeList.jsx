import React from "react";
import { Button, Card, Form, Input, List, Modal, message, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import http from "../../../api";
import { PORT1 } from "../../../api/config/servicePort";
import { api } from "../../../actions/system/api";

/**
 * 应用标识列表组件 - 左侧面板
 * 功能：维护应用标识列表，支持新增/编辑/删除，点击选中联动右侧版本列表
 */
export default class AppCodeList extends React.Component {
	state = {
		list: [],
		addModalVisible: false,
		editModalVisible: false,
		editRecord: null
	};
	addFormRef = React.createRef();
	editFormRef = React.createRef();

	componentDidMount() {
		this.loadList();
	}

	componentDidUpdate(prevProps) {
		if (this.props.refreshKey !== prevProps.refreshKey) {
			this.loadList();
		}
	}

	loadList = async () => {
		try {
			const res = await http.get(PORT1 + api.appCode.activeList);
			if (res?.success) {
				this.setState({ list: res.data || [] });
			}
		} catch (err) {
			message.error("加载应用标识列表失败");
		}
	};

	handleSelect = item => {
		this.props.onSelect?.(item.code);
	};

	showAddModal = () => {
		this.setState({ addModalVisible: true });
	};

	hideAddModal = () => {
		this.setState({ addModalVisible: false });
	};

	handleAddOk = async () => {
		try {
			const values = await this.addFormRef.current?.validateFields();
			const res = await http.post(PORT1 + api.appCode.add, values);
			if (res?.success) {
				message.success("新增成功");
				this.hideAddModal();
				this.loadList();
			} else {
				message.error(res?.message || "新增失败");
			}
		} catch (err) {
			if (err.errorFields) return;
			message.error("操作失败: " + (err.message || ""));
		}
	};

	showEditModal = item => {
		this.setState({ editModalVisible: true, editRecord: item });
		setTimeout(() => {
			this.editFormRef.current?.setFieldsValue({
				code: item.code,
				name: item.name,
				description: item.description || ""
			});
		}, 0);
	};

	hideEditModal = () => {
		this.setState({ editModalVisible: false, editRecord: null });
	};

	handleEditOk = async () => {
		try {
			const values = await this.editFormRef.current?.validateFields();
			const res = await http.post(PORT1 + api.appCode.update, {
				id: this.state.editRecord.id,
				...values
			});
			if (res?.success) {
				message.success("编辑成功");
				this.hideEditModal();
				this.loadList();
				if (this.props.selectedAppCode === this.state.editRecord?.code) {
					this.props.onSelect?.(values.code);
				}
			} else {
				message.error(res?.message || "编辑失败");
			}
		} catch (err) {
			if (err.errorFields) return;
			message.error("操作失败: " + (err.message || ""));
		}
	};

	handleDelete = async item => {
		try {
			const res = await http.post(PORT1 + api.appCode.delete, { id: item.id });
			if (res?.success) {
				message.success("删除成功");
				if (this.props.selectedAppCode === item.code) {
					this.props.onSelect?.(null);
				}
				this.loadList();
			} else {
				message.error(res?.message || "删除失败");
			}
		} catch (err) {
			message.error("操作失败: " + (err.message || ""));
		}
	};

	render() {
		const { selectedAppCode } = this.props;
		const { list, addModalVisible, editModalVisible, editRecord } = this.state;

		return (
			<>
				<Card
					title="应用标识"
					size="small"
					extra={
						<Button type="primary" size="small" icon={<PlusOutlined />} onClick={this.showAddModal}>
							新增
						</Button>
					}
					bodyStyle={{ padding: 0 }}
				>
					<List
						size="small"
						dataSource={list}
						locale={{ emptyText: "暂无应用标识" }}
						renderItem={item => (
							<List.Item
								key={item.code}
								style={{
									cursor: "pointer",
									padding: "8px 12px",
									background: selectedAppCode === item.code ? "#e6f7ff" : "transparent",
									borderLeft: selectedAppCode === item.code ? "3px solid #1890ff" : "3px solid transparent"
								}}
								onClick={() => this.handleSelect(item)}
								actions={[
									<EditOutlined
										key="edit"
										style={{ color: "#1890ff" }}
										onClick={e => {
											e.stopPropagation();
											this.showEditModal(item);
										}}
									/>,
									<Popconfirm
										key="delete"
										title="确认删除？"
										onConfirm={e => {
											e?.stopPropagation();
											this.handleDelete(item);
										}}
										onCancel={e => e?.stopPropagation()}
									>
										<DeleteOutlined style={{ color: "#ff4d4f" }} onClick={e => e.stopPropagation()} />
									</Popconfirm>
								]}
							>
								<List.Item.Meta
									title={
										<span>
											{item.code}
											<Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
												{item.name}
											</Tag>
										</span>
									}
								/>
							</List.Item>
						)}
					/>
				</Card>

				{/* 新增应用标识弹窗 */}
				<Modal title="新增应用标识" open={addModalVisible} onCancel={this.hideAddModal} onOk={this.handleAddOk} destroyOnClose>
					<AppCodeForm ref={this.addFormRef} />
				</Modal>

				{/* 编辑应用标识弹窗 */}
				<Modal title="编辑应用标识" open={editModalVisible} onCancel={this.hideEditModal} onOk={this.handleEditOk} destroyOnClose>
					<AppCodeForm ref={this.editFormRef} isEdit={true} record={editRecord} />
				</Modal>
			</>
		);
	}
}

class AppCodeForm extends React.Component {
	formRef = React.createRef();

	validateFields = () => this.formRef.current?.validateFields();

	render() {
		const { isEdit, record } = this.props;
		return (
			<Form ref={this.formRef} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
				<Form.Item
					label="应用标识"
					name="code"
					rules={[
						{ required: true, message: "请输入应用标识" },
						{ pattern: /^[a-z0-9-]+$/, message: "仅支持小写字母、数字和连字符" }
					]}
					initialValue={record?.code || ""}
				>
					<Input placeholder="如: demo, tool-a" disabled={isEdit} />
				</Form.Item>
				<Form.Item
					label="显示名称"
					name="name"
					rules={[{ required: true, message: "请输入显示名称" }]}
					initialValue={record?.name || ""}
				>
					<Input placeholder="如: 演示客户端" />
				</Form.Item>
				<Form.Item label="描述" name="description" initialValue={record?.description || ""}>
					<Input placeholder="可选描述" />
				</Form.Item>
			</Form>
		);
	}
}
