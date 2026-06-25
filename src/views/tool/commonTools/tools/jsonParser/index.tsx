import React, { useEffect, useMemo, useState } from "react";
import {
	ArrowLeftOutlined,
	ClearOutlined,
	CopyOutlined,
	DownloadOutlined,
	DownOutlined,
	FileTextOutlined,
	FormatPainterOutlined,
	ProfileOutlined,
	ReloadOutlined,
	TableOutlined,
	UpOutlined
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Input, Radio, Row, Segmented, Space, Tag, Typography, message } from "antd";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import { useSearchParams } from "react-router-dom";
import clipboardUtil from "@/utils/clipboardUtil";
import JsonTreeView, { collapseAll, expandAll, expandToDepth } from "./JsonTreeView";
import "./index.less";

SyntaxHighlighter.registerLanguage("json", json);

type OutputMode = "formatted" | "compressed" | "tree";

const sampleJson = `{
  "id": 1,
  "name": "EasyAdmin",
  "enabled": true,
  "config": {
    "theme": "dark",
    "features": ["dashboard", "tools", "settings"]
  },
  "users": [
    { "id": 101, "name": "Alice", "active": true },
    { "id": 102, "name": "Bob", "active": false }
  ],
  "metadata": null
}`;

const TRANSFER_KEY = "__jsonParser_transfer__";

interface JsonParserProps {
	onBack?: () => void;
}

const countNodes = (value: unknown): number => {
	if (value === null || typeof value !== "object") return 1;
	if (Array.isArray(value)) return 1 + value.reduce((sum, item) => sum + countNodes(item), 0);
	const entries = Object.entries(value as Record<string, unknown>);
	return 1 + entries.reduce((sum, [, item]) => sum + countNodes(item), 0);
};

const downloadText = (content: string, filename: string, type: string) => {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

// JSON 解析工具
const JsonParser: React.FC<JsonParserProps> = ({ onBack }) => {
	const [, setSearchParams] = useSearchParams();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [parsedValue, setParsedValue] = useState<unknown>(undefined);
	const [parseError, setParseError] = useState<string | null>(null);
	const [indent, setIndent] = useState<2 | 4>(2);
	const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!input.trim()) {
			setParsedValue(undefined);
			setParseError(null);
			setOutput("");
			return;
		}

		try {
			const value = JSON.parse(input);
			setParsedValue(value);
			setParseError(null);

			if (outputMode === "formatted") {
				setOutput(JSON.stringify(value, null, indent));
			} else if (outputMode === "compressed") {
				setOutput(JSON.stringify(value));
			} else {
				setOutput(JSON.stringify(value, null, indent));
			}
		} catch (error) {
			setParsedValue(undefined);
			setParseError((error as Error).message);
			setOutput("");
		}
	}, [input, indent, outputMode]);

	useEffect(() => {
		if (parsedValue !== undefined && outputMode === "tree") {
			setExpandedPaths(expandToDepth(parsedValue, 1));
		}
	}, [parsedValue, outputMode]);

	const stats = useMemo(() => {
		if (parsedValue === undefined) return null;
		return {
			bytes: new Blob([input]).size,
			nodes: countNodes(parsedValue)
		};
	}, [input, parsedValue]);

	const currentOutputForCopy = useMemo(() => {
		if (outputMode === "tree") {
			return parsedValue !== undefined ? JSON.stringify(parsedValue, null, indent) : "";
		}
		return output;
	}, [indent, output, outputMode, parsedValue]);

	const handleFormat = () => {
		if (parseError) {
			message.warning("请先修正 JSON 格式错误");
			return;
		}
		setOutputMode("formatted");
	};

	const handleCompress = () => {
		if (parseError) {
			message.warning("请先修正 JSON 格式错误");
			return;
		}
		setOutputMode("compressed");
	};

	const handleCopy = () => {
		if (!currentOutputForCopy) {
			message.warning("没有可复制的内容");
			return;
		}
		clipboardUtil.copyString(currentOutputForCopy);
	};

	const handleDownload = () => {
		const content = currentOutputForCopy;
		if (!content) {
			message.warning("没有可下载的内容");
			return;
		}
		downloadText(content, "parsed.json", "application/json;charset=utf-8");
		message.success("下载成功");
	};

	const handleClear = () => {
		setInput("");
		setOutput("");
		setParsedValue(undefined);
		setParseError(null);
		setExpandedPaths(new Set());
	};

	const handleLoadSample = () => {
		setInput(sampleJson);
	};

	const handleGoToJsonTable = () => {
		if (input.trim()) {
			sessionStorage.setItem(TRANSFER_KEY, input);
		}
		setSearchParams({ tool: "jsonToTable" });
	};

	const handleToggle = (path: string) => {
		setExpandedPaths(prev => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const handleExpandAll = () => {
		if (parsedValue === undefined) return;
		setExpandedPaths(expandAll(parsedValue));
	};

	const handleCollapseAll = () => {
		setExpandedPaths(collapseAll());
	};

	const handleExpandToDepth = (depth: number) => {
		if (parsedValue === undefined) return;
		setExpandedPaths(expandToDepth(parsedValue, depth));
	};

	const outputTitle = useMemo(() => {
		switch (outputMode) {
			case "formatted":
				return "格式化结果";
			case "compressed":
				return "压缩结果";
			case "tree":
				return "树形视图";
			default:
				return "输出";
		}
	}, [outputMode]);

	return (
		<div className="json-parser-page">
			<Card
				title={
					<div className="json-parser-title">
						<FileTextOutlined />
						<span>JSON 解析工具</span>
						{stats && (
							<Space size={4}>
								<Tag color="blue">{stats.bytes} bytes</Tag>
								<Tag color="green">{stats.nodes} 节点</Tag>
							</Space>
						)}
					</div>
				}
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<Row gutter={[16, 16]} className="json-parser-body">
					<Col xs={24} lg={12} className="json-parser-input-area">
						<div className="area-header">
							<Typography.Text strong>输入</Typography.Text>
							{parseError === null && input.trim() !== "" && (
								<Tag color="success" className="valid-tag">
									有效 JSON
								</Tag>
							)}
						</div>
						<Input.TextArea
							value={input}
							onChange={event => setInput(event.target.value)}
							placeholder="请输入 JSON"
							rows={20}
							allowClear
							className="json-parser-textarea"
							status={parseError ? "error" : ""}
						/>
						{parseError && <Alert className="json-error-alert" message={parseError} type="error" showIcon />}
					</Col>

					<Col xs={24} lg={12} className="json-parser-output-area">
						<div className="area-header">
							<Typography.Text strong>{outputTitle}</Typography.Text>
							<Segmented
								value={outputMode}
								onChange={value => setOutputMode(value as OutputMode)}
								options={[
									{ label: "格式化", value: "formatted", icon: <FormatPainterOutlined /> },
									{ label: "压缩", value: "compressed", icon: <ProfileOutlined /> },
									{ label: "树形", value: "tree", icon: <DownOutlined /> }
								]}
							/>
						</div>
						<div className="json-output-wrapper">
							{outputMode === "tree" ? (
								parsedValue !== undefined ? (
									<JsonTreeView data={parsedValue} expandedPaths={expandedPaths} onToggle={handleToggle} />
								) : (
									<div className="json-output-empty">
										<Typography.Text type="secondary">请输入有效 JSON 以查看树形结构</Typography.Text>
									</div>
								)
							) : output ? (
								<SyntaxHighlighter
									language="json"
									style={vscDarkPlus}
									customStyle={{
										margin: 0,
										padding: 12,
										borderRadius: 6,
										minHeight: "100%",
										fontSize: 13,
										lineHeight: 1.6
									}}
								>
									{output}
								</SyntaxHighlighter>
							) : (
								<div className="json-output-empty">
									<Typography.Text type="secondary">输出结果将显示在这里</Typography.Text>
								</div>
							)}
						</div>
					</Col>
				</Row>

				<div className="json-actions">
					<Space wrap align="center">
						<Button type="primary" icon={<FormatPainterOutlined />} onClick={handleFormat}>
							格式化
						</Button>
						<Button icon={<ProfileOutlined />} onClick={handleCompress}>
							压缩
						</Button>
						<Button icon={<CopyOutlined />} onClick={handleCopy}>
							复制
						</Button>
						<Button icon={<DownloadOutlined />} onClick={handleDownload}>
							下载
						</Button>
						<Button icon={<TableOutlined />} onClick={handleGoToJsonTable}>
							转表格
						</Button>
						<Button icon={<ReloadOutlined />} onClick={handleLoadSample}>
							填入示例
						</Button>
						<Button danger icon={<ClearOutlined />} onClick={handleClear}>
							清空
						</Button>

						{outputMode === "tree" && (
							<>
								<Button icon={<UpOutlined />} onClick={handleExpandAll}>
									全部展开
								</Button>
								<Button icon={<DownOutlined />} onClick={handleCollapseAll}>
									全部折叠
								</Button>
								<Radio.Group
									value={undefined}
									buttonStyle="solid"
									onChange={event => handleExpandToDepth(Number(event.target.value))}
								>
									<Radio.Button value={1}>展开 1 层</Radio.Button>
									<Radio.Button value={2}>展开 2 层</Radio.Button>
									<Radio.Button value={3}>展开 3 层</Radio.Button>
								</Radio.Group>
							</>
						)}

						{outputMode !== "tree" && (
							<Radio.Group value={indent} buttonStyle="solid" onChange={event => setIndent(event.target.value)}>
								<Radio.Button value={2}>2 空格缩进</Radio.Button>
								<Radio.Button value={4}>4 空格缩进</Radio.Button>
							</Radio.Group>
						)}
					</Space>
				</div>
			</Card>
		</div>
	);
};

export default JsonParser;
