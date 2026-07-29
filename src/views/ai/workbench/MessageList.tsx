import { Button, Empty, Space, Spin, Tag, Typography } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/CodeBlock";
import { AiMessageRole, AiMessageStatus, AiSource } from "@/services/ai/aiTypes";
import { WorkbenchMessage } from "./workbenchState";

const suggestedPrompts = ["总结我最近的待办", "帮我整理本周工作", "查找最近的笔记"];

interface Props {
	messages: WorkbenchMessage[];
	onRetry: (content: string) => void;
	onOpenDraft: (draftIndex: number, messageIndex: number) => void;
	onSuggestion: (prompt: string) => void;
	onOpenSource?: (source: AiSource) => void;
	hasOlder?: boolean;
	loadingOlder?: boolean;
	onLoadOlder?: () => void;
}

/** AI 消息列表 */
export default function MessageList({
	messages,
	onRetry,
	onOpenDraft,
	onSuggestion,
	onOpenSource,
	hasOlder,
	loadingOlder,
	onLoadOlder
}: Props) {
	if (!messages.length) {
		return (
			<div className="ai-welcome">
				<Empty description="开始一段对话，AI 只会读取您有权访问的数据" />
				<Space wrap>
					{suggestedPrompts.map(prompt => (
						<Button key={prompt} onClick={() => onSuggestion(prompt)}>
							{prompt}
						</Button>
					))}
				</Space>
			</div>
		);
	}
	return (
		<div className="ai-message-list">
			{hasOlder && (
				<Button loading={loadingOlder} onClick={onLoadOlder}>
					加载更早消息
				</Button>
			)}
			{messages.map((item, index) => (
				<div key={item.id} className={`ai-message ${item.role === AiMessageRole.User ? "user" : "assistant"}`}>
					<div className="ai-message-content">
						{item.role === AiMessageRole.Assistant ? (
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									code({ inline, className, children }) {
										const language = /language-(\w+)/.exec(className || "")?.[1] as any;
										return inline ? (
											<code>{children}</code>
										) : (
											<CodeBlock code={String(children).replace(/\n$/, "")} language={language || "text"} />
										);
									}
								}}
							>
								{item.content}
							</ReactMarkdown>
						) : (
							<Typography.Text>{item.content}</Typography.Text>
						)}
						{item.streaming && <Spin size="small" className="ai-streaming" />}
						{!!item.sources?.length && (
							<Space wrap>
								{item.sources.map((source, sourceIndex) => (
									<Tag
										key={`${source.sourceId}-${sourceIndex}`}
										color="blue"
										className="ai-source"
										onClick={() => onOpenSource?.(source)}
									>
										来源 {source.number ?? sourceIndex + 1} · {source.title || "系统数据"}
									</Tag>
								))}
							</Space>
						)}
						{!!item.drafts?.length && (
							<Space wrap>
								{item.drafts.map((draft, draftIndex) => (
									<Button key={draft.id} type="link" onClick={() => onOpenDraft(draftIndex, index)}>
										查看草稿 {draftIndex + 1}
									</Button>
								))}
							</Space>
						)}
					</div>
					<Space size="small" className="ai-message-actions">
						<Button
							type="text"
							size="small"
							icon={<CopyOutlined />}
							onClick={() => navigator.clipboard.writeText(item.content)}
						/>
						{item.status === AiMessageStatus.Failed && (
							<Button
								type="text"
								size="small"
								icon={<ReloadOutlined />}
								onClick={() =>
									onRetry(
										messages
											.slice(0, index)
											.reverse()
											.find(x => x.role === AiMessageRole.User)?.content || ""
									)
								}
							/>
						)}
					</Space>
				</div>
			))}
		</div>
	);
}
