import { DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Popconfirm, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	FavoriteAvailabilityStatus,
	FavoriteListItemDto,
	FavoriteService,
	FavoriteSourceType,
	FavoriteTargetType
} from "@/services/user/favoriteService";
import { buildFavoriteOpenTarget } from "./favoriteRoutes";
import { applyFavoriteSearch, initialFavoriteSearchState, resetFavoriteSearch } from "./favoriteSearchState";

const statusLabels: Record<FavoriteAvailabilityStatus, string> = {
	[FavoriteAvailabilityStatus.Normal]: "正常",
	[FavoriteAvailabilityStatus.ShareDisabled]: "分享已停用",
	[FavoriteAvailabilityStatus.ShareExpired]: "分享已过期",
	[FavoriteAvailabilityStatus.ShareTargetDeleted]: "原内容已删除"
};

const FavoriteList = () => {
	const navigate = useNavigate();
	const [form] = Form.useForm<{ keyword?: string; status?: FavoriteAvailabilityStatus }>();
	const [targetType, setTargetType] = useState(FavoriteTargetType.Menu);
	const [searchState, setSearchState] = useState(initialFavoriteSearchState);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<{ list: FavoriteListItemDto[]; total: number }>({ list: [], total: 0 });

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await FavoriteService.page({
				pageNumber,
				pageSize,
				targetType,
				keyword: searchState.keyword,
				status: searchState.status
			});
			setData({ list: result?.list || [], total: result?.total || 0 });
		} finally {
			setLoading(false);
		}
	}, [pageNumber, pageSize, searchState, targetType]);

	useEffect(() => {
		void load();
	}, [load]);

	const open = (item: FavoriteListItemDto) => {
		const target = buildFavoriteOpenTarget(item);
		if (!target) return;
		if (target.external) window.open(target.url, "_blank", "noopener,noreferrer");
		else navigate(target.url);
	};

	const remove = async (item: FavoriteListItemDto) => {
		await FavoriteService.remove(item.id);
		message.success("已取消收藏");
		if (data.list.length === 1 && pageNumber > 1) setPageNumber(current => current - 1);
		else void load();
	};

	const columns: TableProps<FavoriteListItemDto>["columns"] = [
		{
			title: "名称",
			dataIndex: "title",
			key: "title",
			ellipsis: true,
			render: (value: string, record) => (
				<Button type="link" disabled={!record.isAvailable} onClick={() => open(record)}>
					{value || "未命名内容"}
				</Button>
			)
		},
		{
			title: "来源",
			key: "sourceType",
			width: 110,
			render: (_, record) => (
				<Tag color={record.sourceType === FavoriteSourceType.Share ? "blue" : "default"}>
					{record.sourceType === FavoriteSourceType.Share ? "分享链接" : "直接收藏"}
				</Tag>
			)
		},
		{ title: "所有者", dataIndex: "ownerName", key: "ownerName", width: 140, render: value => value || "-" },
		{
			title: "状态",
			key: "status",
			width: 130,
			render: (_, record) => <Tag color={record.isAvailable ? "success" : "error"}>{statusLabels[record.status]}</Tag>
		},
		{
			title: "收藏时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 170,
			render: value => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-")
		},
		{
			title: "操作",
			key: "actions",
			width: 190,
			render: (_, record) => (
				<Space>
					<Button size="small" icon={<LinkOutlined />} disabled={!record.isAvailable} onClick={() => open(record)}>
						打开
					</Button>
					<Popconfirm title="确认取消收藏？" onConfirm={() => void remove(record)}>
						<Button size="small" danger icon={<DeleteOutlined />}>
							取消收藏
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<Card title="我的收藏">
			<Tabs
				activeKey={String(targetType)}
				items={[
					{ key: String(FavoriteTargetType.Menu), label: "菜单" },
					{ key: String(FavoriteTargetType.File), label: "文件" },
					{ key: String(FavoriteTargetType.Note), label: "笔记" }
				]}
				onChange={key => {
					setTargetType(Number(key) as FavoriteTargetType);
					setPageNumber(1);
				}}
			/>
			<Form
				form={form}
				layout="inline"
				style={{ marginBottom: 16 }}
				onFinish={values => {
					setSearchState(current => applyFavoriteSearch(current, values));
					setPageNumber(1);
				}}
			>
				<Form.Item name="keyword">
					<Input allowClear placeholder="搜索收藏名称" style={{ width: 260 }} />
				</Form.Item>
				<Form.Item name="status">
					<Select
						allowClear
						placeholder="全部状态"
						style={{ width: 140 }}
						options={[
							{ label: statusLabels[FavoriteAvailabilityStatus.Normal], value: FavoriteAvailabilityStatus.Normal },
							{
								label: statusLabels[FavoriteAvailabilityStatus.ShareDisabled],
								value: FavoriteAvailabilityStatus.ShareDisabled
							},
							{
								label: statusLabels[FavoriteAvailabilityStatus.ShareExpired],
								value: FavoriteAvailabilityStatus.ShareExpired
							},
							{
								label: statusLabels[FavoriteAvailabilityStatus.ShareTargetDeleted],
								value: FavoriteAvailabilityStatus.ShareTargetDeleted
							}
						]}
					/>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						搜索
					</Button>
				</Form.Item>
				<Form.Item>
					<Button
						onClick={() => {
							form.resetFields();
							setSearchState(current => resetFavoriteSearch(current));
							setPageNumber(1);
						}}
					>
						重置
					</Button>
				</Form.Item>
			</Form>
			<Table
				rowKey={record => String(record.id)}
				loading={loading}
				columns={columns}
				dataSource={data.list}
				pagination={{
					current: pageNumber,
					pageSize,
					total: data.total,
					showSizeChanger: true,
					showTotal: total => `共 ${total} 条`,
					onChange: (nextPage, nextSize) => {
						setPageNumber(nextPage);
						if (nextSize !== pageSize) setPageSize(nextSize);
					}
				}}
			/>
		</Card>
	);
};

export default FavoriteList;
