import React from "react";
import { Button, Card, Col, Form, message, Modal, Pagination, Row, Space, Table, Switch } from "antd";
// import { DeleteOutlined, EditOutlined, UnorderedListOutlined } from "@ant-design/icons";

import moment from "moment";

import axios from "../../api/index";

import "./index.less";

class StandardTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			pageNumber: 1, // 当前页
			pageSize: 10, // 每页的数量
			total: 0, // 总条数
			data: [], // 接收数据
			addModalVisible: false, // 是否显示新增信息弹窗
			updateModalVisible: false, // 是否显示编辑信息弹窗
			detailModalVisible: false, // 是否显示查看信息弹窗
			selectedRowKeys: [], // 用于保存用户选择的行的Key
			record: {} // 当前编辑或查看的对象
		};

		this.OnSearchFormFinish = this.OnSearchFormFinish.bind(this);
		this.handleFormReset = this.handleFormReset.bind(this);
	}

	componentDidMount() {
		this.handleSearch();
	}

	// 显示新增信息弹窗
	showAddModal = () => {
		axios
			.post("/auth/checkToken")
			.then(res => {
				// 在弹窗之前校验token是否过期，避免填完信息后因为token过期导致保存失败
				if (res.success === true && res.data.expired === true) {
					message.info("登录失效，请您重新登录！");
					window.location.hash = "/login";
					return;
				}

				this.setState({
					addModalVisible: true
				});
			})
			.catch(err => {
				console.log("校验token是否过期异常", err);
			});
	};
	// 隐藏新增信息弹窗
	hideAddModal = () => {
		this.setState({
			addModalVisible: false
		});
	};

	// 新增
	onAddFinish = values => {
		const { apiAdd, handleAddValues } = this.props;
		axios
			.post(apiAdd, {
				...(handleAddValues ? handleAddValues(values) : values)
			})
			.then(res => {
				if (res.success === true) {
					this.hideAddModal();
					message.success("操作成功");
					this.handleSearch();
				}
			})
			.catch(err => {
				console.log("新增异常", err);
			});
	};

	// 显示编辑信息弹窗
	showUpdateModal(text, record, index) {
		const { apiDetail } = this.props;
		axios
			.get(apiDetail, {
				id: record.id
			})
			.then(res => {
				if (res.success === true) {
					this.setState({
						updateModalVisible: true,
						record: res.data
					});
				}
			})
			.catch(err => {
				console.log("查询详情异常", err);
			});
	}
	// 隐藏编辑信息弹窗
	hideUpdateModal = () => {
		this.setState({
			updateModalVisible: false,
			record: {}
		});
	};

	// 编辑
	onUpdateFinish = values => {
		const { apiUpdate, handleUpdateValues } = this.props;
		axios
			.post(apiUpdate, {
				...this.state.record,
				...(handleUpdateValues ? handleUpdateValues(values) : values)
			})
			.then(res => {
				if (res.success === true) {
					this.hideUpdateModal();
					message.success("操作成功");
					this.handleSearch();
				}
			})
			.catch(err => {
				console.log("修改异常", err);
			});
	};

	// 显示查看详情弹窗
	showDetailModal = (text, record, index) => {
		const { apiDetail } = this.props;
		axios
			.get(apiDetail, {
				id: record.id
			})
			.then(res => {
				if (res.success === true) {
					this.setState({
						detailModalVisible: true,
						record: res.data
					});
				}
			})
			.catch(err => {
				console.log("查询详情异常", err);
			});
	};
	// 隐藏查看详情弹窗
	hideDetailModal = () => {
		this.setState({
			detailModalVisible: false,
			record: {}
		});
	};

	// 删除
	deleteItem = (text, record, index) => {
		const { apiDelete } = this.props;
		const refThis = this;
		Modal.confirm({
			title: "是否确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			// 点击确认触发
			onOk() {
				axios
					.post(apiDelete, {
						id: record.id
					})
					.then(res => {
						if (res.data === true) {
							message.success("操作成功");
							refThis.handleSearch();
						}
					})
					.catch(err => {
						console.log("删除异常", err);
						refThis.handleSearch(); // 刷新
					});
			},
			// 点击取消触发
			onCancel() {}
		});
	};

	// 批量删除
	deleteItems = () => {
		const { apiDelete } = this.props;
		const { selectedRowKeys } = this.state;
		const hasSelected = selectedRowKeys.length > 0;
		if (!hasSelected) {
			message.info("请先选择要操作的数据！");
			return;
		}

		const refThis = this;
		Modal.confirm({
			title: "是否确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			// 点击确认触发
			onOk() {
				axios
					.post(apiDelete, {
						ids: selectedRowKeys
					})
					.then(res => {
						if (res.data === true) {
							refThis.setState({ selectedRowKeys: [] });
							message.success("操作成功");
							refThis.handleSearch();
						}
					})
					.catch(err => {
						console.log("批量删除异常", err);
						refThis.handleSearch(); // 刷新
					});
			},
			// 点击取消触发
			onCancel() {}
		});
	};

	// 分页操作
	onChangePage = (page, pageSize) => {
		new Promise((resolve, reject) => {
			this.setState({
				pageNumber: page,
				pageSize: pageSize
			});
			resolve();
		}).then(() => {
			this.handleSearch();
		});
	};

	OnSearchFormFinish = values => {
		this.handleSearch();
	};

	/** 查询 */
	handleSearch = () => {
		const { apiPage, apiList, disablePageSearch } = this.props;
		if (apiPage !== undefined && (disablePageSearch === undefined || disablePageSearch === false)) {
			// 分页查询
			axios
				.get(apiPage, {
					pageNumber: this.state.pageNumber,
					pageSize: this.state.pageSize,
					...this.getSearchFields()
				})
				.then(res => {
					if (res.success === true) {
						this.setState({
							data: res.data.list,
							total: res.data.total
						});
					}
				})
				.catch(err => {
					console.log("查询列表异常", err);
				});
		} else if (apiList !== undefined) {
			// 列表查询（不分页）
			axios
				.get(apiList, {
					...this.getSearchFields()
				})
				.then(res => {
					if (res.success === true) {
						this.setState({
							data: res.data
						});
					}
				})
				.catch(err => {
					console.log("查询列表异常", err);
				});
		}
	};

	getSearchFields = () => {
		const { searchFormRef, handleSearchValues } = this.props;
		const fields = searchFormRef.current.getFieldsValue();
		return handleSearchValues ? handleSearchValues(fields) : fields;
	};

	/** 重置 */
	handleFormReset = async () => {
		const { searchFormRef, onSearchFormReset } = this.props;
		searchFormRef.current.resetFields();
		await this.setState({
			pageNumber: 1,
			pageSize: this.state.pageSize
		});
		if (onSearchFormReset) {
			onSearchFormReset();
		}
		this.handleSearch();
	};

	// 选中项发生变化时的回调
	onSelectChange = (selectedRowKeys, selectedRows) => {
		// console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
		this.setState({ selectedRowKeys });
	};

	// 切换状态
	handleUpdateState = (checked, record) => {
		const { apiUpdateState } = this.props;
		let state = checked ? 1 : 0;
		axios
			.post(apiUpdateState, {
				id: record.id,
				state: state
			})
			.then(res => {
				if (res.data === true) {
					message.success("操作成功");
					this.handleSearch();
				}
			})
			.catch(err => {
				console.log("切换状态异常", err);
				this.handleSearch(); // 刷新
			});
	};

	render() {
		const {
			searchFormRef,
			renderSearchForm,
			renderModal,
			renderCustomTableButton,
			renderRecordOperate,
			recordOperateColWidth,
			apiAdd,
			apiDelete,
			apiUpdate,
			apiDetail,
			apiUpdateState,
			disablePageSearch
		} = this.props;
		let { columns } = this.props;
		let extColums = [];
		if (apiUpdateState !== undefined) {
			extColums.push({
				title: "状态",
				dataIndex: "state",
				align: "center",
				width: 80,
				render: (text, record) => {
					return (
						<Switch
							checkedChildren="启用"
							unCheckedChildren="禁用"
							checked={text}
							onChange={checked => this.handleUpdateState(checked, record)}
						/>
					);
				}
			});
		}
		extColums = extColums.concat([
			{
				title: "创建时间",
				dataIndex: "createTime",
				align: "center",
				width: 150,
				render: text => {
					return {
						children: text !== null ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
					};
				}
			},
			{
				title: "更新时间",
				dataIndex: "updateTime",
				align: "center",
				width: 150,
				render: text => {
					return {
						children: text !== null ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
					};
				}
			},
			{
				title: "操作",
				key: "operation",
				fixed: "right",
				align: "center",
				width: recordOperateColWidth ?? 130,
				render: (text, record, index) => (
					<Space
						style={{
							cursor: "pointer",
							color: "#2378f7"
							// fontSize: "15px"
						}}
						// split={<Divider type="vertical" />}
					>
						{apiUpdate !== undefined && (
							<span onClick={() => this.showUpdateModal(text, record, index)}>
								编辑
								{/* <EditOutlined /> */}
							</span>
						)}
						{apiDelete !== undefined && (
							<span onClick={() => this.deleteItem(text, record, index)}>
								删除
								{/* <DeleteOutlined /> */}
							</span>
						)}
						{apiDetail !== undefined && (
							<span onClick={() => this.showDetailModal(text, record, index)}>
								查看
								{/* <UnorderedListOutlined /> */}
							</span>
						)}
						{renderRecordOperate !== undefined && renderRecordOperate(record)}
					</Space>
				)
			}
		]);
		columns = [...columns, ...extColums];

		const { selectedRowKeys } = this.state;
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
			getCheckboxProps: record => ({
				disabled: record.disabled
			})
		};

		return (
			<>
				{renderModal(
					this.state.record,
					this.state.addModalVisible,
					this.hideAddModal,
					this.onAddFinish,
					this.state.updateModalVisible,
					this.hideUpdateModal,
					this.onUpdateFinish,
					this.state.detailModalVisible,
					this.hideDetailModal
				)}
				<Row>
					<Col span={24}>
						<Card bordered={false}>
							{/* 查询表单 */}
							<Form ref={searchFormRef} onFinish={this.OnSearchFormFinish}>
								{renderSearchForm(this.handleFormReset)}
							</Form>
							{(apiAdd !== undefined || apiDelete !== undefined) && (
								<Space style={{ marginBottom: 8 }}>
									{apiAdd !== undefined && (
										<Button onClick={this.showAddModal} type="primary">
											新增
										</Button>
									)}
									{apiDelete !== undefined && (
										<Button onClick={this.deleteItems} type="primary" danger>
											删除
										</Button>
									)}
									{renderCustomTableButton !== undefined &&
										renderCustomTableButton({
											pageNumber: this.state.pageNumber,
											pageSize: this.state.pageSize,
											total: this.state.total,
											getSearchInfo: () => this.getSearchFields()
										})}
								</Space>
							)}
							<Table
								columns={columns}
								dataSource={this.state.data}
								pagination={false}
								rowKey={record => record.id}
								rowSelection={{
									// type: "checkbox",
									fixed: "left",
									...rowSelection
								}}
								bordered={true}
								scroll={{
									x: "max-content"
								}}
							/>
							{(disablePageSearch === undefined || disablePageSearch === false) && (
								<Pagination
									current={this.state.pageNumber} // 总条数 绑定state中的值
									pageSize={this.state.pageSize}
									onChange={this.onChangePage} // 改变页面时发生的函数
									total={this.state.total}
									// 页码数量 = 向上取整（总条数/每页条数）X10
									// showSizeChanger={false} // 总条数超过多少条显示也换条数
									showSizeChanger
									showQuickJumper
									showTotal={total => `共${total}条`}
									style={{ marginTop: "8px" }}
									size="small"
								/>
							)}
						</Card>
					</Col>
				</Row>
			</>
		);
	}
}

export { StandardTable as default };
