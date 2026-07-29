import { Button, Drawer, Empty, FloatButton, Input, List, Space, Tag, Typography, message } from "antd";
import { RobotOutlined, SendOutlined, StopOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiService, AiConversation, AiMessageRole, BackendId } from "@/services/ai/aiService";
import { streamAiMessage } from "@/services/ai/aiStream";
import { DrawerPageContext } from "./drawerContext";
import "./index.less";

interface Props {
	hidden?: boolean;
	available?: boolean;
	pageContext: DrawerPageContext;
}

interface CompactMessage {
	key: string;
	role: "user" | "assistant";
	text: string;
}

const suggestions = ["总结我最近的待办", "查找我最近的工作报告", "帮我生成一份今日工作笔记草稿"];

/** 全局 AI 快捷入口 */
export default function AiAssistantDrawer({ hidden, available, pageContext }: Props) {
	const [open, setOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [generating, setGenerating] = useState(false);
	const [conversationId, setConversationId] = useState<BackendId>();
	const [conversations, setConversations] = useState<AiConversation[]>([]);
	const [items, setItems] = useState<CompactMessage[]>([]);
	const [detailCount, setDetailCount] = useState(0);
	const abortRef = useRef<AbortController>();
	const activeConversationRef = useRef<BackendId>();
	const loadRequestRef = useRef(0);
	const navigate = useNavigate();

	useEffect(() => {
		if (open) {
			void aiService.conversationPage({ pageNumber: 1, pageSize: 5 }, true).then(page => setConversations(page.list));
		}
	}, [open]);
	if (hidden || !available) return null;

	const selectConversation = async (id: BackendId) => {
		if (generating) return;
		setConversationId(id);
		const requestId = ++loadRequestRef.current;
		const page = await aiService.messagePage({ conversationId: id, pageNumber: 1, pageSize: 50 }, true);
		if (requestId !== loadRequestRef.current) return;
		setItems(
			page.list
				.filter(item => item.role !== AiMessageRole.Tool)
				.map(item => ({
					key: item.id,
					role: item.role === AiMessageRole.User ? "user" : "assistant",
					text: item.content
				}))
		);
		setDetailCount(page.list.reduce((count, item) => count + item.sources.length + (item.drafts?.length ?? 0), 0));
	};

	const openWorkbench = () => {
		navigate(conversationId ? `/ai/assistant?conversationId=${encodeURIComponent(conversationId)}` : "/ai/assistant");
	};

	const send = async (suggested?: string) => {
		const text = (suggested ?? prompt).trim();
		if (!text || generating) return;
		setPrompt("");
		setItems(current => [...current, { key: crypto.randomUUID(), role: "user", text }]);
		setGenerating(true);
		const id = conversationId ?? (await aiService.createConversation()).id;
		setConversationId(id);
		activeConversationRef.current = id;
		const controller = new AbortController();
		abortRef.current = controller;
		let assistantKey = "";
		try {
			await streamAiMessage(
				{ conversationId: id, prompt: text },
				{
					message_started: data => {
						assistantKey = data.messageId;
						setItems(current => [...current, { key: data.messageId, role: "assistant", text: "" }]);
					},
					text_delta: data =>
						setItems(current =>
							current.map(item => (item.key === assistantKey ? { ...item, text: item.text + data.text } : item))
						),
					sources: data => setDetailCount(count => count + (Array.isArray(data) ? data.length : data.sources.length)),
					draft: () => setDetailCount(count => count + 1)
				},
				controller.signal
			);
		} catch (error) {
			if ((error as Error).name !== "AbortError") message.error((error as Error).message);
		} finally {
			setGenerating(false);
			abortRef.current = undefined;
			activeConversationRef.current = undefined;
			void aiService.conversationPage({ pageNumber: 1, pageSize: 5 }, true).then(page => setConversations(page.list));
		}
	};

	return (
		<>
			<FloatButton className="ai-assistant-float" icon={<RobotOutlined />} tooltip="AI 助手" onClick={() => setOpen(true)} />
			<Drawer title="AI 助手" width={420} open={open} onClose={() => setOpen(false)}>
				<Typography.Text type="secondary">当前页面：{pageContext.routeTitle || pageContext.pathname}</Typography.Text>
				<Space wrap className="ai-drawer-suggestions">
					{suggestions.map(item => (
						<Tag key={item} onClick={() => void send(item)}>
							{item}
						</Tag>
					))}
				</Space>
				{conversations.length > 0 && (
					<List
						size="small"
						header="最近会话"
						dataSource={conversations}
						renderItem={item => (
							<List.Item className={item.id === conversationId ? "active" : ""} onClick={() => void selectConversation(item.id)}>
								{item.title}
							</List.Item>
						)}
					/>
				)}
				<div className="ai-drawer-messages">
					{items.length ? (
						items.map(item => (
							<div key={item.key} className={`ai-drawer-message ${item.role}`}>
								{item.text || "正在思考…"}
							</div>
						))
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="随时询问任何问题" />
					)}
				</div>
				{detailCount > 0 && (
					<Button type="link" onClick={openWorkbench}>
						在完整工作台查看 {detailCount} 个来源或草稿
					</Button>
				)}
				<Input.TextArea
					value={prompt}
					maxLength={4000}
					autoSize={{ minRows: 2, maxRows: 5 }}
					onChange={event => setPrompt(event.target.value)}
					onKeyDown={event => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							void send();
						}
					}}
				/>
				<Space className="ai-drawer-actions">
					<Button onClick={openWorkbench}>前往完整工作台</Button>
					{generating ? (
						<Button
							danger
							icon={<StopOutlined />}
							onClick={() => {
								abortRef.current?.abort();
								if (activeConversationRef.current) void aiService.cancel(activeConversationRef.current).catch(() => undefined);
							}}
						>
							停止
						</Button>
					) : (
						<Button type="primary" icon={<SendOutlined />} disabled={!prompt.trim()} onClick={() => void send()}>
							发送
						</Button>
					)}
				</Space>
			</Drawer>
		</>
	);
}
