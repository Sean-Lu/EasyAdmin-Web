import { Button, Drawer, Grid, Layout, Result, Spin, message } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { aiService, AiConversation, AiDraft, AiMessageRole, AiMessageStatus, BackendId } from "@/services/ai/aiService";
import { streamAiMessage } from "@/services/ai/aiStream";
import ChatComposer from "./ChatComposer";
import ConversationList from "./ConversationList";
import DraftPanel from "./DraftPanel";
import MessageList from "./MessageList";
import { initialWorkbenchState, workbenchReducer } from "./workbenchState";
import "./index.less";

/** AI 助手工作台 */
export default function AiWorkbench() {
	const navigate = useNavigate();
	const { refreshAiAvailability } = useOutletContext<{ refreshAiAvailability: () => Promise<boolean> }>();
	const [searchParams] = useSearchParams();
	const requestedConversationId = searchParams.get("conversationId") || undefined;
	const [conversations, setConversations] = useState<AiConversation[]>([]);
	const [conversationPage, setConversationPage] = useState(1);
	const [conversationTotal, setConversationTotal] = useState(0);
	const [selectedId, setSelectedId] = useState<BackendId>();
	const [messagePage, setMessagePage] = useState(1);
	const [messageTotal, setMessageTotal] = useState(0);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [loading, setLoading] = useState(true);
	const [prompt, setPrompt] = useState("");
	const [generating, setGenerating] = useState(false);
	const [railOpen, setRailOpen] = useState(false);
	const [draftOpen, setDraftOpen] = useState(false);
	const [selectedDraft, setSelectedDraft] = useState<AiDraft>();
	const [available, setAvailable] = useState<boolean>();
	const [state, dispatch] = useReducer(workbenchReducer, initialWorkbenchState);
	const abortRef = useRef<AbortController>();
	const activeConversationRef = useRef<BackendId>();
	const selectedIdRef = useRef<BackendId>();
	const messageRequestRef = useRef(0);
	const skipMessageLoadRef = useRef<BackendId>();
	const screens = Grid.useBreakpoint();

	useEffect(() => {
		let active = true;
		void refreshAiAvailability().then(value => active && setAvailable(value));
		return () => {
			active = false;
		};
	}, [refreshAiAvailability]);

	const loadConversations = useCallback(
		async (pageNumber = 1, append = false) => {
			if (!append) setLoading(true);
			try {
				const page = await aiService.conversationPage({ pageNumber, pageSize: 50 }, true);
				setConversations(items =>
					append ? [...items, ...page.list.filter(next => !items.some(item => item.id === next.id))] : page.list
				);
				setConversationPage(pageNumber);
				setConversationTotal(page.total);
				setSelectedId(current => {
					const next = current ?? requestedConversationId ?? page.list[0]?.id;
					selectedIdRef.current = next;
					return next;
				});
			} finally {
				if (!append) setLoading(false);
			}
		},
		[requestedConversationId]
	);

	const loadMessages = useCallback(async (conversationId: BackendId) => {
		const requestId = ++messageRequestRef.current;
		const page = await aiService.messagePage({ conversationId, pageNumber: 1, pageSize: 100 }, true);
		if (requestId !== messageRequestRef.current || selectedIdRef.current !== conversationId) return;
		dispatch({ type: "load", messages: page.list });
		setMessagePage(1);
		setMessageTotal(page.total);
	}, []);

	useEffect(() => {
		if (available) void loadConversations();
		else if (available === false) setLoading(false);
	}, [available, loadConversations]);
	useEffect(() => {
		if (!available) {
			messageRequestRef.current++;
			return;
		}
		if (selectedId) {
			if (skipMessageLoadRef.current === selectedId) {
				skipMessageLoadRef.current = undefined;
				return;
			}
			void loadMessages(selectedId);
		} else {
			messageRequestRef.current++;
			dispatch({ type: "load", messages: [] });
			setMessageTotal(0);
		}
	}, [available, loadMessages, selectedId]);

	const createConversation = async (skipMessageLoad = false) => {
		const created = await aiService.createConversation();
		setConversations(items => [created, ...items]);
		setConversationTotal(total => total + 1);
		selectedIdRef.current = created.id;
		if (skipMessageLoad) skipMessageLoadRef.current = created.id;
		setSelectedId(created.id);
		setRailOpen(false);
		return created.id;
	};

	const send = async (value = prompt) => {
		const text = value.trim();
		if (!text || generating) return;
		setPrompt("");
		setGenerating(true);
		let conversationId: BackendId | undefined;
		try {
			conversationId = selectedId ?? (await createConversation(true));
			messageRequestRef.current++;
			dispatch({
				type: "userMessageQueued",
				messageId: `local-${crypto.randomUUID()}`,
				conversationId: String(conversationId),
				content: text
			});
			activeConversationRef.current = String(conversationId);
			const controller = new AbortController();
			abortRef.current = controller;
			await streamAiMessage(
				{ conversationId, prompt: text },
				{
					message_started: data =>
						dispatch({ type: "messageStarted", messageId: data.messageId, conversationId: String(conversationId) }),
					text_delta: data => dispatch({ type: "textDelta", text: data.text }),
					sources: data => dispatch({ type: "sourcesReceived", sources: Array.isArray(data) ? data : data.sources }),
					draft: data => dispatch({ type: "draftReceived", draft: data.draft }),
					message_completed: () => dispatch({ type: "completed" }),
					error: data => dispatch({ type: "failed", message: data.message })
				},
				controller.signal
			);
			await Promise.all([loadMessages(String(conversationId)), loadConversations()]);
		} catch (error) {
			if ((error as Error).name === "AbortError") dispatch({ type: "cancelled" });
			else {
				if (!conversationId) setPrompt(text);
				dispatch({ type: "failed", message: (error as Error).message });
				message.error((error as Error).message);
			}
		} finally {
			setGenerating(false);
			abortRef.current = undefined;
			activeConversationRef.current = undefined;
		}
	};

	const loadOlderMessages = async () => {
		if (!selectedId || loadingOlder || state.messages.length >= messageTotal) return;
		setLoadingOlder(true);
		const conversationId = selectedId;
		const nextPage = messagePage + 1;
		const requestId = ++messageRequestRef.current;
		try {
			const page = await aiService.messagePage({ conversationId, pageNumber: nextPage, pageSize: 100 }, true);
			if (requestId !== messageRequestRef.current || selectedIdRef.current !== conversationId) return;
			dispatch({ type: "prepend", messages: page.list });
			setMessagePage(nextPage);
			setMessageTotal(page.total);
		} finally {
			if (requestId === messageRequestRef.current) setLoadingOlder(false);
		}
	};

	if (available === undefined) {
		return (
			<div className="ai-workbench-state">
				<Spin size="large" />
			</div>
		);
	}

	if (!available) {
		return (
			<div className="ai-workbench-state">
				<Result status="info" title="当前租户的 AI 功能暂不可用" subTitle="请联系管理员启用 AI 功能并完成模型配置" />
			</div>
		);
	}

	const conversationList = (
		<ConversationList
			items={conversations}
			selectedId={selectedId}
			loading={loading}
			disabled={generating}
			hasMore={conversations.length < conversationTotal}
			onLoadMore={() => void loadConversations(conversationPage + 1, true)}
			onCreate={() => void createConversation()}
			onSelect={id => {
				selectedIdRef.current = id;
				setSelectedId(id);
				setRailOpen(false);
			}}
			onRename={(id, title) =>
				void aiService
					.renameConversation(id, title)
					.then(updated => setConversations(items => items.map(item => (item.id === id ? updated : item))))
			}
			onDelete={id =>
				void aiService.deleteConversation(id).then(async () => {
					const remaining = conversations.filter(item => item.id !== id);
					setConversations(remaining);
					if (id === selectedId) {
						const nextId = remaining[0]?.id ?? (await createConversation());
						selectedIdRef.current = nextId;
						setSelectedId(nextId);
					}
				})
			}
		/>
	);

	return (
		<Layout className="ai-workbench">
			{screens.md ? (
				<Layout.Sider width={280} className="ai-conversation-rail">
					{conversationList}
				</Layout.Sider>
			) : null}
			<Layout.Content className="ai-chat">
				{!screens.md && (
					<Button icon={<MenuOutlined />} onClick={() => setRailOpen(true)}>
						会话
					</Button>
				)}
				<MessageList
					messages={state.messages}
					hasOlder={state.messages.length < messageTotal}
					loadingOlder={loadingOlder}
					onLoadOlder={() => void loadOlderMessages()}
					onRetry={value => void send(value)}
					onSuggestion={setPrompt}
					onOpenSource={source => {
						void aiService
							.resolveSource(source.sourceType, source.sourceId)
							.then(result => navigate(result.route))
							.catch(() => message.warning("来源已删除或无权访问"));
					}}
					onOpenDraft={(draftIndex, messageIndex) => {
						setSelectedDraft(state.messages[messageIndex].drafts?.[draftIndex]);
						setDraftOpen(true);
					}}
				/>
				<ChatComposer
					value={prompt}
					generating={generating}
					onChange={setPrompt}
					onSend={() => void send()}
					onStop={() => {
						abortRef.current?.abort();
						if (activeConversationRef.current) void aiService.cancel(activeConversationRef.current).catch(() => undefined);
					}}
				/>
			</Layout.Content>
			<Drawer title="会话" placement="left" open={railOpen} onClose={() => setRailOpen(false)}>
				{conversationList}
			</Drawer>
			<Drawer title="草稿" width={screens.md ? 520 : "92%"} open={draftOpen} onClose={() => setDraftOpen(false)}>
				<DraftPanel
					draft={selectedDraft}
					onChanged={draft => {
						setSelectedDraft(draft);
						if (!draft) setDraftOpen(false);
						if (selectedId) void loadMessages(selectedId);
					}}
				/>
			</Drawer>
		</Layout>
	);
}
