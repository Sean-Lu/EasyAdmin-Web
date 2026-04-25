import React from "react";
import { Button, DatePicker, Form, Input } from "antd";

import dayjs from "dayjs";
import DragableModal from "../../../components/DragableModal";

const { TextArea } = Input;

// 周报新增弹窗
export default class WeekWorkReportAdd extends React.Component {
	render() {
		const { modalVisible, onCancel, onFinish } = this.props;
		return (
			<DragableModal
				open={modalVisible}
				title="新增周报信息"
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
						week: dayjs()
					}}
				>
					<Form.Item
						name="week"
						label="选择周"
						rules={[
							{
								required: true
							}
						]}
					>
						<DatePicker picker="week" style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						name="weekWork"
						label="本周工作"
						rules={[
							{
								required: true
							}
						]}
					>
						<TextArea autoSize={{ minRows: 5, maxRows: 10 }} />
					</Form.Item>
					<Form.Item name="nextWeekPlan" label="下周计划">
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
