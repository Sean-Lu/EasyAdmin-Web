import React from "react";
import { Button, Form, Input, InputNumber, Modal, Spin, Switch, TreeSelect, Select } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

// 部门新增弹窗
export default class DepartmentAdd extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			departmentTreeData: [], // 部门树数据
			departmentTreeLoading: false, // 部门树加载状态
			userSelectData: [], // 用户列表数据
			userSelectLoading: false // 用户列表加载状态
		};
	}

	// 当modalVisible从false变为true时加载数据
	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.loadDepartmentTreeData(); // 加载部门树
			this.loadUserSelectData(); // 加载用户列表
		}
	}

	// 异步加载部门树
	loadDepartmentTreeData = async () => {
		this.setState({ departmentTreeLoading: true });
		try {
			const res = await axios.get(api.department.listTree, { all: true, includeTopDepartment: true });
			if (res.success) {
				this.setState({
					departmentTreeData: this.mapTreeData(res.data),
					departmentTreeLoading: false
				});
			} else {
				this.setState({ departmentTreeLoading: false });
			}
		} catch (err) {
			console.log("查询部门树异常", err);
			this.setState({ departmentTreeLoading: false });
		}
	};

	// 异步加载用户列表数据
	loadUserSelectData = async () => {
		this.setState({ userSelectLoading: true });
		try {
			const res = await axios.get(api.user.list);
			if (res.success) {
				this.setState({
					userSelectData: this.mapUserSelectData(res.data),
					userSelectLoading: false
				});
			} else {
				this.setState({ userSelectLoading: false });
			}
		} catch (err) {
			console.log("查询用户列表异常", err);
			this.setState({ userSelectLoading: false });
		}
	};

	// 部门树字段映射
	mapTreeData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			title: node.name,
			children: node.children ? this.mapTreeData(node.children) : undefined
		}));
	};

	// 用户下拉字段映射
	mapUserSelectData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			label: node.nickName
		}));
	};

	render() {
		const { modalVisible, onCancel, onFinish } = this.props;
		const { departmentTreeData, departmentTreeLoading, userSelectData, userSelectLoading } = this.state;
		return (
			<Modal open={modalVisible} title="新增部门信息" footer={null} destroyOnClose={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onFinish}
					initialValues={{
						state: true,
						sort: 1
					}}
				>
					<Form.Item
						name="pId"
						label="上级部门"
						rules={[
							{
								required: false
							}
						]}
					>
						{departmentTreeLoading ? (
							<Spin tip="加载部门数据..." />
						) : (
							<TreeSelect
								placeholder="请选择上级部门"
								treeData={departmentTreeData}
								allowClear
								showSearch
								filterTreeNode={(input, treeNode) => (treeNode?.title ?? "").includes(input)}
								dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="name"
						label="部门名称"
						rules={[
							{
								required: true,
								message: "请输入部门名称"
							}
						]}
					>
						<Input placeholder="请输入部门名称" />
					</Form.Item>
					<Form.Item
						name="leaderId"
						label="负责人"
						rules={[
							{
								required: false
							}
						]}
					>
						{userSelectLoading ? (
							<Spin tip="加载用户数据..." />
						) : (
							<Select
								placeholder="请选择负责人"
								options={userSelectData}
								allowClear
								showSearch
								filterOption={(input, option) => (option?.label ?? "").includes(input)}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="phone"
						label="联系电话"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入联系电话" />
					</Form.Item>
					<Form.Item
						name="sort"
						label="排序"
						rules={[
							{
								required: false
							}
						]}
					>
						<InputNumber min={1} />
					</Form.Item>
					<Form.Item
						name="state"
						label="状态"
						valuePropName="checked"
						rules={[
							{
								required: false
							}
						]}
					>
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item
						name="remark"
						label="备注"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input.TextArea placeholder="请输入备注" rows={3} />
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
			</Modal>
		);
	}
}
