import React, { useState } from "react";
import { ArrowLeftOutlined, ClearOutlined, CopyOutlined, LockOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Input, Row, Segmented, Space, Typography, message } from "antd";
import { useSelector } from "react-redux";
import axios from "@/api/index";
import clipboardUtil from "@/utils/clipboardUtil";
import "./index.less";

type AlgorithmType = "MD5" | "Base64" | "AES" | "DES" | "3DES" | "RC2" | "RC4" | "RSA";

interface CryptoProps {
	onBack?: () => void;
}

const algorithmOptions: { label: string; value: AlgorithmType }[] = [
	// 哈希算法：MD5、SHA1、SHA256、SHA384、SHA512
	{ label: "MD5", value: "MD5" },
	// BASE64 编码/解码
	{ label: "Base64", value: "Base64" },
	// 对称加密算法：AES、DES、3DES、RC2、RC4
	{ label: "AES", value: "AES" },
	{ label: "DES", value: "DES" },
	{ label: "3DES", value: "3DES" },
	{ label: "RC2", value: "RC2" },
	{ label: "RC4", value: "RC4" },
	// 非对称加密算法：RSA
	{ label: "RSA", value: "RSA" }
];

const apiMap: Record<AlgorithmType, { encrypt: string; decrypt?: string }> = {
	MD5: { encrypt: "/encrypt/md5Encrypt" },
	Base64: { encrypt: "/encrypt/base64Encrypt", decrypt: "/encrypt/base64Decrypt" },
	AES: { encrypt: "/encrypt/aesEncrypt", decrypt: "/encrypt/aesDecrypt" },
	DES: { encrypt: "/encrypt/desEncrypt", decrypt: "/encrypt/desDecrypt" },
	"3DES": { encrypt: "/encrypt/tripleDesEncrypt", decrypt: "/encrypt/tripleDesDecrypt" },
	RC2: { encrypt: "/encrypt/rc2Encrypt", decrypt: "/encrypt/rc2Decrypt" },
	RC4: { encrypt: "/encrypt/rc4Encrypt", decrypt: "/encrypt/rc4Decrypt" },
	RSA: { encrypt: "/encrypt/rsaEncrypt", decrypt: "/encrypt/rsaDecrypt" }
};

const needsKey = (algo: AlgorithmType): boolean => algo !== "MD5" && algo !== "Base64";
const supportsDecrypt = (algo: AlgorithmType): boolean => algo !== "MD5";

// 加解密工具
const Crypto: React.FC<CryptoProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [inputText, setInputText] = useState("");
	const [key, setKey] = useState("");
	const [result, setResult] = useState("");
	const [algorithm, setAlgorithm] = useState<AlgorithmType>("MD5");
	const [upperCase, setUpperCase] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleEncrypt = async () => {
		if (!inputText) {
			message.warning("请输入文本");
			return;
		}
		if (needsKey(algorithm) && !key) {
			message.warning("请输入密钥");
			return;
		}

		setResult("");
		setLoading(true);

		try {
			const body =
				algorithm === "MD5"
					? { data: inputText, upper: upperCase }
					: needsKey(algorithm)
					? { data: inputText, key }
					: { data: inputText };

			const res = await axios.post<any>(apiMap[algorithm].encrypt, body);
			if (res.success) {
				setResult(algorithm === "MD5" ? res.data.md5 : res.data.encrypt);
			}
		} catch {
			// 错误由全局拦截器处理
		} finally {
			setLoading(false);
		}
	};

	const handleDecrypt = async () => {
		if (!inputText) {
			message.warning("请输入文本");
			return;
		}
		if (needsKey(algorithm) && !key) {
			message.warning("请输入密钥");
			return;
		}

		setResult("");
		setLoading(true);

		try {
			const body = needsKey(algorithm) ? { data: inputText, key } : { data: inputText };
			const res = await axios.post<any>(apiMap[algorithm].decrypt!, body);
			if (res.success) {
				setResult(res.data.decrypt);
			}
		} catch {
			// 错误由全局拦截器处理
		} finally {
			setLoading(false);
		}
	};

	const handleSwap = () => {
		if (!result) {
			message.info("暂无结果可交换");
			return;
		}
		setInputText(result);
		setResult(inputText);
	};

	const handleClearAll = () => {
		setInputText("");
		setKey("");
		setResult("");
	};

	const handleCopy = () => {
		if (!result) {
			message.info("暂无结果可复制");
			return;
		}
		clipboardUtil.copyString(result);
	};

	return (
		<div className={`crypto-page${isDark ? " crypto-dark" : ""}`}>
			<Card
				title={
					<Space>
						<LockOutlined />
						加解密工具
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
					<Col span={24}>
						<Segmented
							value={algorithm}
							onChange={value => {
								setAlgorithm(value as AlgorithmType);
								setResult("");
							}}
							options={algorithmOptions}
						/>
					</Col>

					<Col span={24}>
						<Input.TextArea
							value={inputText}
							onChange={e => setInputText(e.target.value)}
							placeholder="请输入需要加密或解密的文本"
							rows={6}
							allowClear
						/>
					</Col>

					{needsKey(algorithm) && (
						<Col span={24}>
							<Input.TextArea value={key} onChange={e => setKey(e.target.value)} placeholder="请输入密钥" rows={3} allowClear />
						</Col>
					)}

					<Col span={24}>
						<Space wrap>
							<Button type="primary" loading={loading} onClick={handleEncrypt}>
								加密
							</Button>
							{supportsDecrypt(algorithm) && (
								<Button type="primary" ghost loading={loading} onClick={handleDecrypt}>
									解密
								</Button>
							)}
							{algorithm === "MD5" && (
								<Checkbox checked={upperCase} onChange={e => setUpperCase(e.target.checked)}>
									大写
								</Checkbox>
							)}
							<Button icon={<SwapOutlined />} onClick={handleSwap} disabled={!result}>
								交换
							</Button>
							<Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!result}>
								复制结果
							</Button>
							<Button danger icon={<ClearOutlined />} onClick={handleClearAll}>
								清空
							</Button>
						</Space>
					</Col>

					<Col span={24}>
						<div className="crypto-result">
							<div className="crypto-result-header">
								<Typography.Text type="secondary">输出结果</Typography.Text>
								<Button type="text" size="small" icon={<CopyOutlined />} disabled={!result} onClick={handleCopy} />
							</div>
							<Input.TextArea value={result} placeholder="输出结果" rows={6} readOnly />
						</div>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default Crypto;
