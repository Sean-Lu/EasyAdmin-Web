import React from "react";
import { Button, Card, Col, Form, message, Modal, Pagination, Row, Space, Table, Switch, Spin } from "antd";

import moment from "moment";

import axios from "../../api/index";

import "./index.less";

/**
 * 通用标准表格组件
 *
 * 功能特性：
 * - 支持分页查询和不分页查询
 * - 支持搜索表单（带防抖处理（300ms））
 * - 支持新增、编辑、删除、查看详情操作
 * - 支持批量删除
 * - 支持状态切换
 * - 支持自定义操作按钮
 * - 支持自定义模态框
 * - 支持加载状态显示
 * - 支持统一的错误处理
 *
 * 详细使用说明请参考 README.md 文件
 *
 * 1. 基本使用
 *
 * ```jsx
 *    <StandardTable
 *      searchFormRef={searchFormRef}
 *      columns={columns}
 *      renderSearchForm={renderSearchForm}
 *      renderModal={renderModal}
 *      apiPage="/api/page"
 *    />
 * ```
 *
 * 2. 配置项说明：
 *    - columns: 表格列配置，同 Ant Design Table
 *    - apiPage: 分页查询接口地址
 *    - apiList: 不分页查询接口地址（当设置了 apiList 时，会忽略 apiPage）
 *    - apiAdd: 新增接口地址
 *    - apiUpdate: 编辑接口地址
 *    - apiDelete: 删除接口地址
 *    - apiDetail: 详情接口地址
 *    - apiUpdateState: 状态更新接口地址
 *    - disablePageSearch: 是否禁用分页查询，默认为 false
 *    - searchFormRef: 搜索表单引用
 *    - renderSearchForm: 渲染搜索表单的函数
 *    - renderModal: 渲染模态框的函数
 *    - renderCustomTableButton: 渲染自定义表格按钮的函数
 *    - renderRecordOperate: 渲染行操作按钮的函数
 *    - recordOperateColWidth: 操作列宽度，默认为 130
 *    - handleAddValues: 处理新增表单值的函数
 *    - handleUpdateValues: 处理编辑表单值的函数
 *    - handleSearchValues: 处理搜索表单值的函数
 *    - onSearchFormReset: 搜索表单重置后的回调函数
 *
 * 3. 注意事项：
 *    - 接口返回格式需统一：{ success: boolean, data: any }
 *    - 分页接口返回格式需包含：{ list: array, total: number }
 *    - 状态切换接口返回格式需为：{ data: boolean }
 *    - 删除接口支持单个删除（id 参数）和批量删除（ids 参数）
 */
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
			record: {}, // 当前编辑或查看的对象
			loading: false // 加载状态
		};

		this.OnSearchFormFinish = this.OnSearchFormFinish.bind(this);
		this.handleFormReset = this.handleFormReset.bind(this);
		this.debouncedSearch = this.debounce(this.handleSearch, 300);
	}

	componentDidMount() {
		this.handleSearch();
	}

	// 防抖函数
	debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	// 公共 API 请求方法
	requestApi = (method, url, params, options = {}) => {
		const {
			onSuccess = null, // 业务成功回调
			onFail = null, // 业务失败回调
			failMsg = "操作失败", // 业务失败提示
			onError = null, // 请求异常回调
			errorMsg = "操作异常" // 请求异常提示
		} = options;

		this.setState({ loading: true });
		return axios[method](url, params)
			.then(res => {
				this.setState({ loading: false });
				if (res.success === true) {
					// 处理业务成功回调
					if (onSuccess) {
						onSuccess(res);
					}
				} else {
					console.error(res.message || failMsg, res);
					message.error(res.message || failMsg);

					// 处理业务失败回调
					if (onFail) {
						onFail(res);
					}
				}
				return res;
			})
			.catch(err => {
				this.setState({ loading: false });

				// 处理接口请求异常（已经在响应拦截器中做了统一处理）
				// 如果是401状态码（token过期），不显示错误消息，因为系统会自动跳转到登录页
				if (err.response && err.response.status !== 401) {
					console.error(errorMsg, err);
					message.error(errorMsg);
				}

				// 处理接口请求异常回调
				if (onError) {
					onError(err);
				}
			});
	};

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
		this.requestApi(
			"post",
			apiAdd,
			{
				...(handleAddValues ? handleAddValues(values) : values)
			},
			{
				onSuccess: res => {
					this.hideAddModal();
					message.success("操作成功");
					this.handleSearch();
				},
				failMsg: "新增失败",
				errorMsg: "新增异常"
			}
		);
	};

	// 显示编辑信息弹窗
	showUpdateModal = (text, record, index) => {
		const { apiDetail } = this.props;
		this.requestApi(
			"get",
			apiDetail,
			{
				id: record.id
			},
			{
				onSuccess: res => {
					this.setState({
						updateModalVisible: true,
						record: res.data
					});
				},
				failMsg: "查询详情失败",
				errorMsg: "查询详情异常"
			}
		);
	};
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
		this.requestApi(
			"post",
			apiUpdate,
			{
				...this.state.record,
				...(handleUpdateValues ? handleUpdateValues(values) : values)
			},
			{
				onSuccess: res => {
					this.hideUpdateModal();
					message.success("操作成功");
					this.handleSearch();
				},
				failMsg: "更新失败",
				errorMsg: "更新异常"
			}
		);
	};

	// 显示查看详情弹窗
	showDetailModal = (text, record, index) => {
		const { apiDetail } = this.props;
		this.requestApi(
			"get",
			apiDetail,
			{
				id: record.id
			},
			{
				onSuccess: res => {
					this.setState({
						detailModalVisible: true,
						record: res.data
					});
				},
				failMsg: "查询详情失败",
				errorMsg: "查询详情异常"
			}
		);
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
		Modal.confirm({
			title: "是否确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			// 点击确认触发
			onOk: () => {
				this.requestApi(
					"post",
					apiDelete,
					{
						id: record.id
					},
					{
						onSuccess: res => {
							message.success("操作成功");
							this.handleSearch();
						},
						failMsg: "删除失败",
						errorMsg: "删除异常"
					}
				);
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

		Modal.confirm({
			title: "是否确认删除?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			// 点击确认触发
			onOk: () => {
				this.requestApi(
					"post",
					apiDelete,
					{
						ids: selectedRowKeys
					},
					{
						onSuccess: res => {
							this.setState({ selectedRowKeys: [] });
							message.success("操作成功");
							this.handleSearch();
						},
						failMsg: "删除失败",
						errorMsg: "删除异常"
					}
				);
			},
			// 点击取消触发
			onCancel() {}
		});
	};

	// 分页操作
	onChangePage = (page, pageSize) => {
		this.setState(
			{
				pageNumber: page,
				pageSize: pageSize
			},
			() => {
				this.handleSearch();
			}
		);
	};

	OnSearchFormFinish = values => {
		this.debouncedSearch();
	};

	/** 查询 */
	handleSearch = () => {
		const { apiPage, apiList, disablePageSearch } = this.props;
		if (apiPage !== undefined && (disablePageSearch === undefined || disablePageSearch === false)) {
			// 分页查询
			this.requestApi(
				"get",
				apiPage,
				{
					pageNumber: this.state.pageNumber,
					pageSize: this.state.pageSize,
					...this.getSearchFields()
				},
				{
					onSuccess: res => {
						this.setState({
							data: res.data.list || [],
							total: res.data.total || 0
						});
					},
					failMsg: "查询失败",
					errorMsg: "查询异常"
				}
			);
		} else if (apiList !== undefined) {
			// 列表查询（不分页）
			this.requestApi(
				"get",
				apiList,
				{
					...this.getSearchFields()
				},
				{
					onSuccess: res => {
						this.setState({
							data: res.data || []
						});
					},
					failMsg: "查询失败",
					errorMsg: "查询异常"
				}
			);
		}
	};

	getSearchFields = () => {
		const { searchFormRef, handleSearchValues } = this.props;
		const fields = searchFormRef.current.getFieldsValue();
		return handleSearchValues ? handleSearchValues(fields) : fields;
	};

	/** 重置 */
	handleFormReset = () => {
		const { searchFormRef, onSearchFormReset } = this.props;
		searchFormRef.current.resetFields();
		this.setState(
			{
				pageNumber: 1,
				pageSize: this.state.pageSize
			},
			() => {
				if (onSearchFormReset) {
					onSearchFormReset();
				}
				this.handleSearch();
			}
		);
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
		this.requestApi(
			"post",
			apiUpdateState,
			{
				id: record.id,
				state: state
			},
			{
				onSuccess: res => {
					message.success("操作成功");
					this.handleSearch();
				},
				onFail: res => {
					this.handleSearch(); // 刷新数据（还原状态）
				},
				failMsg: "操作失败",
				onError: res => {
					this.handleSearch(); // 刷新数据（还原状态）
				},
				errorMsg: "操作异常"
			}
		);
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
							<Spin spinning={this.state.loading}>
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
							</Spin>
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
