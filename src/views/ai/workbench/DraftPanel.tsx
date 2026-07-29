import { Alert, Button, Form, Input, InputNumber, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiService, AiDraft, AiDraftStatus, AiDraftType } from "@/services/ai/aiService";

interface Props {
	draft?: AiDraft;
	onChanged: (draft?: AiDraft) => void;
}

const labels = ["笔记", "待办", "日报", "周报", "月报"];

/** AI 草稿预览与确认面板 */
export default function DraftPanel({ draft, onChanged }: Props) {
	const [form] = Form.useForm();
	const [saving, setSaving] = useState(false);
	const navigate = useNavigate();
	const content = useMemo(() => {
		try {
			return draft ? JSON.parse(draft.contentJson) : {};
		} catch {
			return {};
		}
	}, [draft]);
	useEffect(() => form.setFieldsValue(content), [content, form]);
	if (!draft) return <Alert type="info" message="选择消息中的草稿进行预览" showIcon />;
	const editable = draft.status === AiDraftStatus.Pending;

	const fields = () => {
		switch (draft.draftType) {
			case AiDraftType.Note:
				return (
					<>
						<Form.Item name="title" label="标题" rules={[{ required: true, max: 200 }]}>
							<Input />
						</Form.Item>
						<Form.Item name="contentMarkdown" label="正文" rules={[{ required: true, max: 5000 }]}>
							<Input.TextArea rows={10} />
						</Form.Item>
					</>
				);
			case AiDraftType.Todo:
				return (
					<>
						<Form.Item name="name" label="待办名称" rules={[{ required: true, max: 100 }]}>
							<Input />
						</Form.Item>
						<Form.Item name="categoryId" label="分类 ID" rules={[{ required: true }]}>
							<InputNumber min={1} />
						</Form.Item>
						<Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
							<InputNumber min={1} max={3} />
						</Form.Item>
					</>
				);
			case AiDraftType.DayReport:
				return (
					<>
						<Form.Item name="recordTime" label="日期" rules={[{ required: true }]}>
							<Input type="date" />
						</Form.Item>
						<Form.Item name="todayWork" label="今日工作" rules={[{ required: true, max: 2000 }]}>
							<Input.TextArea rows={6} />
						</Form.Item>
						<Form.Item name="tomorrowPlan" label="明日计划" rules={[{ max: 2000 }]}>
							<Input.TextArea rows={4} />
						</Form.Item>
					</>
				);
			default: {
				const workName = draft.draftType === AiDraftType.WeekReport ? "weekWork" : "monthWork";
				const planName = draft.draftType === AiDraftType.WeekReport ? "nextWeekPlan" : "nextMonthPlan";
				return (
					<>
						<Form.Item name="startTime" label="开始日期" rules={[{ required: true }]}>
							<Input type="date" />
						</Form.Item>
						<Form.Item name="endTime" label="结束日期" rules={[{ required: true }]}>
							<Input type="date" />
						</Form.Item>
						<Form.Item name={workName} label="工作内容" rules={[{ required: true, max: 2000 }]}>
							<Input.TextArea rows={6} />
						</Form.Item>
						<Form.Item name={planName} label="后续计划" rules={[{ max: 2000 }]}>
							<Input.TextArea rows={4} />
						</Form.Item>
					</>
				);
			}
		}
	};

	const save = async () => {
		const values = await form.validateFields();
		const updated = await aiService.updateDraft({ id: draft.id, contentJson: JSON.stringify(values) });
		onChanged(updated);
		return updated;
	};
	const confirm = async () => {
		setSaving(true);
		try {
			if (editable) await save();
			const result = await aiService.confirmDraft(draft.id);
			const updated = await aiService.draftDetail(draft.id);
			onChanged(updated);
			message.success("草稿已保存");
			const routes: Partial<Record<AiDraftType, string>> = {
				[AiDraftType.Note]: `/user/note?openNoteId=${result.confirmedTargetId}`,
				[AiDraftType.Todo]: "/user/todoList",
				[AiDraftType.DayReport]: "/user/dayWorkReport",
				[AiDraftType.WeekReport]: "/user/weekWorkReport",
				[AiDraftType.MonthReport]: "/user/monthWorkReport"
			};
			navigate(routes[draft.draftType]!);
		} finally {
			setSaving(false);
		}
	};
	const remove = async () => {
		await aiService.deleteDraft(draft.id);
		message.success("草稿已删除");
		onChanged(undefined);
	};

	return (
		<div className="ai-draft-panel">
			<Space direction="vertical">
				<Typography.Title level={5}>{labels[draft.draftType]}草稿</Typography.Title>
				<Alert type={editable ? "warning" : "success"} message={editable ? "尚未保存到业务模块" : "已确认保存"} showIcon />
				<Typography.Text type="secondary">
					有效期至：{draft.expiresAt ? new Date(draft.expiresAt).toLocaleString() : "-"}
				</Typography.Text>
			</Space>
			<Form form={form} layout="vertical" disabled={!editable} className="ai-draft-form">
				{fields()}
			</Form>
			{editable && (
				<Space>
					<Button onClick={() => void save()}>保存修改</Button>
					<Button danger onClick={() => void remove()}>
						删除草稿
					</Button>
					<Button type="primary" loading={saving} onClick={() => void confirm()}>
						确认并保存
					</Button>
				</Space>
			)}
		</div>
	);
}
