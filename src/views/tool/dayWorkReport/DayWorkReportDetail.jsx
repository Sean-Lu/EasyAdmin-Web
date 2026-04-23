import React from "react";
import { Form, Modal } from "antd";

import moment from "moment";
import "moment/locale/zh-cn";
import DragableModal from "../../../components/DragableModal";

moment.locale("zh-cn");

// 日报详情弹窗
export default class DayWorkReportDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<DragableModal
				open={modalVisible}
				title="查看日报信息"
				footer={null}
				destroyOnHidden={true}
				onCancel={onCancel}
				width={800}
			>
				<Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} layout="horizontal">
					<Form.Item label="日期">
						<span>{moment(record.recordTime).format("YYYY-MM-DD")}</span>
					</Form.Item>
					<Form.Item label="今日工作">
						<span>
							{record.todayWork?.split("\n").map((line, index) => (
								<React.Fragment key={index}>
									{line}
									<br />
								</React.Fragment>
							))}
						</span>
					</Form.Item>
					<Form.Item label="明日计划">
						<span>
							{record.tomorrowPlan?.split("\n").map((line, index) => (
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
