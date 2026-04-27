import React from "react";
import { Button, Modal, Space, Table, Tag, message, Popconfirm } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import { api } from "../../../actions/system/api";
import request from "../../../api";

// 定时任务执行日志弹窗
export default class ScheduleJobLog extends React.Component {
	state = {
		data: [],
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0
		},
		loading: false
	};

	componentDidMount() {
		this.fetchList();
	}

	componentDidUpdate(prevProps) {
		// 当弹窗从关闭变为打开时，重新查询日志
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.fetchList();
		}
		// 当任务ID改变时，也重新查询日志（防止在弹窗打开时切换任务）
		else if (prevProps.record?.id !== this.props.record?.id && this.props.modalVisible) {
			this.fetchList();
		}
	}

	fetchList = (page = 1, pageSize = 10) => {
		const { record } = this.props;
		if (!record?.id) return;

		this.setState({ loading: true });
		request
			.get(api.scheduleJob.logPage, {
				pageNumber: page,
				pageSize: pageSize,
				jobId: record.id
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

	handleDelete = async id => {
		try {
			const res = await request.post(api.scheduleJob.deleteLog, { id });
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

	handleClearLog = async () => {
		const { record } = this.props;
		try {
			const res = await request.post(api.scheduleJob.clearLog, { jobId: record.id });
			if (res.success) {
				message.success("清空成功");
				this.fetchList(1, this.state.pagination.pageSize);
			} else {
				message.error(res.msg || "清空失败");
			}
		} catch (error) {
			message.error("网络请求失败");
		}
	};

	onTableChange = pagination => {
		this.fetchList(pagination.current, pagination.pageSize);
	};

	render() {
		const { modalVisible, onCancel, record } = this.props;
		const { data, pagination, loading } = this.state;

		const tableColumnAlign = "center";

		const columns = [
			{
				title: "执行开始时间",
				dataIndex: "executeStartTime",
				align: tableColumnAlign,
				width: 180,
				render: text => dayjs(text).format("YYYY-MM-DD HH:mm:ss")
			},
			{
				title: "执行结束时间",
				dataIndex: "executeEndTime",
				align: tableColumnAlign,
				width: 180,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-")
			},
			{
				title: "执行耗时",
				dataIndex: "executeElapsedTime",
				align: tableColumnAlign,
				width: 100,
				render: text => `${text || 0}ms`
			},
			{
				title: "执行状态",
				dataIndex: "executeStatus",
				align: tableColumnAlign,
				width: 100,
				render: text => <Tag color={text === 1 ? "green" : "red"}>{text === 1 ? "成功" : "失败"}</Tag>
			},
			{
				title: "执行信息",
				dataIndex: "executeMessage",
				align: tableColumnAlign,
				ellipsis: true
			},
			{
				title: "操作",
				align: tableColumnAlign,
				width: 100,
				fixed: "right",
				render: (text, record) => (
					<Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record.id)}>
						<Button type="link" size="small" danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				)
			}
		];

		return (
			<Modal title={`【${record?.jobName || ""}】执行日志`} open={modalVisible} onCancel={onCancel} width={1000} footer={null}>
				<div style={{ marginBottom: 16 }}>
					<Space>
						<Button
							icon={<ReloadOutlined />}
							onClick={() => this.fetchList(this.state.pagination.current, this.state.pagination.pageSize)}
						>
							刷新
						</Button>
						<Popconfirm title="确定要清空所有日志吗？" onConfirm={this.handleClearLog}>
							<Button danger icon={<DeleteOutlined />}>
								清空日志
							</Button>
						</Popconfirm>
					</Space>
				</div>

				<Table
					columns={columns}
					dataSource={data}
					rowKey="id"
					loading={loading}
					pagination={{
						...pagination,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: total => `共 ${total} 条`
					}}
					onChange={this.onTableChange}
					scroll={{ x: 1000 }}
				/>
			</Modal>
		);
	}
}
