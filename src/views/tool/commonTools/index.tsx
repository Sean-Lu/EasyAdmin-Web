import React, { useState } from "react";
import { ArrowRightOutlined, BarChartOutlined } from "@ant-design/icons";
import { Card, Col, Row, Tag, Typography } from "antd";
import SqlToTable from "../sqlToTable";
import "./index.less";

type ToolKey = "sqlToTable";

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
		title: "SQL 转表格工具",
		description: "INSERT / REPLACE 转可筛选表格",
		tag: "developer_tools",
		icon: <BarChartOutlined />
	}
];

const CommonTools: React.FC = () => {
	const [activeTool, setActiveTool] = useState<ToolKey | null>(null);

	if (activeTool === "sqlToTable") {
		return <SqlToTable onBack={() => setActiveTool(null)} />;
	}

	return (
		<div className="common-tools-page">
			<div className="common-tools-header">
				<Typography.Title level={2}>百宝箱</Typography.Title>
				<Typography.Text type="secondary">Toolbox</Typography.Text>
			</div>

			<Row gutter={[24, 24]}>
				{tools.map(tool => (
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
		</div>
	);
};

export default CommonTools;
