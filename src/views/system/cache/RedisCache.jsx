import React from "react";
import {
	Button,
	Card,
	Col,
	Descriptions,
	Input,
	Modal,
	Pagination,
	Popconfirm,
	Row,
	Segmented,
	Select,
	Space,
	Statistic,
	Table,
	Tag,
	Tooltip,
	message
} from "antd";
import { DatabaseOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import request from "../../../api";
import { api } from "../../../actions/system/api";
import { buildKeyTree, getAllExpandableKeys, resolveRefreshPage } from "./redisCacheUtils";

const defaultPagination = { current: 1, pageSize: 10, total: 0 };

// Redis 缓存管理
export default class RedisCache extends React.Component {
	state = {
		pattern: "",
		data: [],
		pagination: defaultPagination,
		database: 0,
		viewMode: "tree",
		expandedRowKeys: [],
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

	fetchServerInfo = async (database = this.state.database) => {
		this.setState({ serverLoading: true });
		try {
			const res = await request.get(api.redisCache.serverInfo, { database });
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
				database: this.state.database,
				pageNumber: page,
				pageSize
			});
			if (res.success) {
				const nextData = res.data?.list || [];
				const nextTreeData = buildKeyTree(nextData);
				this.setState({
					data: nextData,
					expandedRowKeys: getAllExpandableKeys(nextTreeData),
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
			const res = await request.get(api.redisCache.detail, { key: record.key, database: this.state.database });
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
			const res = await request.post(api.redisCache.delete, { key, database: this.state.database });
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
			const res = await request.post(api.redisCache.deleteByPattern, { pattern, database: this.state.database });
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
			const res = await request.post(api.redisCache.clearDatabase, { database: this.state.database });
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

	refresh = page => {
		this.fetchServerInfo(this.state.database);
		this.fetchList(resolveRefreshPage(page), this.state.pagination.pageSize);
	};

	handleDatabaseChange = database => {
		this.setState({ database }, () => this.refresh(1));
	};

	expandAll = () => {
		this.setState({ expandedRowKeys: getAllExpandableKeys(buildKeyTree(this.state.data)) });
	};

	collapseAll = () => {
		this.setState({ expandedRowKeys: [] });
	};

	render() {
		const { data, pagination, serverInfo, loading, serverLoading, detail, detailVisible, detailLoading, destructiveLoading } =
			this.state;
		const columns = [
			{
				title: "Key",
				dataIndex: "key",
				ellipsis: true,
				render: value => (
					<Tooltip title={value}>
						<span style={{ display: "inline-block", maxWidth: "100%" }}>{value}</span>
					</Tooltip>
				)
			},
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
		const treeData = buildKeyTree(data);
		const treeColumns = [
			{
				title: "Key",
				dataIndex: "title",
				ellipsis: true,
				render: (value, node) => (
					<Tooltip title={node.record?.key || node.key}>
						<span style={{ display: "inline-block", maxWidth: "100%" }}>{value}</span>
					</Tooltip>
				)
			},
			{
				title: columns[1].title,
				width: 120,
				align: "center",
				render: (_, node) => (node.record ? <Tag color="blue">{node.record.type}</Tag> : null)
			},
			{
				title: "TTL",
				width: 150,
				align: "center",
				render: (_, node) => (node.record ? columns[2].render(node.record.ttlSeconds) : null)
			},
			{
				title: columns[3].title,
				width: 160,
				align: "center",
				render: (_, node) => (node.record ? columns[3].render(null, node.record) : null)
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
					<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
						<Space wrap>
							<Select
								value={this.state.database}
								options={Array.from({ length: serverInfo?.databaseCount || 1 }, (_, database) => ({
									label: `DB${database}`,
									value: database
								}))}
								onChange={this.handleDatabaseChange}
								style={{ width: 100 }}
							/>
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
						</Space>
						<Space wrap>
							<Segmented
								value={this.state.viewMode}
								onChange={viewMode => this.setState({ viewMode })}
								options={[
									{ label: "树形", value: "tree" },
									{ label: "列表", value: "list" }
								]}
							/>
							{this.state.viewMode === "tree" && (
								<Space.Compact>
									<Button size="small" onClick={this.expandAll}>
										全部展开
									</Button>
									<Button size="small" onClick={this.collapseAll}>
										全部折叠
									</Button>
								</Space.Compact>
							)}
							<Button icon={<ReloadOutlined />} onClick={this.refresh}>
								刷新
							</Button>
							<Popconfirm
								title={`确定删除匹配「${this.state.pattern || "全部 Key"}」的数据吗？`}
								onConfirm={this.deleteByPattern}
							>
								<Button danger icon={<DeleteOutlined />} loading={destructiveLoading}>
									按模式删除
								</Button>
							</Popconfirm>
							<Popconfirm title={`确定清空 DB${this.state.database} 吗？此操作不可恢复。`} onConfirm={this.clearDatabase}>
								<Button danger type="primary" icon={<DeleteOutlined />} loading={destructiveLoading}>
									清空数据库
								</Button>
							</Popconfirm>
						</Space>
					</div>
					{this.state.viewMode === "tree" ? (
						<>
							<Table
								rowKey="key"
								columns={treeColumns}
								dataSource={treeData}
								loading={loading}
								expandable={{
									expandedRowKeys: this.state.expandedRowKeys,
									onExpandedRowsChange: expandedRows => this.setState({ expandedRowKeys: expandedRows })
								}}
								scroll={{ x: 800 }}
								pagination={false}
							/>
							<Pagination
								current={pagination.current}
								pageSize={pagination.pageSize}
								total={pagination.total}
								showSizeChanger
								showQuickJumper
								showTotal={total => `共 ${total} 个 Key`}
								onChange={(page, pageSize) => this.fetchList(page, pageSize)}
								onShowSizeChange={(_, pageSize) => this.fetchList(1, pageSize)}
								style={{ marginTop: 16, textAlign: "right", display: "block" }}
							/>
						</>
					) : (
						<Table
							rowKey="key"
							columns={columns}
							dataSource={data}
							loading={loading}
							scroll={{ x: 800 }}
							pagination={{
								...pagination,
								showSizeChanger: true,
								showQuickJumper: true,
								showTotal: total => `共 ${total} 个 Key`
							}}
							onChange={next => this.fetchList(next.current, next.pageSize)}
						/>
					)}
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
