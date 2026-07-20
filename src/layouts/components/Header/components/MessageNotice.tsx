import { useEffect, useState } from "react";
import { Badge, Button, Empty, List, Popover, Space, Typography, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import axios from "@/api/index";
import { api } from "@/actions/system/api";
import { toSafeIdParam } from "@/utils/id";
import { showMessageDetailModal } from "@/components/MessageDetailModal";

interface UserMessage {
	id: string;
	title?: string;
	noticeType: number;
	sendTime?: string;
}

const MessageNotice = () => {
	const navigate = useNavigate();
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [unreadCount, setUnreadCount] = useState(0);
	const [recentUnread, setRecentUnread] = useState<UserMessage[]>([]);
	const [open, setOpen] = useState(false);

	const fetchMessages = async () => {
		try {
			const [countRes, listRes] = await Promise.all([
				axios.get<number>(api.userMessage.unreadCount),
				axios.get<UserMessage[]>(api.userMessage.recentUnread, { count: 5 })
			]);
			if (countRes.success) {
				setUnreadCount(countRes.data || 0);
			}
			if (listRes.success) {
				setRecentUnread(listRes.data || []);
			}
		} catch (error) {
			console.log("加载消息提醒失败", error);
		}
	};

	useEffect(() => {
		fetchMessages();
		window.addEventListener("easyadmin-message-refresh", fetchMessages);
		return () => window.removeEventListener("easyadmin-message-refresh", fetchMessages);
	}, []);

	const openMessageList = () => {
		setOpen(false);
		navigate("/user/message");
	};

	const showMessageDetail = async (id?: string | number | null) => {
		const safeId = toSafeIdParam(id);
		if (!safeId) return;
		setOpen(false);
		try {
			const res = await axios.get<any>(api.userMessage.detail, { id: safeId });
			if (!res.success) {
				message.error(res.msg || "获取消息详情失败");
				return;
			}
			const record = res.data;
			showMessageDetailModal(record, fetchMessages, { isDark });
			await fetchMessages();
			window.dispatchEvent(new Event("easyadmin-message-refresh"));
		} catch (error) {
			console.log("查看消息详情失败", error);
			message.error("获取消息详情失败");
		}
	};

	const content = (
		<div className={`message-popover${isDark ? " message-popover-dark" : ""}`}>
			{recentUnread.length > 0 ? (
				<List
					size="small"
					dataSource={recentUnread}
					renderItem={item => (
						<List.Item className="message-popover-item" onClick={() => showMessageDetail(item.id)}>
							<Space orientation="vertical" size={2}>
								<Typography.Text strong ellipsis style={{ maxWidth: 260 }}>
									{item.title}
								</Typography.Text>
								<Typography.Text type="secondary" style={{ fontSize: 12 }}>
									{item.sendTime ? dayjs(item.sendTime).format("YYYY-MM-DD HH:mm:ss") : ""}
								</Typography.Text>
							</Space>
						</List.Item>
					)}
				/>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无未读消息" />
			)}
			<Button type="link" block onClick={openMessageList}>
				查看全部
			</Button>
		</div>
	);

	return (
		<Popover
			content={content}
			title="消息"
			trigger="click"
			open={open}
			onOpenChange={setOpen}
			placement="bottomRight"
			rootClassName={isDark ? "message-popover-root-dark" : undefined}
		>
			<span className="message-notice-entry">
				<Badge count={unreadCount} size="small" overflowCount={99} offset={[2, 2]}>
					<BellOutlined className="message-notice-icon" />
				</Badge>
			</span>
		</Popover>
	);
};

export default MessageNotice;
