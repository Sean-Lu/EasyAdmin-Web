import React, { useState, useEffect } from "react";
import { Card, Button, Space, Tabs, message } from "antd";
import { CopyOutlined, DownloadOutlined, FileOutlined, CodeOutlined } from "@ant-design/icons";
import copy from "copy-to-clipboard";
import { CodeGenResultDto, downloadPackage, downloadFile } from "@/services/tool/codeGenService";

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
					<span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>({result.files.length} 个文件)</span>
				</div>
			}
			bordered
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
					style={{
						width: 180,
						backgroundColor: "#fafafa",
						borderRight: "1px solid #e8e8e8",
						overflowY: "auto",
						paddingTop: 8
					}}
				>
					{result.files.map((file, index) => (
						<div
							key={index}
							onClick={() => setActiveFileIndex(index)}
							style={{
								padding: "8px 12px",
								cursor: "pointer",
								fontSize: 13,
								color: activeFileIndex === index ? "#1890ff" : "#666",
								backgroundColor: activeFileIndex === index ? "#e6f7ff" : "transparent",
								borderLeft: activeFileIndex === index ? "3px solid #1890ff" : "3px solid transparent",
								transition: "background-color 0.2s"
							}}
							onMouseEnter={e => {
								if (activeFileIndex !== index) {
									e.currentTarget.style.backgroundColor = "#f5f5f5";
								}
							}}
							onMouseLeave={e => {
								if (activeFileIndex !== index) {
									e.currentTarget.style.backgroundColor = "transparent";
								}
							}}
						>
							<FileOutlined
								style={{
									marginRight: 6,
									fontSize: 12
								}}
							/>
							{file.fileName}
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
					<pre
						style={{
							margin: 0,
							padding: "16px 20px",
							color: "#d4d4d4",
							fontFamily: "'JetBrains Mono', 'Consolas', 'Monaco', 'Menlo', monospace",
							fontSize: 13,
							lineHeight: 1.7,
							whiteSpace: "pre-wrap",
							wordBreak: "break-all"
						}}
					>
						{result.files[activeFileIndex]?.content || ""}
					</pre>
				</div>
			</div>
		</Card>
	);
};

export default GenResultPanel;
