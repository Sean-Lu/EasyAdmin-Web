import React from "react";
import { Col, Form, Input, InputNumber, Modal, Row, Switch } from "antd";
import type { FormInstance } from "antd";
import {
	ActivityFormValues,
	defaultActivityValues,
	defaultParticipantValues,
	defaultPrizeValues,
	ParticipantFormValues,
	PrizeFormValues
} from "../model";
import { CommonState } from "@/api/interface";

interface ActivityModalProps {
	open: boolean;
	editing: boolean;
	saving: boolean;
	form: FormInstance<ActivityFormValues>;
	onOk: () => void;
	onCancel: () => void;
}

interface PrizeModalProps {
	open: boolean;
	editing: boolean;
	saving: boolean;
	form: FormInstance<PrizeFormValues>;
	onOk: () => void;
	onCancel: () => void;
}

interface ParticipantModalProps {
	open: boolean;
	editing: boolean;
	saving: boolean;
	form: FormInstance<ParticipantFormValues>;
	onOk: () => void;
	onCancel: () => void;
}

interface ImportModalProps {
	open: boolean;
	saving: boolean;
	content: string;
	onContentChange: (value: string) => void;
	onOk: () => void;
	onCancel: () => void;
}

// AntD Switch 使用 boolean，后端使用 CommonState，这里统一做双向转换。
const stateSwitchProps = {
	getValueProps: (value?: CommonState) => ({ checked: value === CommonState.Enable }),
	getValueFromEvent: (checked: boolean) => (checked ? CommonState.Enable : CommonState.Disable)
};

export const ActivityModal: React.FC<ActivityModalProps> = ({ open, editing, saving, form, onOk, onCancel }) => (
	<Modal
		title={editing ? "编辑活动" : "新建活动"}
		open={open}
		onOk={onOk}
		onCancel={onCancel}
		confirmLoading={saving}
		destroyOnHidden
	>
		<Form form={form} layout="vertical" initialValues={defaultActivityValues}>
			<Form.Item label="活动名称" name="name" rules={[{ required: true, whitespace: true, message: "请输入活动名称" }]}>
				<Input maxLength={100} placeholder="请输入活动名称" />
			</Form.Item>
			<Form.Item label="活动说明" name="description">
				<Input.TextArea rows={3} maxLength={500} showCount placeholder="可填写抽奖说明、场景或规则" />
			</Form.Item>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item label="允许重复中奖" name="allowRepeatWinner" valuePropName="checked">
						<Switch />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="是否启用" name="state" {...stateSwitchProps}>
						<Switch />
					</Form.Item>
				</Col>
			</Row>
		</Form>
	</Modal>
);

export const PrizeModal: React.FC<PrizeModalProps> = ({ open, editing, saving, form, onOk, onCancel }) => (
	<Modal
		title={editing ? "编辑奖项" : "新增奖项"}
		open={open}
		onOk={onOk}
		onCancel={onCancel}
		confirmLoading={saving}
		destroyOnHidden
	>
		<Form form={form} layout="vertical" initialValues={defaultPrizeValues}>
			<Form.Item label="奖项名称" name="name" rules={[{ required: true, whitespace: true, message: "请输入奖项名称" }]}>
				<Input maxLength={100} placeholder="例如：一等奖" />
			</Form.Item>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item label="中奖名额" name="quota" rules={[{ required: true, message: "请输入中奖名额" }]}>
						<InputNumber min={1} max={9999} className="full-width-control" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="排序" name="sort">
						<InputNumber min={0} max={99999} className="full-width-control" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item label="奖项说明" name="description">
				<Input.TextArea rows={3} maxLength={500} showCount placeholder="可填写奖品、规则或备注" />
			</Form.Item>
			<Form.Item label="是否启用" name="state" {...stateSwitchProps}>
				<Switch />
			</Form.Item>
		</Form>
	</Modal>
);

export const ParticipantModal: React.FC<ParticipantModalProps> = ({ open, editing, saving, form, onOk, onCancel }) => (
	<Modal
		title={editing ? "编辑参与人" : "新增参与人"}
		open={open}
		onOk={onOk}
		onCancel={onCancel}
		confirmLoading={saving}
		destroyOnHidden
	>
		<Form form={form} layout="vertical" initialValues={defaultParticipantValues}>
			<Form.Item label="姓名" name="name" rules={[{ required: true, whitespace: true, message: "请输入参与人姓名" }]}>
				<Input maxLength={100} placeholder="请输入参与人姓名" />
			</Form.Item>
			<Form.Item label="编号" name="code">
				<Input maxLength={100} placeholder="手机号、工号或其他标识，可选" />
			</Form.Item>
			<Form.Item label="备注" name="description">
				<Input.TextArea rows={3} maxLength={500} showCount placeholder="可填写部门、来源或备注" />
			</Form.Item>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item label="排序" name="sort">
						<InputNumber min={0} max={99999} className="full-width-control" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="是否启用" name="state" {...stateSwitchProps}>
						<Switch />
					</Form.Item>
				</Col>
			</Row>
		</Form>
	</Modal>
);

export const ImportModal: React.FC<ImportModalProps> = ({ open, saving, content, onContentChange, onOk, onCancel }) => (
	<Modal title="批量导入参与人" open={open} onOk={onOk} onCancel={onCancel} confirmLoading={saving} destroyOnHidden>
		<Input.TextArea
			rows={10}
			value={content}
			onChange={event => onContentChange(event.target.value)}
			placeholder={"每行一个参与人姓名\n张三\n李四\n王五"}
		/>
	</Modal>
);
