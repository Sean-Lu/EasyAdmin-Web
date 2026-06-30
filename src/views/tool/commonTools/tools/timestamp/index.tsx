import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined, ClockCircleOutlined, CopyOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Divider, Input, Row, Segmented, Select, Space, Tabs, Typography } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { useSelector } from "react-redux";
import clipboardUtil from "@/utils/clipboardUtil";
import "./index.less";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

type TimestampUnit = "seconds" | "milliseconds";

interface TimestampProps {
	onBack?: () => void;
}

const TIMEZONES = [
	{ label: "UTC", value: "UTC" },
	{ label: "Asia/Shanghai", value: "Asia/Shanghai" },
	{ label: "Asia/Tokyo", value: "Asia/Tokyo" },
	{ label: "Asia/Hong_Kong", value: "Asia/Hong_Kong" },
	{ label: "Asia/Singapore", value: "Asia/Singapore" },
	{ label: "America/New_York", value: "America/New_York" },
	{ label: "America/Los_Angeles", value: "America/Los_Angeles" },
	{ label: "Europe/London", value: "Europe/London" },
	{ label: "Europe/Paris", value: "Europe/Paris" },
	{ label: "Australia/Sydney", value: "Australia/Sydney" }
];

// 时间戳转换工具
const Timestamp: React.FC<TimestampProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);

	// Detect timezone once
	const guessedTz = useMemo(() => dayjs.tz.guess(), []);

	// Tab 1 state: timestamp -> time
	const [tsInput, setTsInput] = useState("");
	const [unit, setUnit] = useState<TimestampUnit>("seconds");
	const [tz1, setTz1] = useState(guessedTz);

	// Tab 2 state: time -> timestamp
	const [dateValue, setDateValue] = useState<dayjs.Dayjs | null>(null);
	const [tz2, setTz2] = useState(guessedTz);

	// Real-time timestamp
	const [now, setNow] = useState(dayjs());

	useEffect(() => {
		const timer = setInterval(() => setNow(dayjs()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Timezone options with offsets (include detected timezone if not in list)
	const tzOptions = useMemo(() => {
		const base = TIMEZONES.map(tz => ({
			label: `${tz.label} (UTC${dayjs().tz(tz.value).format("Z")})`,
			value: tz.value
		}));
		if (!TIMEZONES.some(tz => tz.value === guessedTz)) {
			base.unshift({
				label: `${guessedTz} (UTC${dayjs().tz(guessedTz).format("Z")})`,
				value: guessedTz
			});
		}
		return base;
	}, [guessedTz]);

	// Tab 1 conversion results
	const tsResults = useMemo(() => {
		const trimmed = tsInput.trim();
		if (!trimmed || !/^-?\d+$/.test(trimmed)) return null;

		const num = Number(trimmed);
		const ms = unit === "seconds" ? num * 1000 : num;
		const result = dayjs(ms).tz(tz1);

		if (!result.isValid()) return null;

		return {
			formatted: result.format("YYYY-MM-DD HH:mm:ss"),
			iso: result.toISOString(),
			relative: result.locale("zh-cn").fromNow(),
			weekday: result.locale("zh-cn").format("dddd")
		};
	}, [tsInput, unit, tz1]);

	// Tab 2 conversion results
	const dateResults = useMemo(() => {
		if (!dateValue) return null;

		const dateStr = dateValue.format("YYYY-MM-DD HH:mm:ss");
		const picked = dayjs.tz(dateStr, "YYYY-MM-DD HH:mm:ss", tz2);

		if (!picked.isValid()) return null;

		return {
			seconds: Math.floor(picked.valueOf() / 1000),
			milliseconds: picked.valueOf()
		};
	}, [dateValue, tz2]);

	// Handle timestamp input change with auto-detect
	const handleTsInput = (value: string) => {
		setTsInput(value);
		const trimmed = value.trim();
		if (/^\d{10}$/.test(trimmed)) {
			setUnit("seconds");
		} else if (/^\d{13}$/.test(trimmed)) {
			setUnit("milliseconds");
		}
	};

	// Real-time values
	const nowSeconds = Math.floor(now.valueOf() / 1000);
	const nowMilliseconds = now.valueOf();
	const nowFormatted = now.format("YYYY-MM-DD HH:mm:ss");

	const tabItems = [
		{
			key: "ts-to-time",
			label: "时间戳 → 时间",
			children: (
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Space wrap>
							<Segmented
								value={unit}
								onChange={value => setUnit(value as TimestampUnit)}
								options={[
									{ label: "秒", value: "seconds" },
									{ label: "毫秒", value: "milliseconds" }
								]}
							/>
							<Select value={tz1} onChange={setTz1} options={tzOptions} style={{ minWidth: 280 }} showSearch />
						</Space>
					</Col>
					<Col span={24}>
						<Input
							value={tsInput}
							onChange={event => handleTsInput(event.target.value)}
							placeholder="请输入时间戳"
							allowClear
							size="large"
							inputMode="numeric"
							status={tsInput && !tsResults ? "error" : ""}
						/>
						{tsInput && !tsResults && (
							<Typography.Text type="danger" style={{ fontSize: 12 }}>
								请输入有效的数字时间戳
							</Typography.Text>
						)}
					</Col>
					{tsResults && (
						<Col span={24}>
							<div className="ts-result-card">
								<div className="ts-result-row">
									<Typography.Text type="secondary">日期时间</Typography.Text>
									<div className="ts-result-value">
										<Typography.Text strong style={{ fontSize: 18 }}>
											{tsResults.formatted}
										</Typography.Text>
										<Button
											type="text"
											size="small"
											icon={<CopyOutlined />}
											onClick={() => clipboardUtil.copyString(tsResults.formatted)}
										/>
									</div>
								</div>
								<div className="ts-result-row">
									<Typography.Text type="secondary">星期</Typography.Text>
									<Typography.Text>{tsResults.weekday}</Typography.Text>
								</div>
								<div className="ts-result-row">
									<Typography.Text type="secondary">ISO 8601</Typography.Text>
									<div className="ts-result-value">
										<Typography.Text code style={{ wordBreak: "break-all" }}>
											{tsResults.iso}
										</Typography.Text>
										<Button
											type="text"
											size="small"
											icon={<CopyOutlined />}
											onClick={() => clipboardUtil.copyString(tsResults.iso)}
										/>
									</div>
								</div>
								<div className="ts-result-row">
									<Typography.Text type="secondary">相对时间</Typography.Text>
									<Typography.Text>{tsResults.relative}</Typography.Text>
								</div>
							</div>
						</Col>
					)}
				</Row>
			)
		},
		{
			key: "time-to-ts",
			label: "时间 → 时间戳",
			children: (
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Space wrap>
							<Typography.Text>时区:</Typography.Text>
							<Select value={tz2} onChange={setTz2} options={tzOptions} style={{ minWidth: 280 }} showSearch />
						</Space>
					</Col>
					<Col span={24}>
						<DatePicker
							showTime
							format="YYYY-MM-DD HH:mm:ss"
							value={dateValue}
							onChange={value => setDateValue(value)}
							placeholder="请选择日期时间"
							style={{ width: "100%" }}
							size="large"
						/>
					</Col>
					{dateResults && (
						<Col span={24}>
							<div className="ts-result-card">
								<div className="ts-result-row">
									<Typography.Text type="secondary">秒级时间戳</Typography.Text>
									<div className="ts-result-value">
										<Typography.Text strong style={{ fontSize: 18 }}>
											{dateResults.seconds}
										</Typography.Text>
										<Button
											type="text"
											size="small"
											icon={<CopyOutlined />}
											onClick={() => clipboardUtil.copyString(String(dateResults.seconds))}
										/>
									</div>
								</div>
								<div className="ts-result-row">
									<Typography.Text type="secondary">毫秒级时间戳</Typography.Text>
									<div className="ts-result-value">
										<Typography.Text strong style={{ fontSize: 18 }}>
											{dateResults.milliseconds}
										</Typography.Text>
										<Button
											type="text"
											size="small"
											icon={<CopyOutlined />}
											onClick={() => clipboardUtil.copyString(String(dateResults.milliseconds))}
										/>
									</div>
								</div>
							</div>
						</Col>
					)}
				</Row>
			)
		}
	];

	return (
		<div className={`timestamp-page${isDark ? " timestamp-dark" : ""}`}>
			<Card
				title={
					<Space>
						<ClockCircleOutlined />
						时间戳转换
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
				<Tabs defaultActiveKey="ts-to-time" items={tabItems} />

				<Divider />

				<div className="realtime-section">
					<Typography.Title level={5}>
						<FieldTimeOutlined /> 当前时间戳（实时刷新）
					</Typography.Title>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={8}>
							<div className="realtime-card">
								<Typography.Text type="secondary">秒级</Typography.Text>
								<div className="realtime-value">
									<Typography.Text strong>{nowSeconds}</Typography.Text>
									<Button
										type="text"
										size="small"
										icon={<CopyOutlined />}
										onClick={() => clipboardUtil.copyString(String(nowSeconds))}
									/>
								</div>
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div className="realtime-card">
								<Typography.Text type="secondary">毫秒级</Typography.Text>
								<div className="realtime-value">
									<Typography.Text strong>{nowMilliseconds}</Typography.Text>
									<Button
										type="text"
										size="small"
										icon={<CopyOutlined />}
										onClick={() => clipboardUtil.copyString(String(nowMilliseconds))}
									/>
								</div>
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div className="realtime-card">
								<Typography.Text type="secondary">本地时间</Typography.Text>
								<div className="realtime-value">
									<Typography.Text strong>{nowFormatted}</Typography.Text>
									<Button
										type="text"
										size="small"
										icon={<CopyOutlined />}
										onClick={() => clipboardUtil.copyString(nowFormatted)}
									/>
								</div>
							</div>
						</Col>
					</Row>
				</div>
			</Card>
		</div>
	);
};

export default Timestamp;
