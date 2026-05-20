import React from "react";
import { Form, Input, InputNumber, Modal, Select, Switch, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { message } from "antd";
import http from "../../../api";
import { PORT1 } from "../../../api/config/servicePort";
import { api } from "../../../actions/system/api";

const { TextArea } = Input;

/**
 * 更新管理 - 新增版本弹窗
 * 功能：上传 .zip 更新包，注册新版本
 * - AppCode 从下拉列表中选择（同步自应用标识管理）
 * - 版本号自动推荐（首次v1.0.0，后续自动patch+1）
 * - 支持全量更新包（Full）和增量更新包（Incremental）
 * - 支持设置强制更新标志和最低支持版本
 * - 仅接受 .zip 格式文件
 */
export default class VersionAdd extends React.Component {
	formRef = React.createRef();
	state = { loading: false, updateType: 0, appCodeList: [] };

	/** 弹窗显示时重置表单和状态 */
	componentDidMount() {
		if (this.props.modalVisible) {
			this.formRef.current?.resetFields();
		}
	}

	/** 弹窗关闭再打开时重置表单 */
	componentDidUpdate(prevProps) {
		if (this.props.modalVisible && !prevProps.modalVisible) {
			this.formRef.current?.resetFields();
			this.setState({ updateType: 0 });
			this.loadAppCodeList();
			if (this.props.selectedAppCode) {
				setTimeout(() => {
					this.formRef.current?.setFieldsValue({ appCode: this.props.selectedAppCode });
					this.suggestVersionName(this.props.selectedAppCode);
				}, 0);
			}
		}
	}

	loadAppCodeList = async () => {
		try {
			const res = await http.get(PORT1 + api.appCode.activeList);
			if (res?.success) {
				this.setState({ appCodeList: res.data || [] });
			}
		} catch (err) {
			message.error("加载应用标识列表失败");
		}
	};

	suggestVersionName = async appCode => {
		const platform = this.formRef.current?.getFieldValue("platform");
		if (!appCode || !platform) return;

		try {
			const res = await http.get(PORT1 + api.update.latestVersion, {
				appCode,
				platform
			});
			if (res?.success && res.data) {
				const suggested = this.bumpSemver(res.data.latestVersionName);
				if (suggested) {
					this.formRef.current?.setFieldsValue({ versionName: suggested });
				}
			} else {
				this.formRef.current?.setFieldsValue({ versionName: "v1.0.0" });
			}
		} catch (err) {
			message.error("获取最新版本号失败");
		}
	};

	bumpSemver = versionName => {
		if (!versionName) return null;
		const match = versionName.match(/^(v?)(\d+)\.(\d+)\.(\d+)$/);
		if (match) {
			const prefix = match[1];
			const major = parseInt(match[2]);
			const minor = parseInt(match[3]);
			const patch = parseInt(match[4]) + 1;
			return `${prefix}${major}.${minor}.${patch}`;
		}
		return null;
	};

	handleAppCodeChange = appCode => {
		this.suggestVersionName(appCode);
	};

	handlePlatformChange = platform => {
		const appCode = this.formRef.current?.getFieldValue("appCode");
		if (appCode) {
			this.suggestVersionName(appCode);
		}
	};

	/**
	 * 提交新增版本：
	 * 构建 FormData 上传 Multipart 请求（表单字段 + zip文件）
	 */
	handleOk = async () => {
		try {
			const values = await this.formRef.current.validateFields();
			this.setState({ loading: true });

			const formData = new FormData();
			formData.append("appCode", values.appCode);
			formData.append("versionName", values.versionName);
			formData.append("platform", values.platform);
			formData.append("changelog", values.changelog || "");
			formData.append("isForceUpdate", values.isForceUpdate || false);
			formData.append("minSupportedVersionCode", values.minSupportedVersionCode || 0);
			formData.append("updateType", this.state.updateType);

			// 上传的zip文件
			if (values.file?.length > 0) {
				formData.append("file", values.file[0].originFileObj);
			}

			const res = await http.post(PORT1 + api.update.register, formData);

			if (res.success === true) {
				message.success("版本注册成功");
				this.props.onFinish?.();
				this.props.onCancel();
			} else {
				message.error(res.msg || "注册失败");
			}
		} catch (err) {
			if (err.errorFields) return; // 表单验证错误，忽略
			message.error("操作失败: " + (err.message || ""));
		} finally {
			this.setState({ loading: false });
		}
	};

	render() {
		const { modalVisible, onCancel } = this.props;
		const { loading, updateType, appCodeList } = this.state;

		return (
			<Modal
				title="新增版本"
				open={modalVisible}
				onCancel={onCancel}
				onOk={this.handleOk}
				confirmLoading={loading}
				width={700}
				destroyOnClose
			>
				<Form ref={this.formRef} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
					{/* 应用标识 */}
					<Form.Item label="应用标识" name="appCode" rules={[{ required: true, message: "请选择应用标识" }]}>
						<Select placeholder="请选择应用标识" onChange={this.handleAppCodeChange} showSearch optionFilterProp="label">
							{appCodeList.map(item => (
								<Select.Option key={item.code} value={item.code} label={`${item.code} ${item.name}`}>
									<span style={{ fontWeight: 500 }}>{item.code}</span>
									<span style={{ color: "#888", marginLeft: 8, fontSize: 12 }}>{item.name}</span>
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					{/* 语义化版本号：如 1.0.0 */}
					<Form.Item label="版本号" name="versionName" rules={[{ required: true, message: "请输入版本号" }]}>
						<Input placeholder="如: v1.0.0" />
					</Form.Item>

					{/* 运行平台选择 */}
					<Form.Item label="平台" name="platform" rules={[{ required: true, message: "请选择目标平台" }]}>
						<Select placeholder="请选择目标平台" onChange={this.handlePlatformChange}>
							<Select.Option value="win-x64">win-x64</Select.Option>
							<Select.Option value="win-x86">win-x86</Select.Option>
							<Select.Option value="linux-x64">linux-x64</Select.Option>
							<Select.Option value="osx-x64">osx-x64</Select.Option>
						</Select>
					</Form.Item>

					{/* 更新包类型：全量/增量 */}
					<Form.Item label="更新包类型" style={{ marginBottom: 8 }}>
						<Select value={updateType} onChange={v => this.setState({ updateType: v })} style={{ width: "100%" }}>
							<Select.Option value={0}>全量更新包 (zip包含所有文件)</Select.Option>
							<Select.Option value={1}>增量更新包 (zip仅包含变更文件)</Select.Option>
						</Select>
					</Form.Item>

					{/* 强制更新标志 */}
					<Form.Item label="是否强制更新" name="isForceUpdate" valuePropName="checked" initialValue={false}>
						<Switch checkedChildren="是" unCheckedChildren="否" />
					</Form.Item>

					{/* 最低支持版本：低于此版本的客户端将被强制要求更新 */}
					<Form.Item label="最低支持版本" name="minSupportedVersionCode" initialValue={0}>
						<InputNumber min={0} style={{ width: "100%" }} placeholder="低于此版本的客户端将强制更新" />
					</Form.Item>

					{/* 更新日志：支持Markdown格式 */}
					<Form.Item label="更新日志" name="changelog">
						<TextArea rows={4} placeholder="Markdown格式，支持预览" />
					</Form.Item>

					{/* 更新包zip文件上传 */}
					<Form.Item
						label="更新包文件"
						name="file"
						rules={[{ required: true, message: "请上传 .zip 更新包" }]}
						valuePropName="fileList"
						getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
					>
						<Upload
							accept=".zip"
							maxCount={1}
							beforeUpload={file => {
								if (!file.name.endsWith(".zip")) {
									message.error("仅支持 .zip 格式文件");
									return Upload.LIST_IGNORE;
								}
								return false; // 阻止自动上传，交给 handleOk 手动提交
							}}
						>
							<div style={{ cursor: "pointer" }}>
								<UploadOutlined /> 选择更新包 (.zip)
							</div>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
