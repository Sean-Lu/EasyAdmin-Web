import React from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Switch } from "antd";

import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 任务编辑弹窗
export default class TaskEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit, record } = this.props;
		return (
			<Modal open={modalVisible} title="修改任务信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onSubmit}
					initialValues={{
						...record,
						taskTimeRange: [
							record.taskStartTime !== null ? dayjs(record.taskStartTime) : null,
							record.taskEndTime !== null ? dayjs(record.taskEndTime) : null
						]
					}}
				>
					<Form.Item
						name="taskName"
						label="任务名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入任务名称" />
					</Form.Item>
					<Form.Item
						name="taskType"
						label="任务类型"
						rules={[
							{
								required: true
							}
						]}
					>
						<Select
							placeholder="请选择任务类型"
							allowClear={true}
							options={[
								{
									value: 1,
									label: "新手任务"
								},
								{
									value: 2,
									label: "日常任务"
								},
								{
									value: 3,
									label: "活动任务"
								}
							]}
						/>
					</Form.Item>
					<Form.Item name="taskReward" label="任务奖励">
						<Input placeholder="请输入任务奖励" />
					</Form.Item>
					<Form.Item name="taskTimeRange" label="有效期">
						<RangePicker showTime />
					</Form.Item>
					<Form.Item name="taskRule" label="任务规则">
						<TextArea placeholder="请输入任务规则" autoSize={{ minRows: 3, maxRows: 5 }} />
					</Form.Item>
					<Form.Item
						name="state"
						label="状态"
						valuePropName="checked"
						rules={[
							{
								required: false
							}
						]}
					>
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="cancel" onClick={onCancel}>
							取消
						</Button>
						<Button key="submit" type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
							确定
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
