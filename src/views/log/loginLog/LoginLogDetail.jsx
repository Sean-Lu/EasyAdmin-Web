import React from "react";
import { Form, Modal } from "antd";
import moment from "moment";
import DragableModal from "../../../components/DragableModal";

export default class LoginLogDetail extends React.Component {
	render() {
		const { modalVisible, record, handleCancel } = this.props;

		return (
			<DragableModal open={modalVisible} title="查看登录日志信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
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
