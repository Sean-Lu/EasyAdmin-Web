import React, { useState } from "react";
import {
	ArrowLeftOutlined,
	ClearOutlined,
	CopyOutlined,
	DownloadOutlined,
	QrcodeOutlined,
	SettingOutlined,
	SnippetsOutlined,
	UploadOutlined
} from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	ColorPicker,
	Form,
	Input,
	InputNumber,
	Row,
	Select,
	Space,
	Tabs,
	Typography,
	Upload,
	message
} from "antd";
import type { Color } from "antd/es/color-picker";
import type { RcFile } from "antd/es/upload/interface";
import jsQR from "jsqr";
import QRCode from "qrcode";
import "./index.less";

interface QrCodeProps {
	onBack?: () => void;
}

const sampleText = "https://easyadmin.local";
const defaultQrSize = 280;
const defaultDarkColor = "#111827";
const defaultLightColor = "#ffffff";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

const errorCorrectionOptions = [
	{ label: "低 (L)", value: "L" },
	{ label: "中 (M)", value: "M" },
	{ label: "较高 (Q)", value: "Q" },
	{ label: "高 (H)", value: "H" }
];

const dataUrlToDownload = (dataUrl: string, filename: string) => {
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	link.click();
};

const copyText = async (text: string) => {
	await navigator.clipboard.writeText(text);
};

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error("read image failed"));
		reader.readAsDataURL(file);
	});

const loadImage = (src: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("load image failed"));
		image.src = src;
	});

const toHexColor = (value: string | Color) => (typeof value === "string" ? value : value.toHexString());

const drawRoundedRect = (
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) => {
	const normalizedRadius = Math.min(radius, width / 2, height / 2);

	context.beginPath();
	context.moveTo(x + normalizedRadius, y);
	context.lineTo(x + width - normalizedRadius, y);
	context.quadraticCurveTo(x + width, y, x + width, y + normalizedRadius);
	context.lineTo(x + width, y + height - normalizedRadius);
	context.quadraticCurveTo(x + width, y + height, x + width - normalizedRadius, y + height);
	context.lineTo(x + normalizedRadius, y + height);
	context.quadraticCurveTo(x, y + height, x, y + height - normalizedRadius);
	context.lineTo(x, y + normalizedRadius);
	context.quadraticCurveTo(x, y, x + normalizedRadius, y);
	context.closePath();
};

const composeQrCodeImage = async (qrDataUrl: string, size: number, logoDataUrl: string, backgroundColor: string) => {
	const qrImage = await loadImage(qrDataUrl);
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("canvas context unavailable");
	}

	context.fillStyle = backgroundColor;
	context.fillRect(0, 0, size, size);
	context.drawImage(qrImage, 0, 0, size, size);

	if (logoDataUrl) {
		const logoImage = await loadImage(logoDataUrl);
		const logoSize = Math.round(size * 0.2);
		const logoPadding = Math.round(size * 0.03);
		const logoBoxSize = logoSize + logoPadding * 2;
		const logoBoxX = Math.round((size - logoBoxSize) / 2);
		const logoBoxY = Math.round((size - logoBoxSize) / 2);
		const logoX = logoBoxX + logoPadding;
		const logoY = logoBoxY + logoPadding;

		context.fillStyle = backgroundColor;
		drawRoundedRect(context, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, Math.round(size * 0.04));
		context.fill();
		context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
	}

	return canvas.toDataURL("image/png");
};

const decodeQrCodeFromFile = async (file: File) => {
	const imageUrl = await readFileAsDataUrl(file);
	const image = await loadImage(imageUrl);
	const canvas = document.createElement("canvas");
	canvas.width = image.naturalWidth || image.width;
	canvas.height = image.naturalHeight || image.height;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("canvas context unavailable");
	}

	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	const result = jsQR(imageData.data, imageData.width, imageData.height);

	return result?.data || "";
};

const readClipboardImageFile = async () => {
	if (!navigator.clipboard?.read) {
		throw new Error("clipboard read unsupported");
	}

	const clipboardItems = await navigator.clipboard.read();
	for (const item of clipboardItems) {
		const imageType = item.types.find(type => type.startsWith("image/"));
		if (imageType) {
			const blob = await item.getType(imageType);
			return new File([blob], "clipboard-qrcode.png", { type: imageType });
		}
	}

	return null;
};

const getPastedImageFile = (event: React.ClipboardEvent<HTMLElement>) => {
	const items = Array.from(event.clipboardData.items);
	const imageItem = items.find(item => item.type.startsWith("image/"));
	return imageItem?.getAsFile() || null;
};

// 二维码生成/解析工具
const QrCode: React.FC<QrCodeProps> = ({ onBack }) => {
	const [inputText, setInputText] = useState(sampleText);
	const [qrDataUrl, setQrDataUrl] = useState("");
	const [generating, setGenerating] = useState(false);
	const [decoding, setDecoding] = useState(false);
	const [decodedText, setDecodedText] = useState("");
	const [uploadedImageUrl, setUploadedImageUrl] = useState("");
	const [qrSize, setQrSize] = useState(defaultQrSize);
	const [darkColor, setDarkColor] = useState(defaultDarkColor);
	const [lightColor, setLightColor] = useState(defaultLightColor);
	const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("H");
	const [margin, setMargin] = useState(2);
	const [logoDataUrl, setLogoDataUrl] = useState("");
	const [logoName, setLogoName] = useState("");

	const handleGenerate = async () => {
		const text = inputText.trim();
		if (!text) {
			message.warning("请输入需要生成二维码的文本");
			return;
		}

		try {
			setGenerating(true);
			const baseDataUrl = await QRCode.toDataURL(text, {
				errorCorrectionLevel,
				margin,
				width: qrSize,
				color: {
					dark: darkColor,
					light: lightColor
				}
			});
			const dataUrl = await composeQrCodeImage(baseDataUrl, qrSize, logoDataUrl, lightColor);
			setQrDataUrl(dataUrl);
			message.success("二维码生成成功");
		} catch (error) {
			message.error("二维码生成失败，请稍后重试");
		} finally {
			setGenerating(false);
		}
	};

	const handleDownload = () => {
		if (!qrDataUrl) return;
		dataUrlToDownload(qrDataUrl, "qrcode.png");
	};

	const handleClearGenerate = () => {
		setInputText("");
		setQrDataUrl("");
	};

	const handleLogoUpload = async (file: RcFile) => {
		if (!file.type.startsWith("image/")) {
			message.warning("请上传图片文件");
			return Upload.LIST_IGNORE;
		}

		try {
			const imageUrl = await readFileAsDataUrl(file);
			setLogoDataUrl(imageUrl);
			setLogoName(file.name);
			setQrDataUrl("");
			message.success("Logo 已添加");
		} catch (error) {
			message.error("Logo 加载失败，请重新上传");
		}

		return Upload.LIST_IGNORE;
	};

	const handleClearLogo = () => {
		setLogoDataUrl("");
		setLogoName("");
		setQrDataUrl("");
	};

	const handleBeforeUpload = (file: RcFile) => {
		void handleDecode(file);
		return Upload.LIST_IGNORE;
	};

	const handleDecode = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			message.warning("请上传图片文件");
			return;
		}

		try {
			setDecoding(true);
			setDecodedText("");
			const imageUrl = await readFileAsDataUrl(file);
			setUploadedImageUrl(imageUrl);

			const text = await decodeQrCodeFromFile(file);
			if (!text) {
				message.warning("未识别到二维码内容，请更换清晰图片");
				return;
			}

			setDecodedText(text);
			message.success("二维码解析成功");
		} catch (error) {
			message.error("图片加载失败，请重新上传");
		} finally {
			setDecoding(false);
		}
	};

	const handleReadClipboard = async () => {
		try {
			const file = await readClipboardImageFile();
			if (!file) {
				message.warning("剪切板中未找到图片");
				return;
			}

			await handleDecode(file);
		} catch (error) {
			message.error("无法读取剪切板图片，请检查浏览器权限");
		}
	};

	const handlePasteImage = (event: React.ClipboardEvent<HTMLElement>) => {
		const file = getPastedImageFile(event);
		if (!file) return;

		event.preventDefault();
		void handleDecode(file);
	};

	const handleCopy = async () => {
		if (!decodedText) return;

		try {
			await copyText(decodedText);
			message.success("已复制解析内容");
		} catch (error) {
			message.error("复制失败，请手动复制");
		}
	};

	const handleClearDecode = () => {
		setDecodedText("");
		setUploadedImageUrl("");
	};

	const tabItems = [
		{
			key: "generate",
			label: "生成二维码",
			children: (
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={14}>
						<Space direction="vertical" size={12} className="qr-code-panel">
							<Typography.Text type="secondary">输入文本、链接或其他内容，生成可下载的二维码图片。</Typography.Text>
							<Input.TextArea
								value={inputText}
								onChange={event => setInputText(event.target.value)}
								placeholder="请输入需要生成二维码的文本"
								rows={10}
								allowClear
							/>
							<Card size="small" title="生成参数" className="qr-options-card">
								<Row gutter={[16, 12]}>
									<Col xs={24} sm={12}>
										<Form.Item label="尺寸" className="qr-option-item">
											<InputNumber
												min={160}
												max={640}
												step={20}
												value={qrSize}
												addonAfter="px"
												onChange={value => {
													setQrSize(value || defaultQrSize);
													setQrDataUrl("");
												}}
												className="qr-option-control"
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item label="边距" className="qr-option-item">
											<InputNumber
												min={0}
												max={8}
												value={margin}
												onChange={value => {
													setMargin(value ?? 2);
													setQrDataUrl("");
												}}
												className="qr-option-control"
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item label="前景色" className="qr-option-item">
											<ColorPicker
												value={darkColor}
												showText
												onChangeComplete={color => {
													setDarkColor(toHexColor(color));
													setQrDataUrl("");
												}}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item label="背景色" className="qr-option-item">
											<ColorPicker
												value={lightColor}
												showText
												onChangeComplete={color => {
													setLightColor(toHexColor(color));
													setQrDataUrl("");
												}}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item label="容错级别" className="qr-option-item">
											<Select
												value={errorCorrectionLevel}
												options={errorCorrectionOptions}
												onChange={value => {
													setErrorCorrectionLevel(value);
													setQrDataUrl("");
												}}
												className="qr-option-control"
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item label="Logo" className="qr-option-item">
											<Space wrap>
												<Upload accept="image/*" beforeUpload={handleLogoUpload} showUploadList={false}>
													<Button icon={<UploadOutlined />}>上传 Logo</Button>
												</Upload>
												<Button disabled={!logoDataUrl} onClick={handleClearLogo}>
													移除
												</Button>
											</Space>
										</Form.Item>
									</Col>
									{logoName && (
										<Col span={24}>
											<Typography.Text type="secondary">当前 Logo：{logoName}</Typography.Text>
										</Col>
									)}
								</Row>
							</Card>
							<Space wrap>
								<Button type="primary" icon={<QrcodeOutlined />} loading={generating} onClick={handleGenerate}>
									生成二维码
								</Button>
								<Button icon={<DownloadOutlined />} disabled={!qrDataUrl} onClick={handleDownload}>
									下载图片
								</Button>
								<Button danger icon={<ClearOutlined />} onClick={handleClearGenerate}>
									清空
								</Button>
							</Space>
						</Space>
					</Col>
					<Col xs={24} lg={10}>
						<div className="qr-code-preview">
							{qrDataUrl ? (
								<img src={qrDataUrl} alt="生成的二维码" />
							) : (
								<Space direction="vertical" align="center">
									<SettingOutlined className="qr-preview-icon" />
									<Typography.Text type="secondary">二维码预览</Typography.Text>
								</Space>
							)}
						</div>
					</Col>
				</Row>
			)
		},
		{
			key: "decode",
			label: "识别二维码",
			children: (
				<Row gutter={[16, 16]} className="qr-decode-panel" tabIndex={0} onPaste={handlePasteImage}>
					<Col xs={24} lg={10}>
						<Space direction="vertical" size={12} className="qr-code-panel">
							<Typography.Text type="secondary">
								上传、粘贴或从剪切板读取包含二维码的图片，自动解析其中的文本内容。
							</Typography.Text>
							<Space wrap>
								<Upload accept="image/*" beforeUpload={handleBeforeUpload} showUploadList={false}>
									<Button type="primary" icon={<UploadOutlined />} loading={decoding}>
										上传二维码图片
									</Button>
								</Upload>
								<Button icon={<SnippetsOutlined />} loading={decoding} onClick={handleReadClipboard}>
									从剪切板读取
								</Button>
								<Button danger icon={<ClearOutlined />} onClick={handleClearDecode}>
									清空
								</Button>
							</Space>
							<div className="qr-upload-preview">
								{uploadedImageUrl ? (
									<img src={uploadedImageUrl} alt="上传的二维码" />
								) : (
									<Space direction="vertical" align="center">
										<SnippetsOutlined className="qr-preview-icon" />
										<Typography.Text type="secondary">图片预览，支持 Ctrl+V 粘贴</Typography.Text>
									</Space>
								)}
							</div>
						</Space>
					</Col>
					<Col xs={24} lg={14}>
						<Space direction="vertical" size={12} className="qr-code-panel">
							<Typography.Text strong>解析结果</Typography.Text>
							<Input.TextArea
								value={decodedText}
								onChange={event => setDecodedText(event.target.value)}
								placeholder="上传二维码图片后，这里会显示解析内容"
								rows={10}
								allowClear
							/>
							<Button icon={<CopyOutlined />} disabled={!decodedText} onClick={handleCopy}>
								复制内容
							</Button>
						</Space>
					</Col>
				</Row>
			)
		}
	];

	return (
		<div className="qr-code-page">
			<Card
				title="二维码工具"
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<Tabs defaultActiveKey="generate" items={tabItems} />
			</Card>
		</div>
	);
};

export default QrCode;
