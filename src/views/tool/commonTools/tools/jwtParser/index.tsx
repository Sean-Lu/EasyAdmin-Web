import React, { useMemo, useState } from "react";
import {
	ArrowLeftOutlined,
	ClearOutlined,
	CopyOutlined,
	FileProtectOutlined,
	ReloadOutlined,
	SafetyCertificateOutlined
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Input, Row, Space, Tag, Typography } from "antd";
import { useSelector } from "react-redux";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import clipboardUtil from "@/utils/clipboardUtil";
import { parseJwt } from "./jwtParser";
import "./index.less";

SyntaxHighlighter.registerLanguage("json", json);

interface JwtParserProps {
	onBack?: () => void;
}

const SAMPLE_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODkzNDU2MDAwfQ.demo-signature";

const claimLabels = {
	exp: "过期时间",
	iat: "签发时间",
	nbf: "生效时间"
} as const;

const JsonPanel: React.FC<{ title: string; content: string }> = ({ title, content }) => (
	<div className="jwt-json-panel">
		<div className="jwt-panel-header">
			<Typography.Title level={5}>{title}</Typography.Title>
			<Button type="text" icon={<CopyOutlined />} onClick={() => clipboardUtil.copyString(content)}>
				复制
			</Button>
		</div>
		<SyntaxHighlighter
			language="json"
			style={vscDarkPlus}
			customStyle={{ margin: 0, minHeight: 220, padding: 16, borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}
		>
			{content}
		</SyntaxHighlighter>
	</div>
);

// JWT 解析工具
const JwtParser: React.FC<JwtParserProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [token, setToken] = useState("");

	const parseState = useMemo(() => {
		if (!token.trim()) return { result: null, error: null };
		try {
			return { result: parseJwt(token), error: null };
		} catch (error) {
			return { result: null, error: error instanceof Error ? error.message : "JWT 解析失败" };
		}
	}, [token]);

	return (
		<div className={`jwt-parser-page${isDark ? " jwt-parser-dark" : ""}`}>
			<Card
				title={
					<Space>
						<FileProtectOutlined />
						JWT 解析工具
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
				<div className="jwt-input-section">
					<div className="jwt-section-header">
						<Space>
							<Typography.Text strong>JWT Token</Typography.Text>
							{parseState.result && <Tag color="success">解析成功</Tag>}
						</Space>
						<Space>
							<Button icon={<ReloadOutlined />} onClick={() => setToken(SAMPLE_TOKEN)}>
								填入示例
							</Button>
							<Button danger icon={<ClearOutlined />} disabled={!token} onClick={() => setToken("")}>
								清空
							</Button>
						</Space>
					</div>
					<Input.TextArea
						value={token}
						onChange={event => setToken(event.target.value)}
						placeholder="请输入完整的 JWT Token"
						autoSize={{ minRows: 5, maxRows: 10 }}
						status={parseState.error ? "error" : ""}
					/>
					{parseState.error && <Alert type="error" showIcon title={parseState.error} />}
				</div>

				{parseState.result ? (
					<>
						<Row gutter={[20, 20]}>
							<Col xs={24} lg={12}>
								<JsonPanel title="Header" content={parseState.result.headerJson} />
							</Col>
							<Col xs={24} lg={12}>
								<JsonPanel title="Payload" content={parseState.result.payloadJson} />
							</Col>
						</Row>

						{parseState.result.timeClaims.length > 0 && (
							<div className="jwt-time-claims">
								<Typography.Title level={5}>时间 Claims</Typography.Title>
								<Row gutter={[16, 16]}>
									{parseState.result.timeClaims.map(claim => (
										<Col xs={24} md={8} key={claim.name}>
											<div className="jwt-time-item">
												<Typography.Text code>{claim.name}</Typography.Text>
												<Typography.Text strong>{claimLabels[claim.name]}</Typography.Text>
												<Typography.Text>{claim.date.toLocaleString()}</Typography.Text>
											</div>
										</Col>
									))}
								</Row>
							</div>
						)}

						<div className="jwt-signature-section">
							<div className="jwt-panel-header">
								<Typography.Title level={5}>Signature</Typography.Title>
								<Button
									type="text"
									icon={<CopyOutlined />}
									onClick={() => clipboardUtil.copyString(parseState.result!.signature)}
								>
									复制
								</Button>
							</div>
							<div className="jwt-signature-value">{parseState.result.signature}</div>
							<Alert
								type="warning"
								showIcon
								message="签名未验证"
								description="本工具仅解析并展示 JWT 内容，不验证 Token 的真实性或完整性"
							/>
						</div>
					</>
				) : (
					!parseState.error && (
						<div className="jwt-empty-result">
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入 JWT Token 后将在此显示解析结果" />
						</div>
					)
				)}
			</Card>

			<section className="jwt-description-section">
				<Typography.Title level={3}>
					<SafetyCertificateOutlined /> JWT 说明
				</Typography.Title>
				<Row gutter={[20, 20]}>
					<Col xs={24} lg={8}>
						<Card title="什么是 JWT?" className="jwt-description-card">
							JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息作为 JSON 对象。
						</Card>
					</Col>
					<Col xs={24} lg={8}>
						<Card title="JWT 结构" className="jwt-description-card">
							<Typography.Paragraph>JWT 由三部分组成，用点（.）分隔：</Typography.Paragraph>
							<ul>
								<li>
									<Typography.Text code>Header</Typography.Text> - 包含令牌类型和签名算法
								</li>
								<li>
									<Typography.Text code>Payload</Typography.Text> - 包含声明（Claims）
								</li>
								<li>
									<Typography.Text code>Signature</Typography.Text> - 用于验证令牌完整性
								</li>
							</ul>
						</Card>
					</Col>
					<Col xs={24} lg={8}>
						<Card title="常见 Claims" className="jwt-description-card">
							<ul>
								<li>
									<Typography.Text code>iss</Typography.Text> - 签发者
								</li>
								<li>
									<Typography.Text code>sub</Typography.Text> - 主题
								</li>
								<li>
									<Typography.Text code>aud</Typography.Text> - 受众
								</li>
								<li>
									<Typography.Text code>exp</Typography.Text> - 过期时间
								</li>
								<li>
									<Typography.Text code>iat</Typography.Text> - 签发时间
								</li>
								<li>
									<Typography.Text code>nbf</Typography.Text> - 生效时间
								</li>
							</ul>
						</Card>
					</Col>
					<Col xs={24} lg={8}>
						<Card title="注意事项" className="jwt-description-card">
							本工具仅解析 JWT 的 Header 和 Payload 部分，不验证签名。Signature 部分需要密钥才能验证，本工具仅显示原始值。
						</Card>
					</Col>
				</Row>
			</section>
		</div>
	);
};

export default JwtParser;
