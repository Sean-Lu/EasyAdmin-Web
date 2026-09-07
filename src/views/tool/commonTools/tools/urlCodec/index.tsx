import React, { useState } from "react";
import { ArrowLeftOutlined, ClearOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Space, Typography, message } from "antd";
import "./index.less";

const sampleUrl = ""; // 示例 URL

interface UrlCodecProps {
	onBack?: () => void;
}

// URL 编码/解码工具
const UrlCodec: React.FC<UrlCodecProps> = ({ onBack }) => {
	const [mode, setMode] = useState<"uri" | "component">("uri");
	const [inputText, setInputText] = useState(sampleUrl);
	const [outputText, setOutputText] = useState("");

	const handleEncode = () => {
		if (!inputText) {
			message.warning("请输入 URL 或文本");
			return;
		}
		setOutputText(mode === "uri" ? encodeURI(inputText) : encodeURIComponent(inputText));
	};

	const handleDecode = () => {
		if (!inputText) {
			message.warning("请输入 URL 或文本");
			return;
		}

		try {
			setOutputText(mode === "uri" ? decodeURI(inputText) : decodeURIComponent(inputText));
		} catch (error) {
			message.error("URL 解码失败，请检查百分号编码是否完整");
		}
	};

	const handleSwap = () => {
		setInputText(outputText);
		setOutputText(inputText);
	};

	const handleClear = () => {
		setInputText("");
		setOutputText("");
	};

	return (
		<div className="url-codec-page">
			<Card
				title="URL 编码/解码"
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Input.TextArea
							value={inputText}
							onChange={event => setInputText(event.target.value)}
							placeholder="请输入需要处理的网址或文本"
							rows={8}
							allowClear
						/>
					</Col>

					<Col span={24}>
						<Space wrap>
							<Typography.Text>处理模式:</Typography.Text>
							<Select
								value={mode}
								onChange={setMode}
								options={[
									{ label: "完整网址", value: "uri" },
									{ label: "全部字符", value: "component" }
								]}
							/>
							<Typography.Text>字符编码:</Typography.Text>
							<Select value="UTF-8" options={[{ label: "UTF-8", value: "UTF-8" }]} className="charset-select" />
							<Button type="primary" ghost onClick={handleEncode}>
								URL 编码
							</Button>
							<Button type="primary" ghost onClick={handleDecode}>
								URL 解码
							</Button>
							<Button icon={<SwapOutlined />} onClick={handleSwap}>
								交换
							</Button>
							<Button danger icon={<ClearOutlined />} onClick={handleClear}>
								清空
							</Button>
						</Space>
					</Col>

					<Col span={24}>
						<Typography.Text type="secondary">
							{mode === "uri"
								? "保留网址结构相关编码，%2F、%3F、%3D 等不会被解码，解码结果可能与输入相同。"
								: "解码会还原所有编码字符，便于查看内容；完整网址解码后可能改变原有含义。"}
						</Typography.Text>
					</Col>

					<Col span={24}>
						<Input.TextArea
							value={outputText}
							placeholder="输出结果"
							rows={8}
							allowClear
							onChange={event => setOutputText(event.target.value)}
						/>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default UrlCodec;
