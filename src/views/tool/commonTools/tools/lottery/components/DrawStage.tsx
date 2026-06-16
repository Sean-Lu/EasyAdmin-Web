import React from "react";
import { GiftOutlined } from "@ant-design/icons";
import { Empty, Space, Tag, Typography } from "antd";
import { LotteryWinner } from "@/services/tool/lotteryService";

interface DrawStageProps {
	rollingNames: string[];
	latestWinners: LotteryWinner[];
	isDrawing: boolean;
	participantsCount: number;
	prizesCount: number;
	winnersCount: number;
}

const DrawStage: React.FC<DrawStageProps> = ({
	rollingNames,
	latestWinners,
	isDrawing,
	participantsCount,
	prizesCount,
	winnersCount
}) => {
	const hasRollingNames = rollingNames.length > 0;

	return (
		<div className="lottery-stage-layout">
			<section className={`lottery-panel draw-stage${isDrawing ? " is-drawing" : ""}`}>
				<div className="stage-title">
					<GiftOutlined />
					<Typography.Text type="secondary">当前抽取</Typography.Text>
				</div>
				{hasRollingNames ? (
					// 多人同时抽取时，每个中奖名额对应一个固定槽位，停止后也沿用同一布局展示结果。
					<div
						className="rolling-grid"
						style={{ gridTemplateColumns: `repeat(${Math.min(rollingNames.length, 4)}, minmax(0, 1fr))` }}
					>
						{rollingNames.map((name, index) => (
							<div className="rolling-card" key={`${name}-${index}`}>
								<span className="rolling-index">#{index + 1}</span>
								<span className="rolling-name">{name}</span>
							</div>
						))}
					</div>
				) : (
					<Empty className="stage-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="选择奖项后开始抽奖" />
				)}
				{latestWinners.length > 0 && (
					<div className="latest-winner-list">
						<Typography.Text type="secondary">本次中奖</Typography.Text>
						<Space wrap>
							{latestWinners.map(winner => (
								<Tag color="green" key={winner.id}>
									{winner.prizeNameSnapshot}：{winner.winnerNameSnapshot}
								</Tag>
							))}
						</Space>
					</div>
				)}
			</section>
			<section className="lottery-panel stat-panel">
				<div>
					<Typography.Title level={4}>{participantsCount}</Typography.Title>
					<Typography.Text type="secondary">参与人</Typography.Text>
				</div>
				<div>
					<Typography.Title level={4}>{prizesCount}</Typography.Title>
					<Typography.Text type="secondary">奖项</Typography.Text>
				</div>
				<div>
					<Typography.Title level={4}>{winnersCount}</Typography.Title>
					<Typography.Text type="secondary">中奖记录</Typography.Text>
				</div>
			</section>
		</div>
	);
};

export default DrawStage;
