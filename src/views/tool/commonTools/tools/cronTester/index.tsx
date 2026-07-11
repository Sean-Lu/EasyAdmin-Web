import React, { useMemo, useRef, useState } from "react";
import { ArrowLeftOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Divider, Input, InputNumber, List, Row, Space, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { calculateCronRuns } from "./calculateCronRuns";
import { validateQuartzCron } from "./utils";
import "./index.less";

interface CronTesterProps {
	onBack?: () => void;
}

const EXAMPLES = [
	{ label: "每 5 分钟执行", value: "0 0/5 * * * ?" },
	{ label: "每天 5 点执行", value: "0 0 5 * * ?" },
	{ label: "每周六凌晨 1 点执行", value: "0 0 1 ? * 7" },
	{ label: "周一至周五上午 10:15 触发", value: "0 15 10 ? * 2-6" },
	{ label: "每天上午 10:00 至 10:59 每分钟触发", value: "0 * 10 * * ?" },
	{ label: "每天上午 10 点、下午 2 点、4 点执行", value: "0 0 10,14,16 * * ?" },
	{ label: "朝九晚五工作时间内每半小时", value: "0 0/30 9-17 ? * 2-6" },
	{ label: "每月 15 日上午 10:15 触发", value: "0 15 10 15 * ?" },
	{ label: "每天 23 点执行一次", value: "0 0 23 * * ?" }
];

const FIELD_ROWS = [
	{ key: "second", field: "秒", description: "一分钟内的第几秒", required: "是", range: "0-59", example: "0, 30, */5" },
	{ key: "minute", field: "分", description: "一小时内的第几分钟", required: "是", range: "0-59", example: "0, 15, */15" },
	{ key: "hour", field: "时", description: "一天内的第几小时", required: "是", range: "0-23", example: "0, 12, */2" },
	{ key: "day", field: "日", description: "一个月内的第几天", required: "与星期二选一", range: "1-31", example: "1, 15, ?" },
	{ key: "month", field: "月", description: "一年内的第几个月", required: "是", range: "1-12", example: "1, 6, *" },
	{
		key: "weekday",
		field: "星期",
		description: "一周内的星期几",
		required: "与日期二选一",
		range: "1-7（1 为星期日）",
		example: "2-6, ?"
	}
];

const SPECIAL_ROWS = [
	{ key: "star", symbol: "*", description: "表示所有可能的值", example: "小时字段中，* 表示每小时" },
	{ key: "comma", symbol: ",", description: "用于列举多个值", example: "分钟字段中，1,15,30 表示第 1、15、30 分钟" },
	{ key: "range", symbol: "-", description: "表示一个范围", example: "小时字段中，9-17 表示上午 9 点到下午 5 点" },
	{ key: "step", symbol: "/", description: "表示递增间隔", example: "分钟字段中，0/15 表示每 15 分钟" },
	{ key: "question", symbol: "?", description: "日期和星期字段中，表示不指定", example: "0 0 12 ? * 2 表示每周一中午 12 点" }
];

// Cron 表达式测试工具
const CronTester: React.FC<CronTesterProps> = ({ onBack }) => {
	const [expression, setExpression] = useState(EXAMPLES[0].value);
	const [runCount, setRunCount] = useState(5);
	const [runs, setRuns] = useState<dayjs.Dayjs[]>([]);
	const [calculating, setCalculating] = useState(false);
	const calculationToken = useRef(0);
	const validation = useMemo(() => validateQuartzCron(expression), [expression]);
	const fields = expression.trim().split(/\s+/);

	const handleExpressionChange = (value: string) => {
		calculationToken.current += 1;
		setExpression(value);
		setRuns([]);
		setCalculating(false);
	};

	const handleCalculate = () => {
		if (!validation.valid || calculating) return;

		const token = ++calculationToken.current;
		const currentExpression = expression;
		const currentRunCount = runCount;
		setRuns([]);
		setCalculating(true);

		// 先让浏览器绘制清空后的结果和 loading，再执行可能耗时的扫描。
		window.setTimeout(async () => {
			if (token !== calculationToken.current) return;
			try {
				const calculatedRuns = await calculateCronRuns(currentExpression, currentRunCount);
				if (token === calculationToken.current) {
					setRuns(calculatedRuns.map(run => dayjs(run)));
				}
			} finally {
				if (token === calculationToken.current) setCalculating(false);
			}
		}, 0);
	};

	return (
		<Card
			className="cron-tester-card"
			title={
				<Space>
					<ClockCircleOutlined />
					Cron 表达式测试
					<Tag color="blue">Quartz Cron</Tag>
				</Space>
			}
			extra={
				onBack && (
					<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
						返回百宝箱
					</Button>
				)
			}
		>
			<Alert
				showIcon
				icon={<InfoCircleOutlined />}
				message="项目定时任务使用 Quartz 6 字段格式：秒 分 时 日 月 星期"
				description="日期和星期字段必须有且只有一个使用 ?。本工具中的执行时间以当前浏览器本地时间为准。"
				style={{ marginBottom: 16 }}
			/>

			<Typography.Title level={5}>常用模板</Typography.Title>
			<Row gutter={[8, 8]}>
				{EXAMPLES.map(example => (
					<Col xs={24} sm={12} lg={8} key={example.value}>
						<Button
							block
							type={expression === example.value ? "primary" : "default"}
							onClick={() => handleExpressionChange(example.value)}
							style={{ height: "auto", minHeight: 48, padding: "8px 12px", textAlign: "left", whiteSpace: "normal" }}
						>
							<div>{example.label}</div>
							<Typography.Text code style={{ color: expression === example.value ? "inherit" : undefined }}>
								{example.value}
							</Typography.Text>
						</Button>
					</Col>
				))}
			</Row>

			<Divider />
			<Row gutter={[16, 16]} align="bottom" className="cron-expression-row">
				<Col xs={24} md={18}>
					<Typography.Text strong>Cron 表达式</Typography.Text>
					<Input
						value={expression}
						onChange={event => handleExpressionChange(event.target.value)}
						size="large"
						placeholder="例如：0 0/5 * * * ?"
					/>
				</Col>
				<Col xs={24} md={6}>
					<Typography.Text strong>预览次数</Typography.Text>
					<InputNumber
						min={1}
						max={20}
						value={runCount}
						onChange={value => {
							setRunCount(value ?? 5);
							setRuns([]);
							calculationToken.current += 1;
							setCalculating(false);
						}}
						addonAfter="次"
						size="large"
						style={{ width: "100%" }}
					/>
					<Button
						type="primary"
						size="large"
						onClick={handleCalculate}
						loading={calculating}
						disabled={!validation.valid || calculating}
					>
						计算执行时间
					</Button>
				</Col>
			</Row>

			<Divider />
			{validation.valid ? (
				<Alert type="success" message="Cron 表达式有效" showIcon />
			) : (
				<Alert type="error" message={validation.error} showIcon />
			)}

			<Row gutter={[20, 20]} className="cron-result-row">
				<Col xs={24} lg={15}>
					<Typography.Title level={5}>表达式解析</Typography.Title>
					<Table
						size="small"
						bordered
						pagination={false}
						dataSource={FIELD_ROWS.map((row, index) => ({ ...row, value: fields[index] || "-" }))}
						columns={[
							{ title: "字段", dataIndex: "field", width: 64 },
							{
								title: "当前值",
								dataIndex: "value",
								width: 90,
								render: value => <Typography.Text code>{value}</Typography.Text>
							},
							{ title: "说明", dataIndex: "description" },
							{ title: "允许值", dataIndex: "range", width: 130 }
						]}
					/>
				</Col>
				<Col xs={24} lg={9}>
					<Typography.Title level={5}>未来 {runCount} 次执行时间</Typography.Title>
					{runs.length > 0 ? (
						<List
							bordered
							size="small"
							dataSource={runs}
							renderItem={(run, index) => (
								<List.Item>
									<Space>
										<Tag>{index + 1}</Tag>
										{run.format("YYYY-MM-DD HH:mm:ss")}
									</Space>
								</List.Item>
							)}
						/>
					) : (
						<Typography.Text type="secondary">暂无可计算的执行时间</Typography.Text>
					)}
				</Col>
			</Row>

			<Divider />
			<Typography.Title level={5}>特殊字符说明</Typography.Title>
			<Table
				size="small"
				bordered
				pagination={false}
				dataSource={SPECIAL_ROWS}
				columns={[
					{ title: "字符", dataIndex: "symbol", width: 70, render: value => <Typography.Text code>{value}</Typography.Text> },
					{ title: "说明", dataIndex: "description" },
					{ title: "示例", dataIndex: "example" }
				]}
			/>

			<Divider />
			<Typography.Title level={5}>使用说明</Typography.Title>
			<Typography.Paragraph type="secondary">
				<ul>
					<li>输入或点击常用模板生成 Quartz Cron 表达式</li>
					<li>工具会即时校验表达式，并展示字段解析结果</li>
					<li>可调整预览次数，查看未来 1 至 20 次执行时间</li>
				</ul>
			</Typography.Paragraph>
		</Card>
	);
};

export default CronTester;
