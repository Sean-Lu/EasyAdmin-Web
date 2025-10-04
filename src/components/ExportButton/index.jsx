import React, { useState } from "react";
import { Button, Dropdown, Menu, Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import axios from "../../api/index";

const ExportButton = ({ pageInfo, fetchData, apiUrl }) => {
	const [visible, setVisible] = useState(false);
	const [exportType, setExportType] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleExportClick = e => {
		setExportType(e.key);
		setVisible(true);
	};

	const handleExport = async exportAll => {
		setLoading(true);
		try {
			const response = await axios.download(
				apiUrl,
				{
					exportType,
					exportAll,
					pageNumber: pageInfo.pageNumber,
					pageSize: pageInfo.pageSize,
					...pageInfo.getSearchInfo()
				},
				{
					responseType: "blob" // 重要：接收二进制流
				}
			);

			// 根据响应头获取文件名
			const contentDisposition = response.headers["content-disposition"];
			let fileName = `export_${new Date().toISOString()}`;
			if (contentDisposition) {
				// 优先尝试获取RFC 5987编码的文件名(filename*)
				const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
				if (utf8FilenameMatch && utf8FilenameMatch[1]) {
					fileName = decodeURIComponent(utf8FilenameMatch[1]);
				} else {
					// 退回到普通filename
					const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
					if (filenameMatch && filenameMatch[1]) {
						fileName = filenameMatch[1].replace(/"/g, "");
					}
				}
			}

			// 创建下载链接
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.style.display = "none";
			link.href = url;

			link.setAttribute("download", fileName);
			document.body.appendChild(link);
			link.click();
			// link.remove();
			document.body.removeChild(link);

			// 释放URL对象
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Export failed:", error);
			Modal.error({
				title: "导出失败",
				content: error.response?.data?.message || error.message || "导出过程中发生错误"
			});
		} finally {
			setLoading(false);
			setVisible(false);
		}
	};

	const menuItems = [
		{
			key: "excel",
			label: "导出Excel",
			onClick: handleExportClick
		},
		{
			key: "markdown",
			label: "导出Markdown",
			onClick: handleExportClick
		}
	];

	return (
		<>
			<Dropdown menu={{ items: menuItems }} placement="bottomLeft">
				<Button type="primary" icon={<DownloadOutlined />}>
					导出
				</Button>
			</Dropdown>

			<Modal
				title="导出选项"
				open={visible}
				onCancel={() => setVisible(false)}
				footer={[
					<Button key="cancel" onClick={() => setVisible(false)}>
						取消
					</Button>,
					<Button key="current" type="primary" loading={loading} onClick={() => handleExport(false)}>
						仅导出当前页
					</Button>,
					<Button key="all" type="primary" loading={loading} onClick={() => handleExport(true)}>
						导出全部数据
					</Button>
				]}
			>
				<p>请选择导出范围：</p>
				<p>
					当前页：第 {pageInfo.pageNumber} 页，共 {pageInfo.total} 条数据
				</p>
			</Modal>
		</>
	);
};

export default ExportButton;
