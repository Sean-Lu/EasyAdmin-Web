import React, { useMemo } from "react";
import {
	ArrowRightOutlined,
	BarChartOutlined,
	CodeOutlined,
	CompassOutlined,
	FileTextOutlined,
	FundProjectionScreenOutlined,
	GiftOutlined,
	LinkOutlined,
	QrcodeOutlined,
	SearchOutlined
} from "@ant-design/icons";
import { Card, Col, Empty, Input, Row, Tag, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import JsonParser from "./tools/jsonParser";
import JsonToTable from "./tools/jsonToTable";
import Lottery from "./tools/lottery";
import QrCode from "./tools/qrCode";
import RandomDecision from "./tools/randomDecision";
import SqlToTable from "./tools/sqlToTable";
import StockPortfolio from "./tools/stockPortfolio";
import UrlCodec from "./tools/urlCodec";
import "./index.less";

type ToolKey =
	| "sqlToTable"
	| "urlCodec"
	| "jsonToTable"
	| "jsonParser"
	| "qrCode"
	| "randomDecision"
	| "lottery"
	| "stockPortfolio";

interface ToolItem {
	key: ToolKey;
	title: string;
	description: string;
	tag: string;
	icon: React.ReactNode;
}

const tools: ToolItem[] = [
	{
		key: "sqlToTable",
		title: "SQL 转表格",
		description: "INSERT / REPLACE 转可筛选表格",
		tag: "developer_tools",
		icon: <BarChartOutlined />
	},
	{
		key: "jsonToTable",
		title: "JSON 转表格",
		description: "JSON 数组转可筛选表格",
		tag: "developer_tools",
		icon: <CodeOutlined />
	},
	{
		key: "jsonParser",
		title: "JSON 解析工具",
		description: "格式化、压缩、折叠、校验 JSON",
		tag: "developer_tools",
		icon: <FileTextOutlined />
	},
	{
		key: "urlCodec",
		title: "URL 编码/解码",
		description: "URL 与中文路径互转",
		tag: "developer_tools",
		icon: <LinkOutlined />
	},
	{
		key: "qrCode",
		title: "二维码工具",
		description: "二维码生成/解析",
		tag: "image_tools",
		icon: <QrcodeOutlined />
	},
	{
		key: "randomDecision",
		title: "随机决策器",
		description: "吃什么/去哪玩",
		tag: "life_tools",
		icon: <CompassOutlined />
	},
	{
		key: "lottery",
		title: "抽奖工具",
		description: "活动奖项与现场抽奖",
		tag: "life_tools",
		icon: <GiftOutlined />
	},
	{
		key: "stockPortfolio",
		title: "股票持仓管理",
		description: "记录持仓并统计盈亏",
		tag: "finance_tools",
		icon: <FundProjectionScreenOutlined />
	}
];

const VALID_TOOL_KEYS: ReadonlySet<string> = new Set(tools.map(t => t.key));

const CommonTools: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const toolParam = searchParams.get("tool");
	const activeTool: ToolKey | null = toolParam && VALID_TOOL_KEYS.has(toolParam) ? (toolParam as ToolKey) : null;

	const keyword = searchParams.get("q") ?? "";

	const filteredTools = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) return tools;

		return tools.filter(tool => `${tool.title} ${tool.description}`.toLowerCase().includes(normalizedKeyword));
	}, [keyword]);

	if (activeTool === "sqlToTable") {
		return <SqlToTable onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "urlCodec") {
		return <UrlCodec onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "jsonToTable") {
		return <JsonToTable onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "jsonParser") {
		return <JsonParser onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "qrCode") {
		return <QrCode onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "randomDecision") {
		return <RandomDecision onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "lottery") {
		return <Lottery onBack={() => setSearchParams({})} />;
	}

	if (activeTool === "stockPortfolio") {
		return <StockPortfolio onBack={() => setSearchParams({})} />;
	}

	return (
		<div className="common-tools-page">
			<div className="common-tools-header">
				<div>
					<Typography.Title level={2}>百宝箱</Typography.Title>
					<Typography.Text type="secondary">Toolbox</Typography.Text>
				</div>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="搜索工具名称"
					value={keyword}
					onChange={event => {
						const val = event.target.value;
						if (val) {
							setSearchParams({ q: val });
						} else {
							setSearchParams({});
						}
					}}
					className="tool-search"
				/>
			</div>

			{filteredTools.length > 0 ? (
				<Row gutter={[24, 24]}>
					{filteredTools.map(tool => (
						<Col key={tool.key} xs={24} sm={12} lg={8} xl={6}>
							<Card className="tool-card" hoverable onClick={() => setSearchParams({ tool: tool.key })}>
								<div className="tool-card-arrow">
									<ArrowRightOutlined />
								</div>
								<div className="tool-card-icon">{tool.icon}</div>
								<Typography.Title level={4}>{tool.title}</Typography.Title>
								<Typography.Text type="secondary">{tool.description}</Typography.Text>
								<div className="tool-card-footer">
									<Tag>{tool.tag}</Tag>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			) : (
				<Empty description="未找到匹配的工具" />
			)}
		</div>
	);
};

export default CommonTools;
