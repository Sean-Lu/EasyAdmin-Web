import React, { useState } from "react";
import { ArrowLeftOutlined, ClearOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Space, Typography, message } from "antd";
import "./index.less";

const sampleUrl = ""; // 示例 URL

interface UrlCodecProps {
	onBack?: () => void;
}

const safeDecodeUrl = (value: string) => {
	try {
		return decodeURI(value);
	} catch (error) {
		return decodeURIComponent(value);
	}
};

// URL 编码/解码工具
const UrlCodec: React.FC<UrlCodecProps> = ({ onBack }) => {
	const [inputText, setInputText] = useState(sampleUrl);
	const [outputText, setOutputText] = useState("");

	const handleEncode = () => {
		if (!inputText) {
			message.warning("请输入 URL 或文本");
			return;
		}
		setOutputText(encodeURI(inputText));
	};

	const handleDecode = () => {
		if (!inputText) {
			message.warning("请输入 URL 或文本");
			return;
		}

		try {
			setOutputText(safeDecodeUrl(inputText));
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
							placeholder="请输入需要编码或解码的 URL"
							rows={8}
							allowClear
						/>
					</Col>

					<Col span={24}>
						<Space wrap>
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
