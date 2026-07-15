import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Popconfirm, Row, Space, Table, message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import request from "@/api";
import type { BackendId, PageRes } from "@/api/interface";
import { api } from "@/actions/system/api";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { store } from "@/redux";
import {
	buildOnlineUserQuery,
	getOnlineUserDisplayName,
	resetOnlineUserQuery,
	shouldLogoutAfterKick,
	type OnlineUserQuery
} from "./onlineUsersUtils";

/** 在线用户 */
interface OnlineUser {
	userId: BackendId;
	userName: string;
	nickName?: string;
	ipAddress?: string;
	loginTime?: string;
	userAgent?: string;
	sessionCount: number;
}

/** 解码当前登录用户 ID，用于强踢自己时清理本地登录状态 */
const getCurrentUserId = (): BackendId => {
	const token = store.getState().global.token?.replace(/^Bearer\s+/i, "");
	const payload = token?.split(".")[1];
	if (!payload) return "";
	try {
		const decoded = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
		return String(decoded.UserId ?? decoded.userId ?? "");
	} catch {
		return "";
	}
};

// 在线用户列表
const OnlineUsers = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [data, setData] = useState<OnlineUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [keyword, setKeyword] = useState("");
	const [ipAddress, setIpAddress] = useState("");
	const [appliedQuery, setAppliedQuery] = useState<OnlineUserQuery>(resetOnlineUserQuery);
	const [page, setPage] = useState({ current: 1, pageSize: 10, total: 0 });

	const loadUsers = useCallback(
		async (current = page.current, pageSize = page.pageSize, query = appliedQuery) => {
			setLoading(true);
			try {
				const response = await request.get<PageRes<OnlineUser>>(api.onlineUser.page, {
					pageNumber: current,
					pageSize,
					userName: query.userName,
					ipAddress: query.ipAddress
				});
				if (response.success) {
					setData(response.data?.list || []);
					setPage({
						current: response.data?.pageNumber || current,
						pageSize: response.data?.pageSize || pageSize,
						total: response.data?.total || 0
					});
				}
			} catch {
				message.error("获取在线用户失败");
			} finally {
				setLoading(false);
			}
		},
		[appliedQuery, page.current, page.pageSize]
	);

	useEffect(() => {
		void loadUsers();
		// 页面首次进入时加载一次；输入框变化不会触发请求
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/** 强制注销指定用户的全部在线会话 */
	const kickUser = async (user: OnlineUser) => {
		try {
			const response = await request.post(api.onlineUser.kick, { id: user.userId });
			if (!response.success) return;
			message.success("用户已强制下线");
			if (shouldLogoutAfterKick(user.userId, getCurrentUserId())) {
				dispatch(setToken(""));
				dispatch(setTabsList([]));
				localStorage.removeItem("refreshToken");
				navigate("/login", { replace: true });
				return;
			}
			void loadUsers();
		} catch {
			message.error("强制下线失败");
		}
	};

	/** 在线用户表格列 */
	const columns = useMemo(
		() => [
			{ title: "用户", key: "user", render: (_: unknown, record: OnlineUser) => getOnlineUserDisplayName(record) },
			{ title: "IP", dataIndex: "ipAddress", key: "ipAddress", render: (value: string) => value || "-" },
			{
				title: "登录时间",
				dataIndex: "loginTime",
				key: "loginTime",
				render: (value: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-")
			},
			{ title: "设备信息", dataIndex: "userAgent", key: "userAgent", ellipsis: true, render: (value: string) => value || "-" },
			{ title: "会话数", dataIndex: "sessionCount", key: "sessionCount", width: 100, align: "center" as const },
			{
				title: "操作",
				key: "operation",
				width: 130,
				render: (_: unknown, record: OnlineUser) => (
					<Popconfirm title="确定强制该用户下线吗？" okText="确定" cancelText="取消" onConfirm={() => void kickUser(record)}>
						<Button type="link" danger>
							强踢下线
						</Button>
					</Popconfirm>
				)
			}
		],
		[dispatch, kickUser, loadUsers, navigate]
	);

	const submitQuery = () => {
		const query = buildOnlineUserQuery(keyword, ipAddress);
		setAppliedQuery(query);
		setPage(page => ({ ...page, current: 1 }));
		void loadUsers(1, page.pageSize, query);
	};

	const resetQuery = () => {
		const query = resetOnlineUserQuery();
		setKeyword("");
		setIpAddress("");
		setAppliedQuery(query);
		setPage(page => ({ ...page, current: 1 }));
		void loadUsers(1, page.pageSize, query);
	};

	return (
		<Card title="在线用户">
			<Row gutter={[12, 12]} justify="start" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={10} md={7} lg={5}>
					<Input
						placeholder="用户名/昵称"
						value={keyword}
						onChange={event => setKeyword(event.target.value)}
						onPressEnter={() => {
							submitQuery();
						}}
					/>
				</Col>
				<Col xs={24} sm={10} md={7} lg={5}>
					<Input
						placeholder="IP"
						value={ipAddress}
						onChange={event => setIpAddress(event.target.value)}
						onPressEnter={() => {
							submitQuery();
						}}
					/>
				</Col>
				<Col>
					<Space>
						<Button type="primary" icon={<SearchOutlined />} onClick={submitQuery}>
							查询
						</Button>
						<Button icon={<ReloadOutlined />} onClick={resetQuery}>
							重置
						</Button>
					</Space>
				</Col>
			</Row>
			<Table
				rowKey="userId"
				loading={loading}
				columns={columns}
				dataSource={data}
				pagination={{
					...page,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: total => `共 ${total} 条`
				}}
				onChange={pagination => void loadUsers(pagination.current || 1, pagination.pageSize || 10)}
			/>
		</Card>
	);
};

export default OnlineUsers;
