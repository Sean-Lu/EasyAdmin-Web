import React, { useMemo, useState } from "react";
import {
	ArrowRightOutlined,
	BarChartOutlined,
	CodeOutlined,
	CompassOutlined,
	LinkOutlined,
	QrcodeOutlined,
	SearchOutlined
} from "@ant-design/icons";
import { Card, Col, Empty, Input, Row, Tag, Typography } from "antd";
import JsonToTable from "./tools/jsonToTable";
import QrCode from "./tools/qrCode";
import RandomDecision from "./tools/randomDecision";
import SqlToTable from "./tools/sqlToTable";
import UrlCodec from "./tools/urlCodec";
import "./index.less";

type ToolKey = "sqlToTable" | "urlCodec" | "jsonToTable" | "qrCode" | "randomDecision";

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
	}
];

const CommonTools: React.FC = () => {
	const [activeTool, setActiveTool] = useState<ToolKey | null>(null);
	const [keyword, setKeyword] = useState("");

	const filteredTools = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) return tools;

		return tools.filter(tool => `${tool.title} ${tool.description}`.toLowerCase().includes(normalizedKeyword));
	}, [keyword]);

	if (activeTool === "sqlToTable") {
		return <SqlToTable onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === "urlCodec") {
		return <UrlCodec onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === "jsonToTable") {
		return <JsonToTable onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === "qrCode") {
		return <QrCode onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === "randomDecision") {
		return <RandomDecision onBack={() => setActiveTool(null)} />;
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
					onChange={event => setKeyword(event.target.value)}
					className="tool-search"
				/>
			</div>

			{filteredTools.length > 0 ? (
				<Row gutter={[24, 24]}>
					{filteredTools.map(tool => (
						<Col key={tool.key} xs={24} sm={12} lg={8} xl={6}>
							<Card className="tool-card" hoverable onClick={() => setActiveTool(tool.key)}>
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
				<Empty description="未找到匹配工具" />
			)}
		</div>
	);
};

export default CommonTools;
