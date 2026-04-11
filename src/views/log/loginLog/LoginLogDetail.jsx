import React from "react";
import { Form, Modal } from "antd";
import moment from "moment";
import DragableModal from "../../../components/DragableModal";

// 登录日志详情弹窗
export default class LoginLogDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<DragableModal open={modalVisible} title="查看登录日志信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="用户">
						<span>{record.userNickName}</span>
					</Form.Item>
					<Form.Item label="登录时间">
						<span>{record.loginTime !== null ? moment(record.loginTime).format("YYYY-MM-DD HH:mm:ss") : ""}</span>
					</Form.Item>
					<Form.Item label="IP">
						<span>{record.ip}</span>
					</Form.Item>
				</Form>
			</DragableModal>
		);
	}
}
