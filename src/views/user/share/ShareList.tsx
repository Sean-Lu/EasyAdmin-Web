import { CopyOutlined, EditOutlined, FileOutlined, LinkOutlined, ReloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Button, Card, Input, Popconfirm, Select, Space, Switch, Table, Tag, message } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackendIdInput } from "@/api/interface";
import ShareDialog from "@/components/ShareDialog";
import { ShareListItemDto, ShareListStatus, ShareService, ShareTargetType } from "@/services/share/shareService";
import clipboardUtil from "@/utils/clipboardUtil";
import { buildShareLink, buildShareTargetRoute, canOpenTarget, getShareStatusColor, getShareStatusLabel } from "./shareListLogic";

export { buildShareLink, buildShareTargetRoute, canOpenTarget, getShareStatusColor, getShareStatusLabel } from "./shareListLogic";

// 我的分享列表页
const ShareList = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<{ list: ShareListItemDto[]; total: number }>({ list: [], total: 0 });
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [keyword, setKeyword] = useState("");
	const [targetType, setTargetType] = useState<ShareTargetType>();
	const [status, setStatus] = useState<ShareListStatus>();
	const [editing, setEditing] = useState<ShareListItemDto>();

	const load = async (nextPageNumber = pageNumber, nextPageSize = pageSize, nextKeyword = keyword) => {
		setLoading(true);
		try {
			const result = await ShareService.list({
				pageNumber: nextPageNumber,
				pageSize: nextPageSize,
				keyword: nextKeyword || undefined,
				targetType,
				status
			});
			setData({ list: result?.list || [], total: result?.total || 0 });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, [pageNumber, pageSize, keyword, targetType, status]);

	const copyLink = (item: ShareListItemDto) => {
		clipboardUtil.copyString(buildShareLink(item.shareCode), "分享链接已复制");
	};
	const toggle = async (item: ShareListItemDto) => {
		await ShareService.toggle(item.targetType, item.targetId, !item.isEnabled);
		message.success(item.isEnabled ? "分享已停用" : "分享已启用");
		void load();
	};
	const regenerate = async (item: ShareListItemDto) => {
		await ShareService.regenerate(item.targetType, item.targetId);
		message.success("链接已重新生成");
		void load();
	};
	const openTarget = (item: ShareListItemDto) => {
		if (!canOpenTarget(item)) return;
		navigate(buildShareTargetRoute(item));
	};

	const columns: TableProps<ShareListItemDto>["columns"] = [
		{
			title: "分享内容",
			dataIndex: "targetName",
			key: "targetName",
			ellipsis: true,
			render: (value: string, record) => (
				<Space>
					{record.targetType === ShareTargetType.Note ? <FileOutlined /> : <ShareAltOutlined />}
					<span>{value || "未命名内容"}</span>
					<Tag>{record.targetType === ShareTargetType.Note ? "笔记" : "文件"}</Tag>
				</Space>
			)
		},
		{
			title: "状态",
			key: "status",
			render: (_, record) => <Tag color={getShareStatusColor(record.status)}>{getShareStatusLabel(record.status)}</Tag>
		},
		{
			title: "启用状态",
			key: "enabled",
			render: (_, record) => <Switch checked={record.isEnabled} onChange={() => void toggle(record)} />
		},
		{
			title: "访问保护",
			key: "password",
			render: (_, record) => (record.hasPassword ? "密码保护" : "无密码")
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
			render: (value?: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-")
		},
		{
			title: "过期时间",
			dataIndex: "expiresAt",
			key: "expiresAt",
			render: (value?: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "永久")
		},
		{
			title: "操作",
			key: "actions",
			width: 360,
			render: (_, record) => (
				<Space wrap>
					{record.targetAvailable && (
						<Button size="small" icon={<EditOutlined />} onClick={() => setEditing(record)}>
							配置
						</Button>
					)}
					<Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(record)}>
						复制链接
					</Button>
					{record.targetAvailable && (
						<Popconfirm title="旧链接会立即失效，是否继续？" onConfirm={() => void regenerate(record)}>
							<Button size="small" icon={<ReloadOutlined />}>
								重置链接
							</Button>
						</Popconfirm>
					)}
					{record.targetAvailable && (
						<Button size="small" icon={<LinkOutlined />} onClick={() => openTarget(record)}>
							打开内容
						</Button>
					)}
				</Space>
			)
		}
	];

	return (
		<Card>
			<Space wrap style={{ marginBottom: 16 }}>
				<Input.Search
					allowClear
					placeholder="搜索分享内容"
					style={{ width: 280 }}
					onSearch={value => {
						const nextKeyword = value.trim();
						setPageNumber(1);
						setKeyword(nextKeyword);
						if (pageNumber === 1 && keyword === nextKeyword) void load(1, pageSize, nextKeyword);
					}}
				/>
				<Select
					allowClear
					placeholder="全部类型"
					style={{ width: 130 }}
					options={[
						{ label: "文件", value: ShareTargetType.File },
						{ label: "笔记", value: ShareTargetType.Note }
					]}
					onChange={value => {
						setPageNumber(1);
						setTargetType(value);
					}}
				/>
				<Select
					allowClear
					placeholder="全部状态"
					style={{ width: 130 }}
					options={Object.values(ShareListStatus)
						.filter(value => typeof value === "number")
						.map(value => ({ label: getShareStatusLabel(value as ShareListStatus), value }))}
					onChange={value => {
						setPageNumber(1);
						setStatus(value);
					}}
				/>
			</Space>
			<Table
				rowKey={record => String(record.id)}
				loading={loading}
				columns={columns}
				dataSource={data.list}
				pagination={{
					current: pageNumber,
					pageSize,
					total: data.total,
					showTotal: total => `共 ${total} 条`,
					showSizeChanger: true,
					onChange: (nextPage, nextSize) => {
						setPageNumber(nextPage);
						if (nextSize !== pageSize) setPageSize(nextSize);
					}
				}}
			/>
			{editing && (
				<ShareDialog
					open
					targetType={editing.targetType}
					targetId={editing.targetId as BackendIdInput}
					onClose={() => {
						setEditing(undefined);
						void load();
					}}
				/>
			)}
		</Card>
	);
};

export default ShareList;
