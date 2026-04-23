import React from "react";
import { Button, Form, Modal } from "antd";

import moment from "moment";
import "moment/locale/zh-cn";

moment.locale("zh-cn");

// 任务详情弹窗
export default class TaskDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		const taskTypeEnumMap = {
			1: "新手任务",
			2: "日常任务",
			3: "活动任务"
		};

		return (
			<Modal open={modalVisible} title="查看任务信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="任务名称">
						<span>{record.taskName}</span>
					</Form.Item>
					<Form.Item label="任务类型">
						<span>{taskTypeEnumMap[record.taskType]}</span>
					</Form.Item>
					<Form.Item label="任务奖励">
						<span>{record.taskReward}</span>
					</Form.Item>
					<Form.Item label="有效期">
						<span>{record.taskStartTime !== null ? moment(record.taskStartTime).format("YYYY-MM-DD HH:mm:ss") : null}</span>
						<span> - </span>
						<span>{record.taskEndTime !== null ? moment(record.taskEndTime).format("YYYY-MM-DD HH:mm:ss") : null}</span>
					</Form.Item>
					<Form.Item label="任务规则">
						<span>{record.taskRule}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
					{/* <Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="close" onClick={onCancel}>
							关闭
						</Button>
					</Form.Item> */}
				</Form>
			</Modal>
		);
	}
}
