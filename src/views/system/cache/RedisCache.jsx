import React from "react";
import { Button, Card, Col, Descriptions, Input, Modal, Popconfirm, Row, Space, Statistic, Table, Tag, message } from "antd";
import { DatabaseOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import request from "../../../api";
import { api } from "../../../actions/system/api";

const defaultPagination = { current: 1, pageSize: 10, total: 0 };

// Redis 缓存管理
export default class RedisCache extends React.Component {
	state = {
		pattern: "",
		data: [],
		pagination: defaultPagination,
		serverInfo: null,
		loading: false,
		serverLoading: false,
		detailVisible: false,
		detail: null,
		detailLoading: false,
		destructiveLoading: false
	};

	componentDidMount() {
		this.fetchServerInfo();
		this.fetchList();
	}

	fetchServerInfo = async () => {
		this.setState({ serverLoading: true });
		try {
			const res = await request.get(api.redisCache.serverInfo);
			if (res.success) this.setState({ serverInfo: res.data });
		} catch (error) {
			message.error("获取 Redis 信息失败");
		} finally {
			this.setState({ serverLoading: false });
		}
	};

	fetchList = async (page = 1, pageSize = this.state.pagination.pageSize) => {
		this.setState({ loading: true });
		try {
			const res = await request.get(api.redisCache.page, {
				pattern: this.state.pattern || undefined,
				pageNumber: page,
				pageSize
			});
			if (res.success) {
				this.setState({
					data: res.data?.list || [],
					pagination: {
						current: res.data?.pageNumber || page,
						pageSize: res.data?.pageSize || pageSize,
						total: res.data?.total || 0
					}
				});
			}
		} catch (error) {
			message.error("获取缓存列表失败");
		} finally {
			this.setState({ loading: false });
		}
	};

	showDetail = async record => {
		this.setState({ detailVisible: true, detail: null, detailLoading: true });
		try {
			const res = await request.get(api.redisCache.detail, { key: record.key });
			if (res.success) this.setState({ detail: res.data });
		} catch (error) {
			message.error("获取缓存详情失败");
		} finally {
			this.setState({ detailLoading: false });
		}
	};

	deleteKey = async key => {
		this.setState({ destructiveLoading: true });
		try {
			const res = await request.post(api.redisCache.delete, { key });
			if (res.success) {
				message.success("删除成功");
				this.refresh();
			}
		} catch (error) {
			message.error("删除缓存失败");
		} finally {
			this.setState({ destructiveLoading: false });
		}
	};

	deleteByPattern = async () => {
		const pattern = this.state.pattern.trim();
		if (!pattern) {
			message.warning("请输入匹配模式");
			return;
		}
		this.setState({ destructiveLoading: true });
		try {
			const res = await request.post(api.redisCache.deleteByPattern, { pattern });
			if (res.success) {
				message.success(`已删除 ${res.data || 0} 个缓存`);
				this.refresh();
			}
		} catch (error) {
			message.error("批量删除缓存失败");
		} finally {
			this.setState({ destructiveLoading: false });
		}
	};

	clearDatabase = async () => {
		this.setState({ destructiveLoading: true });
		try {
			const res = await request.post(api.redisCache.clearDatabase);
			if (res.success) {
				message.success("当前 Redis 数据库已清空");
				this.refresh();
			}
		} catch (error) {
			message.error("清空 Redis 数据库失败");
		} finally {
			this.setState({ destructiveLoading: false });
		}
	};

	refresh = () => {
		this.fetchServerInfo();
		this.fetchList(1, this.state.pagination.pageSize);
	};

	render() {
		const { data, pagination, serverInfo, loading, serverLoading, detail, detailVisible, detailLoading, destructiveLoading } =
			this.state;
		const columns = [
			{ title: "Key", dataIndex: "key", ellipsis: true },
			{ title: "类型", dataIndex: "type", width: 120, align: "center", render: value => <Tag color="blue">{value}</Tag> },
			{
				title: "TTL",
				dataIndex: "ttlSeconds",
				width: 150,
				align: "center",
				render: value => (value < 0 ? (value === -1 ? "永久" : "不存在") : `${value} 秒`)
			},
			{
				title: "操作",
				width: 160,
				align: "center",
				render: (_, record) => (
					<Space>
						<Button type="link" size="small" icon={<EyeOutlined />} onClick={() => this.showDetail(record)}>
							查看
						</Button>
						<Popconfirm title={`确定删除 Key「${record.key}」吗？`} onConfirm={() => this.deleteKey(record.key)}>
							<Button type="link" size="small" danger icon={<DeleteOutlined />} loading={destructiveLoading}>
								删除
							</Button>
						</Popconfirm>
					</Space>
				)
			}
		];

		return (
			<div>
				<Card
					title={
						<Space>
							<DatabaseOutlined /> Redis 信息
						</Space>
					}
					loading={serverLoading}
					style={{ marginBottom: 16 }}
				>
					<Row gutter={24}>
						<Col xs={24} sm={12} md={6}>
							<Statistic
								title="连接状态"
								value={serverInfo?.connected ? "正常" : "异常"}
								valueStyle={{ color: serverInfo?.connected ? "#3f8600" : "#cf1322" }}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic title="Key 数量" value={serverInfo?.keyCount ?? 0} />
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic title="已使用内存" value={serverInfo?.usedMemory || "-"} />
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Statistic title="数据库" value={serverInfo?.database ?? 0} prefix="DB" />
						</Col>
					</Row>
					<div style={{ marginTop: 12, color: "#888" }}>地址：{serverInfo?.endPoints || "-"}</div>
				</Card>

				<Card title="缓存 Key 管理">
					<Space wrap style={{ marginBottom: 16 }}>
						<Input.Search
							value={this.state.pattern}
							onChange={event => this.setState({ pattern: event.target.value })}
							onSearch={() => this.fetchList()}
							placeholder="支持 Redis 匹配模式，例如 EasyAdmin:*"
							allowClear
							enterButton={
								<>
									<SearchOutlined /> 查询
								</>
							}
							style={{ width: 380 }}
						/>
						<Button icon={<ReloadOutlined />} onClick={this.refresh}>
							刷新
						</Button>
						<Popconfirm title={`确定删除匹配「${this.state.pattern || "全部 Key"}」的数据吗？`} onConfirm={this.deleteByPattern}>
							<Button danger icon={<DeleteOutlined />} loading={destructiveLoading}>
								按模式删除
							</Button>
						</Popconfirm>
						<Popconfirm title="确定清空当前 Redis 数据库吗？此操作不可恢复。" onConfirm={this.clearDatabase}>
							<Button danger type="primary" icon={<DeleteOutlined />} loading={destructiveLoading}>
								清空数据库
							</Button>
						</Popconfirm>
					</Space>
					<Table
						rowKey="key"
						columns={columns}
						dataSource={data}
						loading={loading}
						scroll={{ x: 800 }}
						pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 个 Key` }}
						onChange={next => this.fetchList(next.current, next.pageSize)}
					/>
				</Card>

				<Modal
					title="缓存详情"
					open={detailVisible}
					onCancel={() => this.setState({ detailVisible: false })}
					footer={null}
					width={900}
				>
					{detail && (
						<Descriptions bordered column={1}>
							<Descriptions.Item label="Key">{detail.key}</Descriptions.Item>
							<Descriptions.Item label="类型">{detail.type}</Descriptions.Item>
							<Descriptions.Item label="TTL">{detail.ttlSeconds < 0 ? "永久" : `${detail.ttlSeconds} 秒`}</Descriptions.Item>
							<Descriptions.Item label="Value">
								<Input.TextArea
									value={detail.value}
									readOnly
									autoSize={{ minRows: 8, maxRows: 20 }}
									style={{ fontFamily: "monospace" }}
								/>
							</Descriptions.Item>
						</Descriptions>
					)}
					{detailLoading && !detail && <div style={{ textAlign: "center", padding: 32 }}>加载中...</div>}
				</Modal>
			</div>
		);
	}
}
