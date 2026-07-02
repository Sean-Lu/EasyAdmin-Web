import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined, CopyOutlined, LockOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Checkbox, Col, Input, InputNumber, Row, Slider, Space, Typography, message } from "antd";
import { useSelector } from "react-redux";
import clipboardUtil from "@/utils/clipboardUtil";
import { CHARACTER_SETS, CharacterType, generatePassword, PasswordOptions, validatePasswordOptions } from "./passwordGenerator";
import "./index.less";

interface RandomPasswordProps {
	onBack?: () => void;
}

const optionLabels: Record<CharacterType, string> = {
	uppercase: "大写字母 (A-Z)",
	lowercase: "小写字母 (a-z)",
	digits: "数字 (0-9)",
	symbols: "特殊符号"
};

const defaultOptions: PasswordOptions = {
	length: 16,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: true
};

// 随机密码生成器
const RandomPassword: React.FC<RandomPasswordProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [options, setOptions] = useState(defaultOptions);
	const [password, setPassword] = useState("");
	const validationMessage = useMemo(() => validatePasswordOptions(options), [options]);
	const selectedTypes = useMemo(() => CHARACTER_SETS.filter(([type]) => options[type]).map(([type]) => type), [options]);

	const regenerate = useCallback(() => {
		if (validationMessage) {
			setPassword("");
			return;
		}

		try {
			setPassword(generatePassword(options));
		} catch (error) {
			setPassword("");
			message.error(error instanceof Error ? error.message : "密码生成失败");
		}
	}, [options, validationMessage]);

	useEffect(() => {
		regenerate();
	}, [regenerate]);

	const setLength = (length: number | null) => {
		if (length === null) return;
		setOptions(current => ({ ...current, length }));
	};

	const setCharacterTypes = (types: CharacterType[]) => {
		const selected = new Set(types);
		setOptions(current => ({
			...current,
			uppercase: selected.has("uppercase"),
			lowercase: selected.has("lowercase"),
			digits: selected.has("digits"),
			symbols: selected.has("symbols")
		}));
	};

	return (
		<div className={`random-password-page${isDark ? " random-password-dark" : ""}`}>
			<Card
				title={
					<Space>
						<LockOutlined />
						随机密码生成
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
				<div className="password-result">
					<Typography.Text type="secondary">生成结果</Typography.Text>
					<Input
						readOnly
						size="large"
						value={password}
						placeholder={validationMessage || "正在生成密码"}
						suffix={
							<Button type="text" icon={<CopyOutlined />} disabled={!password} onClick={() => clipboardUtil.copyString(password)}>
								复制
							</Button>
						}
					/>
				</div>

				<Row gutter={[24, 24]}>
					<Col xs={24} md={12}>
						<div className="password-setting">
							<div className="setting-title">
								<Typography.Text strong>密码长度</Typography.Text>
								<InputNumber min={4} max={128} precision={0} value={options.length} onChange={setLength} />
							</div>
							<Slider min={4} max={128} value={options.length} onChange={setLength} />
						</div>
					</Col>
					<Col xs={24} md={12}>
						<div className="password-setting">
							<Typography.Text strong>字符选项</Typography.Text>
							<Checkbox.Group value={selectedTypes} onChange={values => setCharacterTypes(values as CharacterType[])}>
								<Row gutter={[12, 12]}>
									{CHARACTER_SETS.map(([type]) => (
										<Col xs={24} sm={12} key={type}>
											<Checkbox value={type}>{optionLabels[type]}</Checkbox>
										</Col>
									))}
								</Row>
							</Checkbox.Group>
						</div>
					</Col>
				</Row>

				{validationMessage && <Alert type="error" showIcon message={validationMessage} />}

				<Button type="primary" size="large" icon={<ReloadOutlined />} disabled={Boolean(validationMessage)} onClick={regenerate}>
					重新生成
				</Button>
			</Card>
		</div>
	);
};

export default RandomPassword;
