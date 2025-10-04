import React, { useState } from "react";
import { Input, Radio, Button, Checkbox, Card, message } from "antd";
// import cryptoUtil from "../../../utils/cryptoUtil";
import clipboardUtil from "../../../utils/clipboardUtil";
import axios from "../../../api/index";

const api = {
	// 哈希：MD5、SHA1、SHA256、SHA384、SHA512
	md5Encrypt: "/encrypt/md5Encrypt",

	// Base64编码\解码
	base64Encrypt: "/encrypt/base64Encrypt",
	base64Decrypt: "/encrypt/base64Decrypt",

	// 对称加密算法：AES、DES、3DES、RC2、RC4
	aesEncrypt: "/encrypt/aesEncrypt",
	aesDecrypt: "/encrypt/aesDecrypt",
	desEncrypt: "/encrypt/desEncrypt",
	desDecrypt: "/encrypt/desDecrypt",
	tripleDesEncrypt: "/encrypt/tripleDesEncrypt", // 3DES
	tripleDesDecrypt: "/encrypt/tripleDesDecrypt", // 3DES
	rc2Encrypt: "/encrypt/rc2Encrypt",
	rc2Decrypt: "/encrypt/rc2Decrypt",
	rc4Encrypt: "/encrypt/rc4Encrypt",
	rc4Decrypt: "/encrypt/rc4Decrypt",

	// 非对称加密算法：RSA
	rsaEncrypt: "/encrypt/rsaEncrypt",
	rsaDecrypt: "/encrypt/rsaDecrypt"
};

const EncryptionComponent = () => {
	const [inputText, setInputText] = useState("");
	const [key, setKey] = useState("");
	const [result, setResult] = useState("");
	const [encryptionType, setEncryptionType] = useState("MD5");
	const [upperCase, setUpperCase] = useState(false);
	const [copy, setCopy] = useState(false);

	const handleEncrypt = () => {
		switch (encryptionType) {
			case "MD5": {
				// const result = upperCase ? cryptoUtil.md5Encrypt(inputText).toUpperCase() : cryptoUtil.md5Encrypt(inputText);
				// setResult(result);
				// if (copy) {
				// 	clipboardUtil.copyToClipboard(result);
				// }
				handleMd5Encrypt();
				break;
			}
			case "Base64": {
				handleCommonEncrypt(api.base64Encrypt, false);
				break;
			}
			case "AES": {
				handleCommonEncrypt(api.aesEncrypt);
				break;
			}
			case "DES": {
				// const result = cryptoUtil.encryptDES(inputText, key);
				// setResult(result);
				// if (copy) {
				// 	clipboardUtil.copyToClipboard(result);
				// }
				handleCommonEncrypt(api.desEncrypt);
				break;
			}
			case "3DES": {
				handleCommonEncrypt(api.tripleDesEncrypt);
				break;
			}
			case "RC2": {
				handleCommonEncrypt(api.rc2Encrypt);
				break;
			}
			case "RC4": {
				handleCommonEncrypt(api.rc4Encrypt);
				break;
			}
			case "RSA": {
				handleCommonEncrypt(api.rsaEncrypt);
				break;
			}
			default:
				message.info(`[${encryptionType}]不支持加密`);
				break;
		}
	};

	const handleDecrypt = () => {
		switch (encryptionType) {
			case "Base64": {
				handleCommonDecrypt(api.base64Decrypt, false);
				break;
			}
			case "AES": {
				handleCommonDecrypt(api.aesDecrypt);
				break;
			}
			case "DES": {
				// const result = cryptoUtil.decryptDES(inputText, key);
				// setResult(result);
				// if (copy) {
				// 	clipboardUtil.copyToClipboard(result);
				// }
				handleCommonDecrypt(api.desDecrypt);
				break;
			}
			case "3DES": {
				handleCommonDecrypt(api.tripleDesDecrypt);
				break;
			}
			case "RC2": {
				handleCommonDecrypt(api.rc2Decrypt);
				break;
			}
			case "RC4": {
				handleCommonDecrypt(api.rc4Decrypt);
				break;
			}
			case "RSA": {
				handleCommonDecrypt(api.rsaDecrypt);
				break;
			}
			default:
				message.info(`[${encryptionType}]不支持解密`);
				break;
		}
	};

	const handleClear = () => {
		// setInputText("");
		// setKey("");
		setResult("");
	};

	const handleMd5Encrypt = () => {
		if (inputText === "") {
			message.info("请输入文本");
			return;
		}

		setResult(""); // 清空结果

		axios
			.post(api.md5Encrypt, {
				data: inputText,
				upper: upperCase
			})
			.then(res => {
				if (res.success) {
					const result = res.data.md5;
					setResult(result);
					if (copy) {
						clipboardUtil.copyString(result);
					}
				}
			})
			.catch(err => {});
	};

	const handleCommonEncrypt = (apiEncrypt, needKey = true) => {
		if (inputText === "") {
			message.info("请输入文本");
			return;
		}
		if (needKey && key === "") {
			message.info("请输入密钥");
			return;
		}

		setResult(""); // 清空结果

		axios
			.post(
				apiEncrypt,
				needKey
					? {
							data: inputText,
							key: key
					  }
					: {
							data: inputText
					  }
			)
			.then(res => {
				if (res.success) {
					const result = res.data.encrypt;
					setResult(result);
					if (copy) {
						clipboardUtil.copyString(result);
					}
				}
			})
			.catch(err => {});
	};

	const handleCommonDecrypt = (apiDecrypt, needKey = true) => {
		if (inputText === "") {
			message.info("请输入文本");
			return;
		}
		if (needKey && key === "") {
			message.info("请输入密钥");
			return;
		}

		setResult(""); // 清空结果

		axios
			.post(
				apiDecrypt,
				needKey
					? {
							data: inputText,
							key: key
					  }
					: {
							data: inputText
					  }
			)
			.then(res => {
				if (res.success) {
					const result = res.data.decrypt;
					setResult(result);
					if (copy) {
						clipboardUtil.copyString(result);
					}
				}
			})
			.catch(err => {});
	};

	return (
		<>
			<Card>
				<div>
					<div>
						<Radio.Group
							value={encryptionType}
							onChange={e => {
								setEncryptionType(e.target.value);
								setResult("");
							}}
						>
							<Radio value="MD5">MD5</Radio>
							<Radio value="Base64">Base64</Radio>
							<Radio value="AES">AES</Radio>
							<Radio value="DES">DES</Radio>
							<Radio value="3DES">3DES</Radio>
							<Radio value="RC2">RC2</Radio>
							<Radio value="RC4">RC4</Radio>
							<Radio value="RSA">RSA</Radio>
						</Radio.Group>
					</div>
					<div>
						<Checkbox checked={copy} onChange={e => setCopy(e.target.checked)}>
							复制
						</Checkbox>
						{encryptionType === "MD5" && (
							<Checkbox checked={upperCase} onChange={e => setUpperCase(e.target.checked)}>
								大写
							</Checkbox>
						)}
					</div>
				</div>
				<div style={{ paddingTop: 10 }}>
					<Input.TextArea
						value={inputText}
						onChange={e => setInputText(e.target.value)}
						placeholder="输入文本"
						rows={4}
						allowClear
					/>
					{encryptionType !== "MD5" && encryptionType !== "Base64" && (
						<div style={{ paddingTop: 10 }}>
							<Input.TextArea
								value={key}
								onChange={e => setKey(e.target.value)}
								placeholder="输入密钥"
								rows={4}
								allowClear
								// style={{ display: encryptionType === "MD5" ? "none" : "block" }}
							/>
						</div>
					)}
				</div>
				<div style={{ paddingTop: 10 }}>
					<Button type="primary" onClick={handleEncrypt}>
						加密
					</Button>
					{encryptionType !== "MD5" && (
						<Button type="primary" onClick={handleDecrypt} style={{ marginLeft: 8 }}>
							解密
						</Button>
					)}
					<Button type="primary" danger onClick={handleClear} style={{ marginLeft: 8 }}>
						清空结果
					</Button>
				</div>
				<div style={{ paddingTop: 10 }}>
					<Input.TextArea value={result} placeholder="输出结果" rows={4} readOnly />
				</div>
			</Card>
		</>
	);
};

export default EncryptionComponent;
