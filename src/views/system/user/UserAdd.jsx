import React from "react";
import { Button, Form, Input, Modal, Select, Spin, Switch, TreeSelect } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

export default class UserAdd extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			departmentTreeData: [],
			departmentTreeLoading: false,
			positionListData: [],
			positionListLoading: false
		};
	}

	// 当modalVisible从false变为true时加载数据
	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.loadDepartmentTreeData();
			this.loadPositionListData();
		}
	}

	// 异步加载部门树
	loadDepartmentTreeData = async () => {
		this.setState({ departmentTreeLoading: true });
		try {
			const res = await axios.get(api.department.listTree);
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

	// 异步加载岗位列表
	loadPositionListData = async () => {
		this.setState({ positionListLoading: true });
		try {
			const res = await axios.get(api.position.list);
			if (res.success) {
				this.setState({
					positionListData: res.data || [],
					positionListLoading: false
				});
			} else {
				this.setState({ positionListLoading: false });
			}
		} catch (err) {
			console.log("查询岗位列表异常", err);
			this.setState({ positionListLoading: false });
		}
	};

	// 字段映射
	mapTreeData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			title: node.name,
			children: node.children ? this.mapTreeData(node.children) : undefined
		}));
	};

	render() {
		const { modalVisible, handleCancel, handleFinish } = this.props;
		const { departmentTreeData, departmentTreeLoading, positionListData, positionListLoading } = this.state;
		return (
			<Modal open={modalVisible} title="新增用户信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleFinish}
					initialValues={{
						state: true // 设置默认为启用状态
					}}
				>
					<Form.Item
						name="userName"
						label="用户名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入用户名称" />
					</Form.Item>
					<Form.Item
						name="nickName"
						label="昵称"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入昵称" />
					</Form.Item>
					<Form.Item
						name="departmentId"
						label="部门"
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
								placeholder="请选择部门"
								treeData={departmentTreeData}
								allowClear
								showSearch
								filterTreeNode={(input, treeNode) => (treeNode?.title ?? "").includes(input)}
								dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="positionId"
						label="岗位"
						rules={[
							{
								required: false
							}
						]}
					>
						{positionListLoading ? (
							<Spin tip="加载岗位数据..." />
						) : (
							<Select
								placeholder="请选择岗位"
								allowClear
								showSearch
								optionFilterProp="children"
								options={positionListData.map(item => ({
									value: item.id,
									label: item.name
								}))}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="phoneNumber"
						label="手机号码"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入手机号码" />
					</Form.Item>
					<Form.Item
						name="email"
						label="邮箱"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入邮箱" />
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
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="cancel" onClick={handleCancel}>
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
