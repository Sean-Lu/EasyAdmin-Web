import React from "react";
import { Button, Checkbox, Form, Input, Modal, Select, Spin, TreeSelect } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

const { TextArea } = Input;

export default class NotificationAdd extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userList: [],
			roleList: [],
			departmentTree: [],
			loading: false
		};
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.loadTargetOptions();
		}
	}

	loadTargetOptions = async () => {
		this.setState({ loading: true });
		try {
			const [userRes, roleRes, departmentRes] = await Promise.all([
				axios.get(api.user.list),
				axios.get(api.role.list),
				axios.get(api.department.listTree, { all: true })
			]);

			this.setState({
				userList: userRes.success ? userRes.data || [] : [],
				roleList: roleRes.success ? roleRes.data || [] : [],
				departmentTree: departmentRes.success ? this.mapDepartmentTree(departmentRes.data || []) : [],
				loading: false
			});
		} catch (err) {
			console.log("加载通知发送范围失败", err);
			this.setState({ loading: false });
		}
	};

	mapDepartmentTree = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			title: node.name,
			children: node.children ? this.mapDepartmentTree(node.children) : undefined
		}));
	};

	render() {
		const { modalVisible, onCancel, onSubmit } = this.props;
		const { userList, roleList, departmentTree, loading } = this.state;

		return (
			<Modal open={modalVisible} title="发送通知" footer={null} destroyOnHidden={true} onCancel={onCancel} width={760}>
				<Spin spinning={loading}>
					<Form
						labelCol={{ span: 5 }}
						wrapperCol={{ span: 18 }}
						layout="horizontal"
						onFinish={onSubmit}
						initialValues={{
							noticeType: 1,
							sendToAll: true
						}}
					>
						<Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
							<Input placeholder="请输入通知标题" maxLength={100} />
						</Form.Item>
						<Form.Item name="noticeType" label="类型" rules={[{ required: true }]}>
							<Select
								options={[
									{ value: 1, label: "普通" },
									{ value: 2, label: "重要" },
									{ value: 3, label: "紧急" }
								]}
							/>
						</Form.Item>
						<Form.Item name="sendToAll" label="发送范围" valuePropName="checked">
							<Checkbox>当前租户下所有启用用户</Checkbox>
						</Form.Item>
						<Form.Item name="userIds" label="指定用户">
							<Select
								mode="multiple"
								allowClear
								showSearch
								optionFilterProp="label"
								placeholder="可多选用户"
								options={userList.map(item => ({
									value: item.id,
									label: `${item.nickName || item.userName}(${item.userName})`
								}))}
							/>
						</Form.Item>
						<Form.Item name="roleIds" label="指定角色">
							<Select
								mode="multiple"
								allowClear
								showSearch
								optionFilterProp="label"
								placeholder="可多选角色"
								options={roleList.map(item => ({
									value: item.id,
									label: item.name
								}))}
							/>
						</Form.Item>
						<Form.Item name="departmentIds" label="指定部门">
							<TreeSelect
								treeCheckable
								showCheckedStrategy={TreeSelect.SHOW_PARENT}
								placeholder="可多选部门，包含子部门"
								allowClear
								treeData={departmentTree}
								styles={{ popup: { root: { maxHeight: 400, overflow: "auto" } } }}
							/>
						</Form.Item>
						<Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
							<TextArea placeholder="请输入通知内容" maxLength={4000} autoSize={{ minRows: 5, maxRows: 10 }} />
						</Form.Item>
						<Form.Item style={{ margin: "20px 0 0 150px" }}>
							<Button key="cancel" onClick={onCancel}>
								取消
							</Button>
							<Button key="submit" type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
								发送
							</Button>
						</Form.Item>
					</Form>
				</Spin>
			</Modal>
		);
	}
}
