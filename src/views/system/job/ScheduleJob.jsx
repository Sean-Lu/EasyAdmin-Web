import React from "react";
import { Button, Col, Form, Input, Row, Select, Space, Table, Tag, message, Popconfirm, Card } from "antd";
import { PlayCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import ScheduleJobAdd from "./ScheduleJobAdd";
import ScheduleJobEdit from "./ScheduleJobEdit";
import ScheduleJobDetail from "./ScheduleJobDetail";
import ScheduleJobLog from "./ScheduleJobLog";
import { api } from "../../../actions/system/api";
import request from "../../../api";

// 定时任务列表
export default class ScheduleJob extends React.Component {
	state = {
		data: [],
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0
		},
		loading: false,
		addModalVisible: false,
		editModalVisible: false,
		detailModalVisible: false,
		logModalVisible: false,
		selectedRowKeys: [],
		record: {}
	};

	componentDidMount() {
		this.fetchList();
	}

	fetchList = (page = 1, pageSize = 10, values = {}) => {
		this.setState({ loading: true });
		request
			.get(api.scheduleJob.page, {
				pageNumber: page,
				pageSize: pageSize,
				...values
			})
			.then(res => {
				if (res.success) {
					this.setState({
						data: res.data?.list || [],
						pagination: {
							current: page,
							pageSize: pageSize,
							total: res.data?.total || 0
						},
						loading: false
					});
				} else {
					message.error(res.msg || "获取数据失败");
					this.setState({ loading: false });
				}
			})
			.catch(() => {
				message.error("网络请求失败");
				this.setState({ loading: false });
			});
	};

	onSearchFormFinish = values => {
		this.fetchList(1, this.state.pagination.pageSize, values);
	};

	onSearchFormReset = () => {
		this.searchFormRef.current?.resetFields();
		this.fetchList(1, this.state.pagination.pageSize);
	};

	onTableChange = pagination => {
		this.fetchList(pagination.current, pagination.pageSize);
	};

	onSelectChange = selectedRowKeys => {
		this.setState({ selectedRowKeys });
	};

	onAddFinish = async values => {
		try {
			const res = await request.post(api.scheduleJob.add, values);
			if (res.success) {
				message.success("新增成功");
				this.setState({ addModalVisible: false });
				this.fetchList(1, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "新增失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	onEditFinish = async values => {
		try {
			const res = await request.post(api.scheduleJob.update, values);
			if (res.success) {
				message.success("修改成功");
				this.setState({ editModalVisible: false });
				this.fetchList(this.state.pagination.current, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "修改失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	handleDelete = async id => {
		try {
			const res = await request.post(api.scheduleJob.delete, { id });
			if (res.success) {
				message.success("删除成功");
				this.fetchList(this.state.pagination.current, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "删除失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	handleBatchDelete = async () => {
		const { selectedRowKeys } = this.state;
		if (!selectedRowKeys.length) {
			message.warning("请选择要删除的数据");
			return;
		}
		try {
			const res = await request.post(api.scheduleJob.delete, { ids: selectedRowKeys });
			if (res.success) {
				message.success("删除成功");
				this.setState({ selectedRowKeys: [] });
				this.fetchList(this.state.pagination.current, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "删除失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	handleUpdateState = async (id, state) => {
		try {
			const res = await request.post(api.scheduleJob.updateState, { id, state: state ? 1 : 0 });
			if (res.success) {
				message.success("操作成功");
				this.fetchList(this.state.pagination.current, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "操作失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	handleRunOnce = async id => {
		try {
			const res = await request.post(api.scheduleJob.runOnce, { id });
			if (res.success) {
				message.success("执行请求已发送");
			} else {
				message.error(res.msg || "执行失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	searchFormRef = React.createRef();
	rowSelection = {
		selectedRowKeys: this.state.selectedRowKeys,
		onChange: this.onSelectChange
	};

	render() {
		const {
			data,
			pagination,
			loading,
			addModalVisible,
			editModalVisible,
			detailModalVisible,
			logModalVisible,
			selectedRowKeys,
			record
		} = this.state;

		const tableColumnAlign = "center";
		const scheduleTypeEnumMap = {
			0: "简单调度",
			1: "Cron调度"
		};

		const intervalUnitEnumMap = {
			0: "秒",
			1: "分钟",
			2: "小时",
			3: "天"
		};

		const columns = [
			{
				title: "任务名称",
				dataIndex: "jobName",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "调度类型",
				dataIndex: "scheduleType",
				align: tableColumnAlign,
				width: 120,
				render: text => <Tag color="blue">{scheduleTypeEnumMap[text]}</Tag>
			},
			{
				title: "执行配置",
				align: tableColumnAlign,
				width: 180,
				render: (_, record) => {
					if (record.scheduleType === 1) {
						return record.cronExpression || "-";
					} else {
						return `${record.simpleInterval || 1} ${intervalUnitEnumMap[record.simpleIntervalUnit] || "分钟"}`;
					}
				}
			},
			{
				title: "任务类名",
				dataIndex: "jobClassName",
				align: tableColumnAlign,
				ellipsis: true
			},
			{
				title: "上次执行时间",
				dataIndex: "lastExecuteTime",
				align: tableColumnAlign,
				width: 170,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-")
			},
			{
				title: "下次执行时间",
				dataIndex: "nextExecuteTime",
				align: tableColumnAlign,
				width: 170,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-")
			},
			{
				title: "状态",
				dataIndex: "state",
				align: tableColumnAlign,
				width: 100,
				render: (text, record) => (
					<Popconfirm
						title={`确定要${text === 1 ? "禁用" : "启用"}吗？`}
						onConfirm={() => this.handleUpdateState(record.id, text !== 1)}
					>
						<Tag color={text === 1 ? "green" : "red"} style={{ cursor: "pointer" }}>
							{text === 1 ? "启用" : "禁用"}
						</Tag>
					</Popconfirm>
				)
			},
			{
				title: "操作",
				align: tableColumnAlign,
				width: 380,
				fixed: "right",
				render: (text, record) => (
					<Space>
						<Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => this.handleRunOnce(record.id)}>
							执行
						</Button>
						<Button
							type="link"
							size="small"
							icon={<EyeOutlined />}
							onClick={() => this.setState({ detailModalVisible: true, record })}
						>
							详情
						</Button>
						<Button
							type="link"
							size="small"
							icon={<EditOutlined />}
							onClick={() => this.setState({ editModalVisible: true, record })}
						>
							编辑
						</Button>
						<Button
							type="link"
							size="small"
							icon={<EyeOutlined />}
							onClick={() => this.setState({ logModalVisible: true, record })}
						>
							日志
						</Button>
						<Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record.id)}>
							<Button type="link" size="small" danger icon={<DeleteOutlined />}>
								删除
							</Button>
						</Popconfirm>
					</Space>
				)
			}
		];

		return (
			<div>
				<Card>
					<Form ref={this.searchFormRef} layout="inline" onFinish={this.onSearchFormFinish} style={{ marginBottom: 16 }}>
						<Form.Item name="jobName" label="任务名称">
							<Input placeholder="请输入任务名称" style={{ width: 200 }} />
						</Form.Item>
						<Form.Item name="state" label="状态">
							<Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
								<Select.Option value={0}>禁用</Select.Option>
								<Select.Option value={1}>启用</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item>
							<Space>
								<Button type="primary" htmlType="submit">
									查询
								</Button>
								<Button onClick={this.onSearchFormReset}>重置</Button>
								<Button
									icon={<ReloadOutlined />}
									onClick={() => this.fetchList(this.state.pagination.current, this.state.pagination.pageSize)}
								>
									刷新
								</Button>
							</Space>
						</Form.Item>
					</Form>

					<Row style={{ marginBottom: 16 }}>
						<Col>
							<Space>
								<Button type="primary" onClick={() => this.setState({ addModalVisible: true })}>
									新增
								</Button>
								<Popconfirm title="确定要删除选中的数据吗？" onConfirm={this.handleBatchDelete}>
									<Button danger disabled={!selectedRowKeys.length}>
										批量删除
									</Button>
								</Popconfirm>
							</Space>
						</Col>
					</Row>

					<Table
						columns={columns}
						dataSource={data}
						rowKey="id"
						loading={loading}
						rowSelection={{
							selectedRowKeys,
							onChange: this.onSelectChange
						}}
						pagination={{
							...pagination,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: total => `共 ${total} 条`
						}}
						onChange={this.onTableChange}
						scroll={{ x: 1200 }}
					/>
				</Card>

				<ScheduleJobAdd
					modalVisible={addModalVisible}
					onCancel={() => this.setState({ addModalVisible: false })}
					onSubmit={this.onAddFinish}
				/>
				<ScheduleJobEdit
					modalVisible={editModalVisible}
					onCancel={() => this.setState({ editModalVisible: false })}
					onSubmit={this.onEditFinish}
					record={record}
				/>
				<ScheduleJobDetail
					modalVisible={detailModalVisible}
					onCancel={() => this.setState({ detailModalVisible: false })}
					record={record}
				/>
				<ScheduleJobLog
					modalVisible={logModalVisible}
					onCancel={() => this.setState({ logModalVisible: false })}
					record={record}
				/>
			</div>
		);
	}
}
