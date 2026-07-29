import { Button, Input, Space, Typography } from "antd";
import { SendOutlined, StopOutlined } from "@ant-design/icons";

interface Props {
	value: string;
	generating: boolean;
	onChange: (value: string) => void;
	onSend: () => void;
	onStop: () => void;
}

/** AI 消息输入区 */
export default function ChatComposer({ value, generating, onChange, onSend, onStop }: Props) {
	return (
		<div className="ai-composer">
			<Input.TextArea
				value={value}
				maxLength={4000}
				autoSize={{ minRows: 2, maxRows: 7 }}
				placeholder="询问我的笔记、待办、报告，或生成一份草稿…"
				onChange={event => onChange(event.target.value)}
				onKeyDown={event => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						if (value.trim() && !generating) onSend();
					}
				}}
			/>
			<Space className="ai-composer-actions">
				<Typography.Text type="secondary">{value.length}/4000</Typography.Text>
				{generating ? (
					<Button danger icon={<StopOutlined />} onClick={onStop}>
						停止
					</Button>
				) : (
					<Button type="primary" icon={<SendOutlined />} disabled={!value.trim()} onClick={onSend}>
						发送
					</Button>
				)}
			</Space>
		</div>
	);
}
