import React from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Switch } from "antd";

import locale from "antd/lib/date-picker/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";

moment.locale("zh-cn");
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default class TaskAdd extends React.Component {
	render() {
		const { modalVisible, handleCancel, handleFinish } = this.props;
		return (
			<Modal open={modalVisible} title="新增任务信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleFinish}
					initialValues={{
						state: true // 设置默认为启用状态
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
						<RangePicker showTime locale={locale} />
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
						<Button key="cancel" onClick={handleCancel}>
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
