import React from "react";
import { Form } from "antd";

import dayjs from "dayjs";
import DragableModal from "../../../components/DragableModal";

// 周报详情弹窗
export default class WeekWorkReportDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<DragableModal
				open={modalVisible}
				title="查看周报信息"
				footer={null}
				destroyOnHidden={true}
				onCancel={onCancel}
				width={800}
			>
				<Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} layout="horizontal">
					<Form.Item label="开始日期">
						<span>{dayjs(record.startTime).format("YYYY-MM-DD")}</span>
					</Form.Item>
					<Form.Item label="结束日期">
						<span>{dayjs(record.endTime).format("YYYY-MM-DD")}</span>
					</Form.Item>
					<Form.Item label="本周工作">
						<span>
							{record.weekWork?.split("\n").map((line, index) => (
								<React.Fragment key={index}>
									{line}
									<br />
								</React.Fragment>
							))}
						</span>
					</Form.Item>
					<Form.Item label="下周计划">
						<span>
							{record.nextWeekPlan?.split("\n").map((line, index) => (
								<React.Fragment key={index}>
									{line}
									<br />
								</React.Fragment>
							))}
						</span>
					</Form.Item>
				</Form>
			</DragableModal>
		);
	}
}
