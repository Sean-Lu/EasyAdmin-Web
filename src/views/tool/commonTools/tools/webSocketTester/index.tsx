import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ApiOutlined,
	ArrowDownOutlined,
	ArrowLeftOutlined,
	ArrowUpOutlined,
	ClearOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	CopyOutlined,
	LinkOutlined,
	SendOutlined
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Input, InputNumber, Row, Space, Switch, Tag, Typography } from "antd";
import { useSelector } from "react-redux";
import clipboardUtil from "@/utils/clipboardUtil";
import {
	appendMessageRecord,
	createMessageRecord,
	formatMessageContent,
	validateWebSocketUrl,
	type MessageKind,
	type WebSocketMessageRecord
} from "./webSocketUtils";
import "./index.less";

type ConnectionStatus = "closed" | "connecting" | "open" | "closing" | "error";

interface WebSocketTesterProps {
	onBack?: () => void;
}

const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
	closed: { color: "default", label: "已断开" },
	connecting: { color: "processing", label: "连接中" },
	open: { color: "success", label: "已连接" },
	closing: { color: "warning", label: "关闭中" },
	error: { color: "error", label: "连接错误" }
};

const messageKindConfig: Record<MessageKind, { color: string; icon: React.ReactNode; label: string }> = {
	system: { color: "blue", icon: <LinkOutlined />, label: "系统" },
	sent: { color: "green", icon: <ArrowUpOutlined />, label: "发送" },
	received: { color: "cyan", icon: <ArrowDownOutlined />, label: "接收" },
	error: { color: "red", icon: <CloseCircleOutlined />, label: "错误" },
	closed: { color: "orange", icon: <CloseCircleOutlined />, label: "关闭" },
	binary: { color: "purple", icon: <ArrowDownOutlined />, label: "二进制" }
};

const formatTimestamp = (timestamp: number) => {
	const date = new Date(timestamp);
	return `${date.toLocaleTimeString("zh-CN", { hour12: false })}.${String(date.getMilliseconds()).padStart(3, "0")}`;
};

// WebSocket 测试工具
const WebSocketTester: React.FC<WebSocketTesterProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [address, setAddress] = useState("wss://echo.websocket.org");
	const [status, setStatus] = useState<ConnectionStatus>("closed");
	const [message, setMessage] = useState("");
	const [formatJson, setFormatJson] = useState(true);
	const [autoSend, setAutoSend] = useState(false);
	const [sendInterval, setSendInterval] = useState(1000);
	const [history, setHistory] = useState<WebSocketMessageRecord[]>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const messageRef = useRef(message);
	const historyEndRef = useRef<HTMLDivElement | null>(null);
	const addressError = useMemo(() => validateWebSocketUrl(address), [address]);
	const canSend = status === "open" && message.trim().length > 0;

	useEffect(() => {
		messageRef.current = message;
	}, [message]);

	const appendRecord = useCallback((kind: MessageKind, content: string) => {
		setHistory(current => appendMessageRecord(current, createMessageRecord(kind, content)));
	}, []);

	const stopAutoSend = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setAutoSend(false);
	}, []);

	const sendCurrentMessage = useCallback(() => {
		const socket = socketRef.current;
		const content = messageRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN || !content.trim()) return;

		socket.send(content);
		appendRecord("sent", content);
	}, [appendRecord]);

	const disconnect = useCallback(() => {
		stopAutoSend();
		const socket = socketRef.current;
		if (!socket || (socket.readyState !== WebSocket.CONNECTING && socket.readyState !== WebSocket.OPEN)) return;

		setStatus("closing");
		socket.close(1000, "用户主动断开");
	}, [stopAutoSend]);

	const connect = () => {
		if (addressError || status === "connecting" || status === "open") return;

		setStatus("connecting");
		appendRecord("system", `正在连接 ${address.trim()}`);

		let socket: WebSocket;
		try {
			socket = new WebSocket(address.trim());
		} catch (error) {
			setStatus("error");
			appendRecord("error", error instanceof Error ? error.message : "WebSocket 连接创建失败");
			return;
		}

		socket.binaryType = "arraybuffer";
		socketRef.current = socket;

		socket.onopen = () => {
			if (socketRef.current !== socket) return;
			setStatus("open");
			appendRecord("system", `已连接 ${address.trim()}`);
		};

		socket.onmessage = event => {
			if (typeof event.data === "string") {
				appendRecord("received", event.data);
			} else if (event.data instanceof ArrayBuffer) {
				appendRecord("binary", `收到二进制消息（${event.data.byteLength} 字节）`);
			} else if (event.data instanceof Blob) {
				appendRecord("binary", `收到二进制消息（${event.data.size} 字节）`);
			}
		};

		socket.onerror = () => {
			if (socketRef.current !== socket) return;
			setStatus("error");
			stopAutoSend();
			appendRecord("error", "WebSocket 连接发生错误");
		};

		socket.onclose = event => {
			if (socketRef.current !== socket) return;
			socketRef.current = null;
			stopAutoSend();
			setStatus("closed");
			const reason = event.reason ? `，原因：${event.reason}` : "";
			appendRecord("closed", `连接已关闭（代码：${event.code}${reason}）`);
		};
	};

	useEffect(() => {
		if (!autoSend) return;
		if (!canSend || sendInterval < 100 || sendInterval > 60000) {
			stopAutoSend();
			return;
		}

		timerRef.current = setInterval(sendCurrentMessage, sendInterval);
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [autoSend, canSend, sendCurrentMessage, sendInterval, stopAutoSend]);

	useEffect(() => {
		historyEndRef.current?.scrollIntoView({ block: "nearest" });
	}, [history]);

	useEffect(
		() => () => {
			if (timerRef.current) clearInterval(timerRef.current);
			const socket = socketRef.current;
			if (socket) {
				socket.onopen = null;
				socket.onmessage = null;
				socket.onerror = null;
				socket.onclose = null;
				if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) socket.close();
			}
		},
		[]
	);

	const currentStatus = statusConfig[status];
	const intervalInvalid = sendInterval < 100 || sendInterval > 60000;

	return (
		<div className={`websocket-tester-page${isDark ? " websocket-tester-dark" : ""}`}>
			<Card
				title={
					<Space>
						<ApiOutlined />
						WebSocket 在线测试
						<Tag color={currentStatus.color}>{currentStatus.label}</Tag>
					</Space>
				}
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<section className="websocket-section">
					<Typography.Title level={5}>连接设置</Typography.Title>
					<Space.Compact block>
						<Input
							value={address}
							onChange={event => setAddress(event.target.value)}
							placeholder="ws://localhost:8080 或 wss://example.com/socket"
							disabled={status === "connecting" || status === "open" || status === "closing"}
							status={addressError && address.trim() ? "error" : ""}
						/>
						{status === "open" || status === "connecting" || status === "closing" ? (
							<Button danger icon={<CloseCircleOutlined />} onClick={disconnect} disabled={status === "closing"}>
								断开
							</Button>
						) : (
							<Button type="primary" icon={<LinkOutlined />} onClick={connect} disabled={Boolean(addressError)}>
								连接
							</Button>
						)}
					</Space.Compact>
					{addressError && address.trim() && <Typography.Text type="danger">{addressError}</Typography.Text>}
				</section>

				<Row gutter={[20, 20]}>
					<Col xs={24} lg={10}>
						<section className="websocket-section send-section">
							<div className="section-header">
								<Typography.Title level={5}>发送消息</Typography.Title>
								<Space>
									<Typography.Text>JSON 格式化</Typography.Text>
									<Switch checked={formatJson} onChange={setFormatJson} />
								</Space>
							</div>
							<Input.TextArea
								value={message}
								onChange={event => setMessage(event.target.value)}
								placeholder="请输入要发送的消息"
								autoSize={{ minRows: 9, maxRows: 16 }}
							/>
							<Button type="primary" icon={<SendOutlined />} disabled={!canSend} onClick={sendCurrentMessage} block>
								发送消息
							</Button>
							<div className="auto-send-controls">
								<Space>
									<ClockCircleOutlined />
									<Typography.Text>定时发送</Typography.Text>
									<Switch checked={autoSend} disabled={!canSend || intervalInvalid} onChange={setAutoSend} />
								</Space>
								<Space.Compact>
									<InputNumber
										min={100}
										max={60000}
										precision={0}
										value={sendInterval}
										onChange={value => value !== null && setSendInterval(value)}
									/>
									<Space.Addon>ms</Space.Addon>
								</Space.Compact>
							</div>
							{intervalInvalid && <Alert type="error" showIcon message="发送间隔应在 100 到 60000ms 之间" />}
						</section>
					</Col>

					<Col xs={24} lg={14}>
						<section className="websocket-section history-section">
							<div className="section-header">
								<Space>
									<Typography.Title level={5}>调试消息</Typography.Title>
									<Tag>{history.length} / 500</Tag>
								</Space>
								<Button danger icon={<ClearOutlined />} disabled={history.length === 0} onClick={() => setHistory([])}>
									清空
								</Button>
							</div>
							<div className="message-history">
								{history.length === 0 ? (
									<div className="history-empty">连接和消息记录将显示在这里</div>
								) : (
									history.map(record => {
										const config = messageKindConfig[record.kind];
										const content = formatMessageContent(
											record.content,
											formatJson && ["sent", "received"].includes(record.kind)
										);
										return (
											<div className={`history-item history-${record.kind}`} key={record.id}>
												<div className="history-item-header">
													<Space size={6}>
														<Tag color={config.color} icon={config.icon}>
															{config.label}
														</Tag>
														<Typography.Text type="secondary">{formatTimestamp(record.timestamp)}</Typography.Text>
													</Space>
													<Button
														type="text"
														size="small"
														icon={<CopyOutlined />}
														onClick={() => clipboardUtil.copyString(content)}
													/>
												</div>
												<pre>{content}</pre>
											</div>
										);
									})
								)}
								<div ref={historyEndRef} />
							</div>
						</section>
					</Col>
				</Row>
			</Card>

			<Card title="使用方法" className="websocket-guide">
				<ol>
					<li>在服务地址栏输入 WebSocket 服务器地址</li>
					<li>点击“连接”按钮建立 WebSocket 连接</li>
					<li>在消息输入框中输入内容并发送，或启用定时发送</li>
					<li>在调试消息区域查看连接及消息收发记录</li>
				</ol>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12}>
						<Alert
							type="info"
							showIcon
							title="本地测试"
							description={<Typography.Text code>ws://localhost:8080</Typography.Text>}
						/>
					</Col>
					<Col xs={24} md={12}>
						<Alert
							type="info"
							showIcon
							title="安全连接"
							description={<Typography.Text code>wss://echo.websocket.org</Typography.Text>}
						/>
					</Col>
				</Row>
				<Typography.Text type="secondary">测试地址需要对应服务可用；外部回显服务的可用性不受本工具保证。</Typography.Text>
			</Card>
		</div>
	);
};

export default WebSocketTester;
