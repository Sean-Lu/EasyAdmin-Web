import React from "react";
import { Button, Divider, Form, Input, Modal, Select, Switch, Tag, Tooltip, Tree, message, Descriptions } from "antd";
import { CloudDownloadOutlined, DownloadOutlined } from "@ant-design/icons";
import http from "../../../api";
import { PORT1 } from "../../../api/config/servicePort";
import { api } from "../../../actions/system/api";

/**
 * 更新管理 - 版本详情弹窗
 * 功能：
 * 1. 展示版本基本信息（版本号、平台、更新日志等）
 * 2. 文件目录树：以Tree组件可视化展示更新包内的完整目录结构
 * 3. 单文件下载：每个文件旁有下载按钮，可下载单个文件校验内容
 * 4. 完整下载：可下载整个更新包zip文件
 */
export default class VersionDetail extends React.Component {
	state = {
		treeData: []
	};

	/**
	 * 弹窗打开时构建文件目录树：
	 * 直接从 props.record 获取文件列表（由 StandardTable 统一请求）
	 */
	componentDidUpdate(prevProps) {
		if (this.props.modalVisible && !prevProps.modalVisible && this.props.record) {
			const files = this.props.record.files || [];

			// 将扁平文件路径构建为树结构（按 / 分割层级）
			const pathMap = {};
			const roots = [];

			for (const file of files) {
				const parts = file.filePath.split("/");
				let currentLevel = roots;
				let currentPath = "";

				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					currentPath = currentPath ? `${currentPath}/${part}` : part;
					const isLeaf = i === parts.length - 1;

					if (!pathMap[currentPath]) {
						const node = {
							title: part,
							key: currentPath,
							isLeaf,
							children: isLeaf ? [] : [],
							// 叶子节点：保存文件元数据用于下载
							fileInfo: isLeaf
								? {
										path: file.filePath,
										size: file.fileSize,
										checksum: file.checksum
								  }
								: null
						};

						pathMap[currentPath] = node;
						if (i === 0) {
							roots.push(node);
						} else {
							const parentPath = parts.slice(0, i).join("/");
							if (pathMap[parentPath]) {
								pathMap[parentPath].children.push(node);
							}
						}
					}

					if (pathMap[currentPath]) {
						currentLevel = pathMap[currentPath].children;
					}
				}
			}

			// 清理空的children数组（仅对叶子节点清理）
			const cleanEmptyChildren = nodes => {
				for (const node of nodes) {
					if (node.isLeaf && node.children && node.children.length === 0) {
						delete node.children;
					} else if (node.children) {
						cleanEmptyChildren(node.children);
					}
				}
			};
			cleanEmptyChildren(roots);

			// 排序：文件夹优先（!isLeaf），然后按名称排序
			const sortNodes = nodes => {
				nodes.sort((a, b) => {
					// 文件夹优先
					if (a.isLeaf !== b.isLeaf) {
						return a.isLeaf ? 1 : -1;
					}
					// 名称按字母顺序排序（不区分大小写）
					return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
				});
				// 递归排序子节点
				for (const node of nodes) {
					if (node.children && node.children.length > 0) {
						sortNodes(node.children);
					}
				}
			};
			sortNodes(roots);

			this.setState({ treeData: roots });
		}
	}

	/**
	 * 下载单个更新文件：
	 * 调用 /api/update/downloadFile 接口，自动打开浏览器下载
	 */
	handleDownloadFile = async fileInfo => {
		const record = this.props.record;
		if (!record) return;

		try {
			const response = await http.downloadGet(PORT1 + api.update.downloadFile, {
				versionCode: record.versionCode,
				filePath: fileInfo.path,
				appCode: record.appCode,
				platform: record.platform
			});

			this.downloadBlob(response.data, fileInfo.path.split("/").pop());
			message.success(`开始下载: ${fileInfo.path}`);
		} catch (error) {
			console.error("下载文件失败", error);
			message.error("下载文件失败");
		}
	};

	/**
	 * 下载完整更新包zip：
	 * 调用 /api/update/downloadZip 接口
	 */
	handleDownloadZip = async () => {
		const record = this.props.record;
		if (!record) return;

		try {
			const response = await http.downloadGet(PORT1 + api.update.downloadZip, {
				versionId: record.id
			});

			const fileName = `${record.appCode}_${record.versionName}_${record.platform}.zip`;
			this.downloadBlob(response.data, fileName);
			message.success("开始下载更新包");
		} catch (error) {
			console.error("下载更新包失败", error);
			message.error("下载更新包失败");
		}
	};

	/**
	 * 通过blob方式下载文件
	 */
	downloadBlob = (blob, fileName) => {
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	/**
	 * 格式化文件大小为可读字符串
	 */
	formatSize = bytes => {
		if (!bytes) return "0 B";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	render() {
		const { modalVisible, onCancel, record } = this.props;
		const { treeData } = this.state;

		return (
			<Modal
				destroyOnClose
				title="版本详情"
				open={modalVisible}
				onCancel={onCancel}
				width={800}
				footer={[
					<Button key="cancel" onClick={onCancel}>
						关闭
					</Button>
				]}
			>
				{record && (
					<>
						{/* 基本信息区域 */}
						<Descriptions column={2} bordered size="small">
							<Descriptions.Item label="应用标识">{record.appCode}</Descriptions.Item>
							<Descriptions.Item label="版本号">{record.versionName}</Descriptions.Item>
							<Descriptions.Item label="内部版本码">{record.versionCode}</Descriptions.Item>
							<Descriptions.Item label="平台">{record.platform}</Descriptions.Item>
							<Descriptions.Item label="文件数">{record.fileCount ?? "-"}</Descriptions.Item>
							<Descriptions.Item label="更新包大小">{this.formatSize(record.totalSize)}</Descriptions.Item>
							<Descriptions.Item label="强制更新">
								{record.isForceUpdate ? <Tag color="red">是</Tag> : <Tag color="default">否</Tag>}
							</Descriptions.Item>
							<Descriptions.Item label="发布状态">
								{record.state === 1 ? <Tag color="green">已发布</Tag> : <Tag color="default">未发布</Tag>}
							</Descriptions.Item>
							{record.changelog && (
								<Descriptions.Item label="更新日志" span={2}>
									{record.changelog}
								</Descriptions.Item>
							)}
						</Descriptions>

						<Divider orientation="left">
							文件目录结构
							<Button
								type="primary"
								icon={<CloudDownloadOutlined />}
								size="small"
								style={{ marginLeft: 12 }}
								onClick={this.handleDownloadZip}
							>
								下载完整更新包
							</Button>
						</Divider>

						{/* 文件目录树：展示更新包内的完整目录结构 */}
						<div style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 8, maxHeight: 400, overflow: "auto" }}>
							<Tree
								showIcon
								treeData={treeData}
								// defaultExpandAll //默认展开所有节点
								blockNode
								/**
								 * 自定义叶子节点渲染：
								 * 左侧显示文件名，右侧显示文件元数据和下载按钮
								 * 下载后可在本地打开解压，校验文件校验和是否与服务端一致
								 */
								titleRender={nodeData => {
									if (nodeData.isLeaf && nodeData.fileInfo) {
										const info = nodeData.fileInfo;
										return (
											<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
												<span style={{ fontSize: 13, maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis" }}>
													{nodeData.title}
												</span>
												<span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
													<Tag color="blue" style={{ fontSize: 11 }}>
														SHA256: {(info.checksum || "").substring(0, 16)}...
													</Tag>
													<span style={{ fontSize: 11, color: "#888" }}>{this.formatSize(info.size)}</span>
													<Tooltip title="下载此文件以校验内容">
														<Button
															type="link"
															size="small"
															icon={<DownloadOutlined />}
															onClick={() => this.handleDownloadFile(info)}
														/>
													</Tooltip>
												</span>
											</div>
										);
									}
									return <span style={{ fontWeight: 500 }}>{nodeData.title}</span>;
								}}
							/>
						</div>
					</>
				)}
			</Modal>
		);
	}
}
