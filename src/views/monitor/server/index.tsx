import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Progress, Row, Space, Statistic, Switch, Table, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	DotNetProcess,
	ServerDisk,
	ServerMonitorOverview,
	ServerNetwork,
	getServerMonitorOverview
} from "@/services/system/serverMonitorService";
import { message } from "antd";
import "./index.less";
import { clampPercent, formatBytes, getRefreshInterval } from "./display";

const MetricCard = ({ title, percent, detail }: { title: string; percent: number; detail: string }) => (
	<Card className="server-monitor-metric" title={title}>
		<Progress percent={clampPercent(percent)} strokeColor={percent >= 80 ? "#fa541c" : "#1677ff"} />
		<Typography.Text type="secondary">{detail}</Typography.Text>
	</Card>
);

// 服务器监控页面
const ServerMonitor = () => {
	const [overview, setOverview] = useState<ServerMonitorOverview>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const [autoRefresh, setAutoRefresh] = useState(false);

	const loadOverview = useCallback(async (showLoading = false) => {
		if (showLoading) setLoading(true);
		try {
			const result = await getServerMonitorOverview();
			setOverview(result);
			setError(undefined);
		} catch {
			setError("服务器监控数据刷新失败，当前展示最近一次成功数据");
			message.error("服务器监控数据刷新失败");
		} finally {
			if (showLoading) setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadOverview(true);
		const interval = getRefreshInterval(autoRefresh);
		if (!interval) return;
		const timer = window.setInterval(() => void loadOverview(), interval);
		return () => window.clearInterval(timer);
	}, [autoRefresh, loadOverview]);

	const diskColumns = useMemo(
		() => [
			{ title: "磁盘", dataIndex: "name", key: "name" },
			{ title: "格式", dataIndex: "driveFormat", key: "driveFormat" },
			{ title: "总容量", key: "totalBytes", render: (item: ServerDisk) => formatBytes(item.totalBytes) },
			{ title: "已用", key: "usedBytes", render: (item: ServerDisk) => formatBytes(item.usedBytes) },
			{
				title: "使用率",
				key: "usagePercent",
				render: (item: ServerDisk) => <Progress percent={clampPercent(item.usagePercent)} size="small" />
			}
		],
		[]
	);
	const networkColumns = useMemo(
		() => [
			{ title: "网卡", dataIndex: "name", key: "name" },
			{ title: "描述", dataIndex: "description", key: "description" },
			{
				title: "状态",
				key: "status",
				render: (item: ServerNetwork) => <Tag color={item.status === "Up" ? "green" : "default"}>{item.status}</Tag>
			},
			{ title: "接收", key: "receivedBytes", render: (item: ServerNetwork) => formatBytes(item.receivedBytes) },
			{ title: "发送", key: "sentBytes", render: (item: ServerNetwork) => formatBytes(item.sentBytes) }
		],
		[]
	);
	const processColumns = useMemo(
		() => [
			{ title: "PID", dataIndex: "processId", key: "processId" },
			{ title: "进程", dataIndex: "name", key: "name" },
			{
				title: "启动时间",
				dataIndex: "startTime",
				key: "startTime",
				render: (value: string) => (value ? new Date(value).toLocaleString() : "-")
			},
			{
				title: "CPU时间",
				key: "cpuMilliseconds",
				render: (item: DotNetProcess) => `${(item.cpuMilliseconds / 1000).toFixed(1)} 秒`
			},
			{ title: "内存", key: "workingSetBytes", render: (item: DotNetProcess) => formatBytes(item.workingSetBytes) },
			{ title: "线程", dataIndex: "threadCount", key: "threadCount" },
			{ title: "句柄", dataIndex: "handleCount", key: "handleCount" }
		],
		[]
	);

	return (
		<div className="server-monitor-page">
			<Space className="server-monitor-header" direction="vertical" size={4}>
				<Space align="center" wrap>
					<Typography.Title level={3}>服务器监控</Typography.Title>
					<Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadOverview(true)}>
						刷新
					</Button>
					<Space>
						<Switch checked={autoRefresh} onChange={setAutoRefresh} />
						<Typography.Text>自动刷新</Typography.Text>
					</Space>
				</Space>
				<Typography.Text type="secondary">
					主机：{overview?.hostName || "加载中"}　最后采集：{overview ? new Date(overview.collectedAt).toLocaleString() : "-"}
				</Typography.Text>
			</Space>
			{error && <Alert className="server-monitor-alert" type="warning" message={error} showIcon />}
			{overview ? (
				<>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<MetricCard
								title="CPU"
								percent={overview.cpu.usagePercent}
								detail={`${overview.cpu.logicalProcessorCount} 个逻辑处理器`}
							/>
						</Col>
						<Col xs={24} md={8}>
							<MetricCard
								title="内存"
								percent={overview.memory.usagePercent}
								detail={`${formatBytes(overview.memory.usedBytes)} / ${formatBytes(overview.memory.totalBytes)}`}
							/>
						</Col>
						<Col xs={24} md={8}>
							<Card className="server-monitor-metric" title="可用内存">
								<Statistic value={formatBytes(overview.memory.freeBytes)} />
							</Card>
						</Col>
					</Row>
					<Card title="磁盘" className="server-monitor-section">
						<Table
							rowKey="name"
							size="small"
							pagination={false}
							columns={diskColumns}
							dataSource={overview.disks}
							locale={{ emptyText: <Empty description="暂无固定磁盘" /> }}
						/>
					</Card>
					<Card title="网络" className="server-monitor-section">
						<Table
							rowKey="name"
							size="small"
							pagination={false}
							columns={networkColumns}
							dataSource={overview.networks}
							locale={{ emptyText: <Empty description="暂无网卡数据" /> }}
						/>
					</Card>
					<Card title=".NET 进程" className="server-monitor-section">
						<Table
							rowKey="processId"
							size="small"
							pagination={{ pageSize: 10 }}
							columns={processColumns}
							dataSource={overview.dotNetProcesses}
							locale={{ emptyText: <Empty description="暂无进程数据" /> }}
						/>
					</Card>
				</>
			) : (
				<Card loading={loading} />
			)}
		</div>
	);
};

export default ServerMonitor;
