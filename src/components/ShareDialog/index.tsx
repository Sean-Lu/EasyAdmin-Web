import { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Radio, Space, Switch, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { BackendIdInput } from "@/api/interface";
import { ShareConfigDto, ShareService, ShareTargetType } from "@/services/share/shareService";
import clipboardUtil from "@/utils/clipboardUtil";
import { buildShareClipboardText } from "./shareClipboard";

interface Props {
	open: boolean;
	targetType: ShareTargetType;
	targetId: BackendIdInput;
	onClose: () => void;
}

const ShareDialog = ({ open, targetType, targetId, onClose }: Props) => {
	const [form] = Form.useForm();
	const [config, setConfig] = useState<ShareConfigDto>();
	const [loading, setLoading] = useState(false);
	const [permanent, setPermanent] = useState(true);

	const load = async () => {
		setLoading(true);
		try {
			const value = await ShareService.config(targetType, targetId);
			setConfig(value);
			setPermanent(!value.expiresAt);
			form.setFieldsValue({
				isEnabled: value.exists ? value.isEnabled : false,
				expiresAt: value.expiresAt ? dayjs(value.expiresAt) : undefined,
				password: value.password
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open) void load();
	}, [open, targetType, targetId]);
	const link = config?.shareCode ? `${window.location.origin}${window.location.pathname}#/share/${config.shareCode}` : "";
	const save = async () => {
		const value = await form.validateFields();
		if (!permanent && !value.expiresAt) {
			message.error("请选择到期时间");
			return;
		}
		setLoading(true);
		try {
			const next = await ShareService.save({
				targetType,
				targetId,
				isEnabled: value.isEnabled,
				expiresAt: permanent ? undefined : (value.expiresAt as Dayjs).toISOString(),
				password: value.password
			});
			setConfig(next);
			setPermanent(!next.expiresAt);
			message.success("分享配置已保存");
		} finally {
			setLoading(false);
		}
	};
	const copy = (includePassword: boolean) => {
		clipboardUtil.copyString(includePassword ? buildShareClipboardText(link, config?.password) : link);
	};
	const regenerate = () =>
		Modal.confirm({
			title: "重新生成链接",
			content: "旧链接会立即失效，是否继续？",
			onOk: async () => {
				setConfig(await ShareService.regenerate(targetType, targetId));
				message.success("链接已重新生成");
			}
		});
	return (
		<Modal title="分享设置" open={open} onCancel={onClose} onOk={() => void save()} confirmLoading={loading} width={560}>
			<Form form={form} layout="vertical" initialValues={{ isEnabled: false }}>
				<Form.Item name="isEnabled" label="启用分享" valuePropName="checked">
					<Switch />
				</Form.Item>
				<Form.Item label="有效期">
					<Radio.Group
						value={permanent ? "forever" : "custom"}
						onChange={event => setPermanent(event.target.value === "forever")}
					>
						<Radio value="forever">永久有效</Radio>
						<Radio value="custom">指定到期时间</Radio>
					</Radio.Group>
				</Form.Item>
				{!permanent && (
					<Form.Item name="expiresAt" rules={[{ required: true, message: "请选择到期时间" }]}>
						<DatePicker showTime style={{ width: "100%" }} disabledDate={date => date && date < dayjs().startOf("day")} />
					</Form.Item>
				)}
				<Form.Item
					name="password"
					label="访问密码"
					rules={[{ min: 4, message: "密码至少四位" }]}
					extra="选填，留空表示任何拿到链接的人都可访问"
				>
					<Input maxLength={64} placeholder="不设置密码" />
				</Form.Item>
			</Form>
			{link && (
				<Space.Compact style={{ width: "100%" }}>
					<Input readOnly value={link} />
					<Button onClick={() => copy(true)}>复制分享信息</Button>
					<Button onClick={() => copy(false)}>仅复制链接</Button>
					<Button onClick={regenerate}>重置链接</Button>
				</Space.Compact>
			)}
		</Modal>
	);
};

export default ShareDialog;
