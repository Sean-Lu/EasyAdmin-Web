import React from "react";
import { Button, Form, Input, InputNumber, message, Modal, Table, Switch } from "antd";
import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

// 字典数据管理弹窗
export default class DictTypeDataManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataList: [],
			loading: false,
			searchValue: "",
			addModalVisible: false,
			updateModalVisible: false,
			currentRecord: null
		};
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible && this.props.record) {
			this.loadDataList();
		}
	}

	loadDataList = async () => {
		if (!this.props.record?.id) {
			return;
		}

		this.setState({ loading: true });
		try {
			const res = await axios.get(api.dictData.page, {
				dictTypeId: this.props.record.id,
				all: true
			});

			if (res.success) {
				this.setState({ dataList: res.data?.list || [] });
			}
		} catch (err) {
			console.log("查询字典数据异常", err);
		} finally {
			this.setState({ loading: false });
		}
	};

	// 删除
	handleDelete = async id => {
		try {
			const res = await axios.post(api.dictData.delete, { id });
			if (res.success) {
				message.success("删除成功");
				this.loadDataList();
			} else {
				message.error(res.message || "删除失败");
			}
		} catch (err) {
			console.log("删除字典数据异常", err);
			message.error("删除字典数据异常");
		}
	};

	// 更新状态
	handleUpdateState = async (checked, record) => {
		let state = checked ? 1 : 0;
		try {
			const res = await axios.post(api.dictData.updateState, {
				id: record.id,
				state: state
			});
			if (res.success) {
				message.success("操作成功");
				this.loadDataList();
			} else {
				message.error(res.message || "操作失败");
			}
		} catch (err) {
			console.log("更新字典数据异常", err);
			message.error("更新字典数据异常");
			this.loadDataList();
		}
	};

	// 新增
	handleAdd = async values => {
		try {
			const res = await axios.post(api.dictData.add, {
				...values,
				dictTypeId: this.props.record.id
			});
			if (res.success) {
				message.success("新增成功");
				this.setState({ addModalVisible: false });
				this.loadDataList();
			} else {
				message.error(res.message || "新增失败");
			}
		} catch (err) {
			console.log("新增字典数据异常", err);
			message.error("新增字典数据异常");
		}
	};

	// 编辑
	handleUpdate = async values => {
		try {
			const res = await axios.post(api.dictData.update, {
				...values,
				id: this.state.currentRecord.id
			});
			if (res.success) {
				message.success("修改成功");
				this.setState({ updateModalVisible: false });
				this.loadDataList();
			} else {
				message.error(res.message || "修改失败");
			}
		} catch (err) {
			console.log("修改字典数据异常", err);
			message.error("修改字典数据异常");
		}
	};

	render() {
		const columns = [
			{
				title: "字典键值",
				dataIndex: "dictKey",
				width: 100,
				align: "center"
			},
			{
				title: "字典值",
				dataIndex: "dictValue",
				align: "center"
			},
			{
				title: "排序",
				dataIndex: "sort",
				width: 80,
				align: "center"
			},
			{
				title: "状态",
				dataIndex: "state",
				width: 100,
				align: "center",
				render: (text, record) => {
					return (
						<Switch
							checkedChildren="启用"
							unCheckedChildren="禁用"
							checked={text === 1}
							onChange={checked => this.handleUpdateState(checked, record)}
						/>
					);
				}
			},
			{
				title: "操作",
				width: 150,
				align: "center",
				render: (_, record) => {
					return (
						<>
							<span
								onClick={() => this.setState({ updateModalVisible: true, currentRecord: record })}
								style={{ color: "#1890ff", cursor: "pointer", marginRight: 10 }}
							>
								编辑
							</span>
							<span onClick={() => this.handleDelete(record.id)} style={{ color: "#ff4d4f", cursor: "pointer" }}>
								删除
							</span>
						</>
					);
				}
			}
		];

		return (
			<>
				<Modal
					open={this.props.modalVisible}
					onCancel={this.props.onCancel}
					width={900}
					title={`管理字典数据 - ${this.props.record?.name}`}
					footer={[
						<Button key="cancel" onClick={this.props.onCancel}>
							关闭
						</Button>,
						<Button key="add" type="primary" onClick={() => this.setState({ addModalVisible: true })}>
							新增数据
						</Button>
					]}
				>
					<div style={{ marginBottom: 16 }}>
						<Input.Search
							placeholder="搜索字典值"
							onSearch={value => this.setState({ searchValue: value })}
							allowClear
							style={{ width: 300 }}
						/>
					</div>

					<Table
						dataSource={
							this.state.searchValue
								? this.state.dataList.filter(item => item.dictValue?.indexOf(this.state.searchValue) > -1)
								: this.state.dataList
						}
						columns={columns}
						loading={this.state.loading}
						rowKey="id"
						pagination={false}
						bordered={true}
					/>
				</Modal>

				{/* 新增字典数据 */}
				<DictDataAdd
					modalVisible={this.state.addModalVisible}
					onCancel={() => this.setState({ addModalVisible: false })}
					onSubmit={this.handleAdd}
				/>

				{/* 编辑字典数据 */}
				{this.state.currentRecord && (
					<DictDataEdit
						modalVisible={this.state.updateModalVisible}
						onCancel={() => this.setState({ updateModalVisible: false })}
						onSubmit={this.handleUpdate}
						record={this.state.currentRecord}
					/>
				)}
			</>
		);
	}
}

// 字典数据新增弹窗
class DictDataAdd extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit } = this.props;
		return (
			<Modal open={modalVisible} title="新增字典数据" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onSubmit}
					initialValues={{ sort: 1, state: 1 }}
				>
					<Form.Item
						name="dictKey"
						label="字典键值"
						rules={[
							{
								required: true,
								message: "请输入字典键值"
							}
						]}
					>
						<InputNumber style={{ width: "100%" }} placeholder="请输入字典键值" />
					</Form.Item>
					<Form.Item
						name="dictValue"
						label="字典值"
						rules={[
							{
								required: true,
								message: "请输入字典值"
							}
						]}
					>
						<Input placeholder="请输入字典值" />
					</Form.Item>
					<Form.Item name="sort" label="排序">
						<InputNumber min={1} />
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
}

// 字典数据编辑弹窗
class DictDataEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit, record } = this.props;
		return (
			<Modal open={modalVisible} title="修改字典数据" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal" onFinish={onSubmit} initialValues={record}>
					<Form.Item
						name="dictKey"
						label="字典键值"
						rules={[
							{
								required: true,
								message: "请输入字典键值"
							}
						]}
					>
						<InputNumber style={{ width: "100%" }} placeholder="请输入字典键值" />
					</Form.Item>
					<Form.Item
						name="dictValue"
						label="字典值"
						rules={[
							{
								required: true,
								message: "请输入字典值"
							}
						]}
					>
						<Input placeholder="请输入字典值" />
					</Form.Item>
					<Form.Item name="sort" label="排序">
						<InputNumber min={1} />
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
}
