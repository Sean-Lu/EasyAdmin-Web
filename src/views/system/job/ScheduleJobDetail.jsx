import React from "react";
import { Form, Modal } from "antd";

import dayjs from "dayjs";

// 定时任务详情弹窗
export default class ScheduleJobDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		const scheduleTypeEnumMap = {
			0: "简单调度",
			1: "Cron调度"
		};

		const intervalUnitEnumMap = {
			0: "秒",
			1: "分钟",
			2: "小时",
			3: "天"
		};

		return (
			<Modal open={modalVisible} title="查看定时任务" footer={null} destroyOnHidden={true} onCancel={onCancel} width={600}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="任务名称">
						<span>{record.jobName}</span>
					</Form.Item>
					<Form.Item label="调度类型">
						<span>{scheduleTypeEnumMap[record.scheduleType]}</span>
					</Form.Item>
					{record.scheduleType === 1 && (
						<Form.Item label="Cron表达式">
							<span>{record.cronExpression || "-"}</span>
						</Form.Item>
					)}
					{record.scheduleType === 0 && (
						<Form.Item label="执行间隔">
							<span>
								{record.simpleInterval} {intervalUnitEnumMap[record.simpleIntervalUnit] || "分钟"}
							</span>
						</Form.Item>
					)}
					<Form.Item label="任务类名">
						<span>{record.jobClassName}</span>
					</Form.Item>
					<Form.Item label="任务参数">
						<span>{record.jobData || "-"}</span>
					</Form.Item>
					<Form.Item label="描述">
						<span>{record.description || "-"}</span>
					</Form.Item>
					<Form.Item label="上次执行时间">
						<span>{record.lastExecuteTime ? dayjs(record.lastExecuteTime).format("YYYY-MM-DD HH:mm:ss") : "-"}</span>
					</Form.Item>
					<Form.Item label="下次执行时间">
						<span>{record.nextExecuteTime ? dayjs(record.nextExecuteTime).format("YYYY-MM-DD HH:mm:ss") : "-"}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
