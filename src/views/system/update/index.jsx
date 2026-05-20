import React from "react";
import { Button, Card, Col, Empty, Form, Input, Row, Select, Space, Tag } from "antd";
import dayjs from "dayjs";
import http from "../../../api";
import { PORT1 } from "../../../api/config/servicePort";
import StandardTable from "../../../components/StandardTable";
import AppCodeList from "./AppCodeList";
import VersionAdd from "./VersionAdd";
import VersionEdit from "./VersionEdit";
import VersionDetail from "./VersionDetail";
import { api } from "../../../actions/system/api";

/**
 * 更新管理 - 主页面（左右分栏布局）
 * 左侧：应用标识维护组件（AppCodeList）
 * 右侧：客户端版本维护组件（StandardTable）
 * 选中左侧应用标识后，右侧自动联动查询该应用下的版本列表
 */
export default class UpdateList extends React.Component {
	searchFormRef = React.createRef();
	standardTableRef = React.createRef();

	state = {
		selectedAppCode: null,
		refreshKey: 0,
		addModalVisible: false,
		updateModalVisible: false,
		detailModalVisible: false,
		currentRecord: null
	};

	handleAppCodeSelect = appCode => {
		this.setState({ selectedAppCode: appCode });
	};

	handleAppCodeChange = () => {
		this.setState({ refreshKey: this.state.refreshKey + 1 });
	};

	refreshTable = () => {
		this.standardTableRef.current?.handleSearch();
	};

	showAddModal = () => {
		this.setState({ addModalVisible: true });
	};

	hideAddModal = () => {
		this.setState({ addModalVisible: false });
	};

	handleAddFinish = () => {
		this.hideAddModal();
		this.refreshTable();
	};

	fetchAndShowUpdateModal = async record => {
		try {
			const res = await http.get(PORT1 + api.update.detail, { id: record.id });
			if (res?.success) {
				this.setState({
					currentRecord: res.data,
					updateModalVisible: true
				});
			}
		} catch (err) {
			console.error("获取版本详情失败", err);
		}
	};

	hideUpdateModal = () => {
		this.setState({ updateModalVisible: false, currentRecord: null });
	};

	handleUpdateFinish = () => {
		this.hideUpdateModal();
		this.refreshTable();
	};

	fetchAndShowDetailModal = async record => {
		try {
			const res = await http.get(PORT1 + api.update.detail, { id: record.id });
			if (res?.success) {
				this.setState({
					currentRecord: res.data,
					detailModalVisible: true
				});
			}
		} catch (err) {
			console.error("获取版本详情失败", err);
		}
	};

	hideDetailModal = () => {
		this.setState({ detailModalVisible: false, currentRecord: null });
	};

	/**
	 * 渲染搜索表单：
	 * - 按版本号模糊搜索
	 * - 按平台筛选
	 */
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={5} sm={24}>
					<Form.Item label="版本号" name="versionName">
						<Input placeholder="请输入版本号" />
					</Form.Item>
				</Col>
				<Col md={5} sm={24}>
					<Form.Item label="平台" name="platform">
						<Select placeholder="请选择平台" allowClear>
							<Select.Option value="win-x64">win-x64</Select.Option>
							<Select.Option value="win-x86">win-x86</Select.Option>
							<Select.Option value="linux-x64">linux-x64</Select.Option>
							<Select.Option value="osx-x64">osx-x64</Select.Option>
						</Select>
					</Form.Item>
				</Col>
				<Col>
					<div style={{ float: "right" }}>
						<Button type="primary" htmlType="submit">
							查询
						</Button>
						<Button style={{ marginLeft: 8 }} onClick={onSearchFormReset}>
							重置
						</Button>
					</div>
				</Col>
			</Row>
		);
	};

	/**
	 * 渲染自定义按钮：新增、删除按钮（完全由父组件控制顺序）
	 */
	renderCustomTableButton = () => {
		return (
			<Space>
				<Button onClick={this.showAddModal} type="primary">
					新增
				</Button>
				<Button onClick={this.handleBatchDelete} type="primary" danger>
					删除
				</Button>
			</Space>
		);
	};

	/** 批量删除：父组件直接实现 */
	handleBatchDelete = async () => {
		const { Modal, message } = await import("antd");
		const selectedKeys = this.standardTableRef.current?.state?.selectedRowKeys || [];
		if (selectedKeys.length === 0) {
			message.info("请先选择要删除的数据");
			return;
		}

		Modal.confirm({
			title: "确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				try {
					const res = await http.post(PORT1 + api.update.delete, { ids: selectedKeys });
					if (res?.success) {
						message.success("删除成功");
						this.refreshTable();
					} else {
						message.error(res?.msg || "删除失败");
					}
				} catch (err) {
					message.error("删除异常");
				}
			}
		});
	};

	/**
	 * 渲染行操作按钮：编辑、删除、查看
	 */
	renderRecordOperate = record => {
		return (
			<Space>
				<span onClick={() => this.fetchAndShowUpdateModal(record)} style={{ cursor: "pointer", color: "#2378f7" }}>
					编辑
				</span>
				<span onClick={() => this.handleSingleDelete(record)} style={{ cursor: "pointer", color: "#2378f7" }}>
					删除
				</span>
				<span onClick={() => this.fetchAndShowDetailModal(record)} style={{ cursor: "pointer", color: "#2378f7" }}>
					查看
				</span>
			</Space>
		);
	};

	/** 单行删除：父组件直接实现 */
	handleSingleDelete = async record => {
		const { Modal, message } = await import("antd");
		Modal.confirm({
			title: "确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				try {
					const res = await http.post(PORT1 + api.update.delete, { id: record.id });
					if (res?.success) {
						message.success("删除成功");
						this.refreshTable();
					} else {
						message.error(res?.msg || "删除失败");
					}
				} catch (err) {
					message.error("删除异常");
				}
			}
		});
	};

	/** 将搜索表单的值转换为API查询参数 */
	handleSearchValues = fields => {
		// const { pageNumber, pageSize } = this.standardTableRef.current?.state || {};
		return {
			// pageNumber: pageNumber || 1,
			// pageSize: pageSize || 20,
			appCode: this.state.selectedAppCode,
			...fields
		};
	};

	render() {
		const { selectedAppCode, refreshKey, addModalVisible, updateModalVisible, detailModalVisible, currentRecord } = this.state;
		const columns = [
			{ title: "应用标识", dataIndex: "appCode", align: "center", width: 100 },
			{ title: "版本号", dataIndex: "versionName", align: "left", width: 120 },
			{ title: "内部版本号", dataIndex: "versionCode", align: "center", width: 100 },
			{ title: "平台", dataIndex: "platform", align: "center", width: 100 },
			{ title: "文件数", dataIndex: "fileCount", align: "center", width: 80 },
			{
				/** 更新包大小：自动格式化为B/KB/MB */
				title: "更新包大小",
				dataIndex: "totalSize",
				align: "right",
				width: 120,
				render: text => {
					if (!text) return "-";
					if (text < 1024) return `${text} B`;
					if (text < 1024 * 1024) return `${(text / 1024).toFixed(1)} KB`;
					return `${(text / (1024 * 1024)).toFixed(2)} MB`;
				}
			},
			{
				/** 强制更新标志：是(红) / 否(默认) */
				title: "强制更新",
				dataIndex: "isForceUpdate",
				align: "center",
				width: 80,
				render: text => (text ? <Tag color="red">是</Tag> : <Tag color="default">否</Tag>)
			},
			{
				title: "发布时间",
				dataIndex: "publishTime",
				align: "center",
				width: 170,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-")
			}
		];

		return (
			<Row gutter={16}>
				<Col span={4}>
					<AppCodeList selectedAppCode={selectedAppCode} onSelect={this.handleAppCodeSelect} refreshKey={refreshKey} />
				</Col>
				<Col span={20}>
					{selectedAppCode ? (
						<>
							<VersionAdd
								modalVisible={addModalVisible}
								onCancel={this.hideAddModal}
								onFinish={this.handleAddFinish}
								selectedAppCode={selectedAppCode}
							/>
							<VersionEdit
								modalVisible={updateModalVisible}
								onCancel={this.hideUpdateModal}
								onFinish={this.handleUpdateFinish}
								record={currentRecord}
							/>
							<VersionDetail modalVisible={detailModalVisible} onCancel={this.hideDetailModal} record={currentRecord} />
							<StandardTable
								ref={this.standardTableRef}
								key={selectedAppCode}
								code={"system.update"}
								searchFormRef={this.searchFormRef}
								columns={columns}
								renderSearchForm={this.renderSearchForm}
								renderModal={() => null}
								renderCustomTableButton={this.renderCustomTableButton}
								renderRecordOperate={this.renderRecordOperate}
								handleSearchValues={this.handleSearchValues}
								// apiDelete={api.update.delete}
								apiUpdateState={api.update.updateState}
								apiPage={api.update.page}
								recordOperateColWidth={135}
							/>
						</>
					) : (
						<Card>
							<Empty description="请先在左侧选择一个应用标识" style={{ padding: "80px 0" }} />
						</Card>
					)}
				</Col>
			</Row>
		);
	}
}
