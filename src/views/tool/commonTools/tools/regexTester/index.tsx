import React, { useMemo, useState } from "react";
import { ArrowLeftOutlined, CodeOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Divider, Input, Row, Space, Tag, Typography } from "antd";
import { testRegex } from "./utils";
import "./index.less";

const { TextArea } = Input;

interface RegexTesterProps {
	onBack?: () => void;
}

const FLAG_OPTIONS = [
	{ label: "g 全局", value: "g" },
	{ label: "i 忽略大小写", value: "i" },
	{ label: "m 多行", value: "m" },
	{ label: "s 点号匹配换行", value: "s" },
	{ label: "u Unicode", value: "u" }
];

// 正则表达式测试器
const RegexTester: React.FC<RegexTesterProps> = ({ onBack }) => {
	const [pattern, setPattern] = useState("(\\w+)-(\\d+)");
	const [flags, setFlags] = useState("g");
	const [text, setText] = useState("order-123\norder-456");
	const result = useMemo(() => testRegex(pattern, flags, text), [pattern, flags, text]);

	return (
		<Card
			className="regex-tester-card"
			title={
				<Space>
					<CodeOutlined />
					正则表达式测试
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
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<Typography.Text strong>正则表达式</Typography.Text>
					<Input
						value={pattern}
						onChange={event => setPattern(event.target.value)}
						placeholder="例如：^(\\d{4})-(\\d{2})-(\\d{2})$"
						size="large"
					/>
				</Col>
				<Col xs={24} lg={12} className="regex-flags-col">
					<Typography.Text strong>Flags</Typography.Text>
					<Checkbox.Group
						options={FLAG_OPTIONS}
						value={flags.split("").filter(Boolean)}
						onChange={value => setFlags(value.join(""))}
					/>
				</Col>
				<Col span={24}>
					<Typography.Text strong>测试文本</Typography.Text>
					<TextArea
						value={text}
						onChange={event => setText(event.target.value)}
						autoSize={{ minRows: 6, maxRows: 12 }}
						placeholder="输入要匹配的文本"
					/>
				</Col>
			</Row>
			<Divider />
			{result.error ? (
				<Typography.Text type="danger">表达式错误：{result.error}</Typography.Text>
			) : (
				<>
					<Typography.Text type={result.matches.length ? "success" : "secondary"}>
						{result.matches.length ? `匹配到 ${result.matches.length} 项` : "未匹配到内容"}
					</Typography.Text>
					{result.matches.map((item, index) => (
						<Card size="small" key={`${item.index}-${index}`} style={{ marginTop: 12 }}>
							<Space wrap>
								<Tag color="blue">#{index + 1}</Tag>
								<Typography.Text code>{item.match || "(空匹配)"}</Typography.Text>
								<Typography.Text type="secondary">位置：{item.index}</Typography.Text>
							</Space>
							{item.captures.length > 0 && (
								<div style={{ marginTop: 8 }}>
									捕获组：
									{item.captures.map((capture, captureIndex) => (
										<Tag key={captureIndex}>
											${captureIndex + 1}: {capture || "(空)"}
										</Tag>
									))}
								</div>
							)}
						</Card>
					))}
				</>
			)}
		</Card>
	);
};

export default RegexTester;
