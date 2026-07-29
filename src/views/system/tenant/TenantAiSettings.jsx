import React from "react";
import { Alert, Button, Form, InputNumber, Modal, Spin, Switch, message } from "antd";
import { aiService } from "@/services/ai/aiService";

/** 租户 AI 设置弹窗 */
export default function TenantAiSettings({ modalVisible, onCancel, record }) {
	const [form] = Form.useForm();
	const [loading, setLoading] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState();
	const enabled = Form.useWatch("enabled", form);

	const load = React.useCallback(async () => {
		if (!modalVisible || !record?.id) return;
		setLoading(true);
		setError(undefined);
		try {
			form.setFieldsValue(await aiService.getTenantSetting(record.id));
		} catch {
			setError("AI 设置加载失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	}, [form, modalVisible, record?.id]);

	React.useEffect(() => {
		if (modalVisible) {
			void load();
		}
	}, [load, modalVisible]);

	const save = async values => {
		if (!record?.id) return;
		setSaving(true);
		setError(undefined);
		try {
			await aiService.updateTenantSetting({
				tenantId: record.id,
				enabled: Boolean(values.enabled),
				dailyRequestLimit: values.enabled ? values.dailyRequestLimit : 0
			});
			message.success("租户 AI 设置已保存");
			onCancel();
		} catch {
			setError("AI 设置保存失败，请稍后重试");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal
			open={modalVisible}
			title={`AI 设置 - ${record?.name ?? ""}`}
			okText="保存"
			cancelText="取消"
			confirmLoading={saving}
			okButtonProps={{ disabled: loading || Boolean(error) }}
			cancelButtonProps={{ disabled: saving }}
			destroyOnHidden={true}
			onCancel={onCancel}
			onOk={() => form.submit()}
		>
			<Spin spinning={loading}>
				{error && (
					<Alert
						type="error"
						showIcon
						message={error}
						action={
							<Button size="small" onClick={() => void load()}>
								重试
							</Button>
						}
						style={{ marginBottom: 24 }}
					/>
				)}
				<Form
					form={form}
					labelCol={{ span: 7 }}
					wrapperCol={{ span: 16 }}
					layout="horizontal"
					initialValues={{ enabled: false, dailyRequestLimit: 0 }}
					onFinish={save}
				>
					<Form.Item name="enabled" label="启用 AI" valuePropName="checked">
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item
						name="dailyRequestLimit"
						label="每日请求上限"
						dependencies={["enabled"]}
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!getFieldValue("enabled")) return Promise.resolve();
									if (Number.isInteger(value) && value >= 1 && value <= 100000) return Promise.resolve();
									return Promise.reject(new Error("请输入 1 至 100000 的整数"));
								}
							})
						]}
					>
						<InputNumber min={1} max={100000} precision={0} disabled={!enabled} style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
}
