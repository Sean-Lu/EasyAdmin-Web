import React from "react";
import { Button, DatePicker, Form, Input } from "antd";

import dayjs from "dayjs";
import DragableModal from "../../../components/DragableModal";

const { TextArea } = Input;

// 月报新增弹窗
export default class MonthWorkReportAdd extends React.Component {
	render() {
		const { modalVisible, onCancel, onFinish } = this.props;
		return (
			<DragableModal
				open={modalVisible}
				title="新增月报信息"
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
						month: dayjs()
					}}
				>
					<Form.Item
						name="month"
						label="选择月"
						rules={[
							{
								required: true
							}
						]}
					>
						<DatePicker picker="month" style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="monthWork"
						label="本月工作"
						rules={[
							{
								required: true
							}
						]}
					>
						<TextArea autoSize={{ minRows: 5, maxRows: 10 }} />
					</Form.Item>
					<Form.Item name="nextMonthPlan" label="下月计划">
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
