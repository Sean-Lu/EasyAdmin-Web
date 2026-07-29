import { Alert, Button, Card, Form, Input, InputNumber, Modal, Space, message } from "antd";
import { useEffect, useState } from "react";
import { aiService } from "@/services/ai/aiService";
import { AiConfigFormValues, toAiConfigRequest } from "./aiConfigForm";
import "./index.less";

/** AI 模型配置页面 */
export default function AiConfig() {
	const [form] = Form.useForm<AiConfigFormValues>();
	const [saving, setSaving] = useState(false);
	const [maskedKey, setMaskedKey] = useState("");
	const [testResult, setTestResult] = useState<string>();
	const load = async () => {
		const config = await aiService.getModelConfig();
		setMaskedKey(config.maskedApiKey);
		form.setFieldsValue({ ...config, apiKey: "" });
	};
	useEffect(() => void load(), []);

	const save = async () => {
		const values = await form.validateFields();
		const request = toAiConfigRequest({ ...values, maskedApiKey: maskedKey });
		setSaving(true);
		try {
			await aiService.updateModelConfig(request);
			message.success("AI 模型配置已保存");
			await load();
		} finally {
			setSaving(false);
		}
	};
	const test = () =>
		Modal.confirm({
			title: "保存并测试连接？",
			content: "将先保存当前有效配置，再调用模型连接测试。",
			onOk: async () => {
				await save();
				const result = await aiService.testConnection();
				setTestResult(`${result.result}（${result.latencyMs} ms）`);
			}
		});

	return (
		<Card title="AI 模型配置" className="ai-admin-card">
			{testResult && <Alert type="info" message={testResult} closable onClose={() => setTestResult(undefined)} />}
			<Form form={form} layout="vertical">
				<Form.Item name="baseUrl" label="服务地址" rules={[{ required: true }]}>
					<Input placeholder="https://api.example.com/v1" />
				</Form.Item>
				<Form.Item name="model" label="模型" rules={[{ required: true }]}>
					<Input />
				</Form.Item>
				<Form.Item name="apiKey" label={`替换 API Key${maskedKey ? `（当前：${maskedKey}）` : ""}`}>
					<Input.Password placeholder="留空表示不更换" autoComplete="new-password" />
				</Form.Item>
				<div className="ai-config-parameters">
					<Form.Item name="timeoutSeconds" label="超时（秒）">
						<InputNumber min={5} max={300} />
					</Form.Item>
					<Form.Item name="maxOutputTokens" label="最大输出令牌">
						<InputNumber min={128} max={32768} />
					</Form.Item>
					<Form.Item name="temperature" label="温度">
						<InputNumber min={0} max={2} step={0.1} />
					</Form.Item>
				</div>
				<div className="ai-config-actions">
					<Space>
						<Button type="primary" loading={saving} onClick={() => void save()}>
							保存
						</Button>
						<Button onClick={test}>测试连接</Button>
					</Space>
				</div>
			</Form>
		</Card>
	);
}
