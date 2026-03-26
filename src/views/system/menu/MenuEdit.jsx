import React from "react";
import { Button, Form, Input, InputNumber, Modal, Spin, Switch, TreeSelect } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

export default class MenuEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			menuTreeData: [],
			menuTreeLoading: false
		};
	}

	componentDidMount() {
		// 组件挂载时预加载数据（可选）
		// console.log("开始异步加载菜单树");
		// this.loadMenuTreeData();
	}

	// 当modalVisible从false变为true时加载数据
	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible) {
			// console.log("开始异步加载菜单树");
			this.loadMenuTreeData();
		}
	}

	// 异步加载菜单树
	loadMenuTreeData = async () => {
		this.setState({ menuTreeLoading: true });
		try {
			const res = await axios.get(api.menu.listTree, { all: true, includeTopMenu: true });
			if (res.success) {
				this.setState({
					menuTreeData: this.mapMenuTreeData(res.data),
					menuTreeLoading: false
				});
			} else {
				this.setState({ menuTreeLoading: false });
			}
		} catch (err) {
			console.log("查询菜单树异常", err);
			this.setState({ menuTreeLoading: false });
		}
	};

	// 字段映射
	mapMenuTreeData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			title: node.title,
			children: node.children ? this.mapMenuTreeData(node.children) : undefined
		}));
	};

	render() {
		const { modalVisible, record, handleCancel, handleFinish } = this.props;
		const { menuTreeData, menuTreeLoading } = this.state;
		return (
			<Modal open={modalVisible} title="修改菜单信息" footer={null} destroyOnClose={true} onCancel={handleCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={handleFinish}
					initialValues={{
						...record
					}}
				>
					<Form.Item
						name="pId"
						label="上级菜单"
						rules={[
							{
								required: true
							}
						]}
					>
						{menuTreeLoading ? (
							<Spin tip="加载菜单数据..." />
						) : (
							<TreeSelect
								placeholder="请选择上级菜单"
								treeData={menuTreeData}
								allowClear
								showSearch
								filterTreeNode={(input, treeNode) => (treeNode?.title ?? "").includes(input)}
								dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="title"
						label="菜单名称"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入菜单名称" />
					</Form.Item>
					<Form.Item
						name="path"
						label="菜单路由"
						rules={[
							{
								required: true
							}
						]}
					>
						<Input placeholder="请输入菜单路由" />
					</Form.Item>
					<Form.Item
						name="outLink"
						label="外部链接"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入外部链接" />
					</Form.Item>
					<Form.Item
						name="icon"
						label="图标"
						rules={[
							{
								required: false
							}
						]}
					>
						<Input placeholder="请输入图标" />
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
