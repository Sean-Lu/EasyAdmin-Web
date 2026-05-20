import React from "react";
import { Form, Input, InputNumber, Modal, Switch } from "antd";
import { message } from "antd";
import http from "../../../api";
import { PORT1 } from "../../../api/config/servicePort";
import { api } from "../../../actions/system/api";

const { TextArea } = Input;

/**
 * 更新管理 - 编辑版本弹窗
 * 功能：修改版本的元数据信息（不涉及文件变更）
 * - 可修改版本名称、更新日志、强制更新标志、最低支持版本
 * - 版本文件内容通过重新上传新版本（VersionAdd）来更新，不可在此修改
 */
export default class VersionEdit extends React.Component {
	state = { loading: false };
	formInstance = null;

	/** ref callback：Form DOM 真正挂载时触发，直接回填数据 */
	handleFormRef = form => {
		this.formInstance = form;
		if (form && this.props.record) {
			const { record } = this.props;
			form.setFieldsValue({
				versionName: record.versionName,
				changelog: record.changelog,
				isForceUpdate: record.isForceUpdate,
				minSupportedVersionCode: record.minSupportedVersionCode
			});
		}
	};

	/** 提交修改：发送 POST 请求更新版本元数据 */
	handleOk = async () => {
		try {
			const values = await this.formInstance.validateFields();
			this.setState({ loading: true });
			const { record } = this.props;

			const res = await http.post(PORT1 + api.update.update, {
				id: record.id,
				versionName: values.versionName,
				changelog: values.changelog || "",
				isForceUpdate: values.isForceUpdate || false,
				minSupportedVersionCode: values.minSupportedVersionCode || 0
			});

			if (res?.success) {
				message.success("修改成功");
				this.props.onFinish?.();
				this.props.onCancel();
			} else {
				message.error(res?.msg || "修改失败");
			}
		} catch (err) {
			if (err.errorFields) return; // 表单验证错误
			message.error("操作失败");
		} finally {
			this.setState({ loading: false });
		}
	};

	render() {
		const { modalVisible, onCancel } = this.props;
		const { loading } = this.state;

		return (
			<Modal
				title="编辑版本"
				open={modalVisible}
				onCancel={onCancel}
				onOk={this.handleOk}
				confirmLoading={loading}
				width={600}
				destroyOnClose
			>
				<Form ref={this.handleFormRef} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
					{/* 版本号：编辑模式下禁用，避免误修改 */}
					<Form.Item label="版本号" name="versionName" rules={[{ required: true, message: "请输入版本号" }]}>
						<Input disabled />
					</Form.Item>

					{/* 强制更新标志 */}
					<Form.Item label="是否强制更新" name="isForceUpdate" valuePropName="checked">
						<Switch checkedChildren="是" unCheckedChildren="否" />
					</Form.Item>

					{/* 最低支持版本码 */}
					<Form.Item label="最低支持版本" name="minSupportedVersionCode">
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>

					{/* 更新日志 */}
					<Form.Item label="更新日志" name="changelog">
						<TextArea rows={5} placeholder="Markdown格式" />
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
