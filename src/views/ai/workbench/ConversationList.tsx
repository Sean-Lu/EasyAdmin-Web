import { Button, Empty, Input, List, Popconfirm, Skeleton, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { AiConversation, BackendId } from "@/services/ai/aiTypes";

interface Props {
	items: AiConversation[];
	selectedId?: BackendId;
	loading: boolean;
	disabled?: boolean;
	hasMore?: boolean;
	onLoadMore?: () => void;
	onCreate: () => void;
	onSelect: (id: BackendId) => void;
	onRename: (id: BackendId, title: string) => void;
	onDelete: (id: BackendId) => void;
}

/** AI 会话列表 */
export default function ConversationList(props: Props) {
	const [editingId, setEditingId] = useState<BackendId>();
	const [editingTitle, setEditingTitle] = useState("");
	const saveRename = (id: BackendId) => {
		const title = editingTitle.trim();
		if (title) props.onRename(id, title);
		setEditingId(undefined);
		setEditingTitle("");
	};
	return (
		<div className="ai-conversations">
			<Button type="primary" icon={<PlusOutlined />} block disabled={props.disabled} onClick={props.onCreate}>
				新建会话
			</Button>
			<Skeleton loading={props.loading} active paragraph={{ rows: 6 }}>
				<List
					dataSource={props.items}
					locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会话" /> }}
					renderItem={item => (
						<List.Item
							className={item.id === props.selectedId ? "active" : ""}
							onClick={() => !props.disabled && editingId !== item.id && props.onSelect(item.id)}
							actions={
								editingId === item.id
									? [
											<CheckOutlined
												key="save"
												onClick={event => {
													event.stopPropagation();
													saveRename(item.id);
												}}
											/>,
											<CloseOutlined
												key="cancel"
												onClick={event => {
													event.stopPropagation();
													setEditingId(undefined);
													setEditingTitle("");
												}}
											/>
									  ]
									: [
											<EditOutlined
												key="rename"
												onClick={event => {
													event.stopPropagation();
													if (props.disabled) return;
													setEditingId(item.id);
													setEditingTitle(item.title);
												}}
											/>,
											<Popconfirm
												key="delete"
												title="确定删除该会话？"
												disabled={props.disabled}
												onConfirm={event => {
													event?.stopPropagation();
													props.onDelete(item.id);
												}}
											>
												<DeleteOutlined
													onClick={event => event.stopPropagation()}
													style={{ pointerEvents: props.disabled ? "none" : undefined, opacity: props.disabled ? 0.4 : 1 }}
												/>
											</Popconfirm>
									  ]
							}
						>
							<Space direction="vertical" size={0}>
								{editingId === item.id ? (
									<Input
										autoFocus
										maxLength={200}
										value={editingTitle}
										onClick={event => event.stopPropagation()}
										onChange={event => setEditingTitle(event.target.value)}
										onPressEnter={() => saveRename(item.id)}
										onKeyDown={event => {
											if (event.key === "Escape") {
												setEditingId(undefined);
												setEditingTitle("");
											}
										}}
									/>
								) : (
									<Typography.Text ellipsis>{item.title}</Typography.Text>
								)}
								<Typography.Text type="secondary" className="ai-conversation-time">
									{item.updateTime ? new Date(item.updateTime).toLocaleString() : ""}
								</Typography.Text>
							</Space>
						</List.Item>
					)}
				/>
				{props.hasMore && (
					<Button block disabled={props.disabled} onClick={props.onLoadMore}>
						加载更多会话
					</Button>
				)}
			</Skeleton>
		</div>
	);
}
