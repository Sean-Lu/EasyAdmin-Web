import React, { useState, useEffect } from "react";
import { Card, Button, Space, Tooltip, message } from "antd";
import { CopyOutlined, DownloadOutlined, FileOutlined, CodeOutlined } from "@ant-design/icons";
import copy from "copy-to-clipboard";
import { CodeGenResultDto, downloadPackage, downloadFile } from "@/services/tool/codeGenService";
import CodeBlock from "@/components/CodeBlock";
import { detectCodeLanguage } from "@/components/CodeBlock/languages";

interface GenResultPanelProps {
	result: CodeGenResultDto;
}

/**
 * 代码生成结果面板
 * 展示生成的代码文件，支持复制代码、下载单个文件和打包下载全部
 */
const GenResultPanel: React.FC<GenResultPanelProps> = ({ result }) => {
	const [activeFileIndex, setActiveFileIndex] = useState(0);
	const [downloadingAll, setDownloadingAll] = useState(false);
	const [downloadingCurrent, setDownloadingCurrent] = useState(false);

	useEffect(() => {
		setActiveFileIndex(0);
	}, [result]);

	/** 复制当前预览的代码到剪贴板 */
	const handleCopyCode = () => {
		if (result.files[activeFileIndex]) {
			copy(result.files[activeFileIndex].content);
			message.success("代码已复制到剪贴板");
		}
	};

	/** 下载当前预览的单个文件 */
	const handleDownloadCurrent = async () => {
		const file = result.files[activeFileIndex];
		if (!file) return;
		setDownloadingCurrent(true);
		try {
			await downloadFile(result.taskId, file.fileName);
			message.success("下载成功");
		} catch (error) {
			message.error("下载失败");
		} finally {
			setDownloadingCurrent(false);
		}
	};

	/** 打包下载全部文件 */
	const handleDownloadAll = async () => {
		setDownloadingAll(true);
		try {
			await downloadPackage(result.taskId);
			message.success("下载成功");
		} catch (error) {
			message.error("下载失败");
		} finally {
			setDownloadingAll(false);
		}
	};

	if (!result.files || result.files.length === 0) {
		return null;
	}

	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<CodeOutlined style={{ fontSize: 18 }} />
					<span>生成结果</span>
					<span className="code-gen-tertiary-text" style={{ fontSize: 12, marginLeft: 8 }}>
						({result.files.length} 个文件)
					</span>
				</div>
			}
			variant="outlined"
			style={{ marginTop: 16, borderRadius: 8 }}
			extra={
				<Space size="middle">
					<Button icon={<CopyOutlined />} onClick={handleCopyCode} size="middle">
						复制代码
					</Button>
					<Button icon={<FileOutlined />} loading={downloadingCurrent} onClick={handleDownloadCurrent} size="middle">
						下载当前
					</Button>
					<Button type="primary" icon={<DownloadOutlined />} loading={downloadingAll} onClick={handleDownloadAll} size="middle">
						打包下载
					</Button>
				</Space>
			}
		>
			<div style={{ display: "flex", height: 500, gap: 0 }}>
				<div
					className="code-gen-file-list"
					style={{
						width: 220,
						backgroundColor: "var(--ant-color-fill-quaternary)",
						borderRight: "1px solid var(--ant-color-border)",
						overflowY: "auto",
						paddingTop: 8
					}}
				>
					{result.files.map((file, index) => (
						<div
							key={index}
							onClick={() => setActiveFileIndex(index)}
							style={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								padding: "8px 12px",
								cursor: "pointer",
								fontSize: 13,
								color: activeFileIndex === index ? "var(--ant-color-primary)" : "var(--ant-color-text-secondary)",
								backgroundColor: activeFileIndex === index ? "var(--ant-color-primary-bg)" : "transparent",
								borderLeft: activeFileIndex === index ? "3px solid var(--ant-color-primary)" : "3px solid transparent",
								transition: "background-color 0.2s"
							}}
							onMouseEnter={e => {
								if (activeFileIndex !== index) {
									e.currentTarget.style.backgroundColor = "var(--ant-color-fill-tertiary)";
								}
							}}
							onMouseLeave={e => {
								if (activeFileIndex !== index) {
									e.currentTarget.style.backgroundColor = "transparent";
								}
							}}
						>
							<FileOutlined className="code-gen-file-icon" />
							<Tooltip title={file.fileName} placement="right">
								<span className="code-gen-file-name">{file.fileName}</span>
							</Tooltip>
						</div>
					))}
				</div>
				<div
					style={{
						flex: 1,
						backgroundColor: "#1e1e1e",
						overflow: "auto"
					}}
				>
					<CodeBlock
						code={result.files[activeFileIndex]?.content || ""}
						language={detectCodeLanguage(result.files[activeFileIndex]?.fileName || "")}
						className="code-gen-result-block"
					/>
				</div>
			</div>
		</Card>
	);
};

export default GenResultPanel;
