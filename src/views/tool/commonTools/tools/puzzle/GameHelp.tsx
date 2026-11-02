import React from "react";
import { Card, Typography } from "antd";
import "./index.less";

/** 所有小游戏共用的玩法说明卡片，统一标题、规则列表和操作提示的样式 */
export default function GameHelp({ rules, children }: { rules: string[]; children: React.ReactNode }) {
	return (
		<Card title="怎么玩" className="logic-game-help">
			<ol>
				{rules.map(rule => (
					<li key={rule}>{rule}</li>
				))}
			</ol>
			<Typography.Text type="secondary">{children}</Typography.Text>
		</Card>
	);
}
