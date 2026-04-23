import React from "react";
import { Button, DatePicker, Form, Input, Modal } from "antd";

import locale from "antd/lib/date-picker/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
import DragableModal from "../../../components/DragableModal";

const { TextArea } = Input;

moment.locale("zh-cn");

// 日报编辑弹窗
export default class DayWorkReportEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onFinish, record } = this.props;
		return (
			<DragableModal
				open={modalVisible}
				title="修改日报信息"
				footer={null}
				destroyOnHidden={true}
				onCancel={onCancel}
				width={800}
			>
				<Form
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 20 }}
					layout="horizontal"
					onFinish={onFinish}
					initialValues={{
						...record,
						recordTime: moment(record.recordTime)
					}}
				>
					<Form.Item
						name="recordTime"
						label="日期"
						rules={[
							{
								required: true
							}
						]}
					>
						<DatePicker locale={locale} />
					</Form.Item>
					<Form.Item
						name="todayWork"
						label="今日工作"
						rules={[
							{
								required: true
							}
						]}
					>
						<TextArea autoSize={{ minRows: 5, maxRows: 10 }} />
					</Form.Item>
					<Form.Item name="tomorrowPlan" label="明日计划">
						<TextArea autoSize={{ minRows: 5, maxRows: 10 }} />
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
			</DragableModal>
		);
	}
}
