import React from "react";
import { Button, Modal, Tree, Spin, message } from "antd";
import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

// 角色菜单权限分配弹窗
export default class RoleMenuPermission extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			menuTreeData: [],
			checkedKeys: [],
			expandedKeys: [],
			selectedRoleId: null
		};
	}

	// 当modalVisible从false变为true时加载数据
	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible && this.props.record) {
			this.setState({ selectedRoleId: this.props.record.id });
			this.loadMenuTreeData();
			this.loadRoleMenuIds();
		}
	}

	// 加载菜单树数据
	loadMenuTreeData = async () => {
		this.setState({ loading: true });
		try {
			const res = await axios.get(api.menu.listTree, {
				includeTopMenu: false, // 不包含顶级菜单
				all: true // 包含所有菜单，包括禁用的
			});
			if (res.success) {
				const menuTreeData = this.mapMenuTreeData(res.data || []);
				this.setState({
					menuTreeData,
					loading: false,
					expandedKeys: menuTreeData.map(item => item.key) // 默认展开所有节点
				});
			} else {
				this.setState({ loading: false });
			}
		} catch (err) {
			console.log("查询菜单树异常", err);
			this.setState({ loading: false });
			message.error("加载菜单树失败");
		}
	};

	// 加载角色已分配的菜单ID
	loadRoleMenuIds = async () => {
		if (!this.props.record) return;

		try {
			const res = await axios.get(api.role.getRoleMenuIds, {
				roleId: this.props.record.id
			});
			if (res.success) {
				this.setState({ checkedKeys: res.data || [] });
			}
		} catch (err) {
			console.log("查询角色菜单权限异常", err);
		}
	};

	// 映射菜单树数据结构
	mapMenuTreeData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			title: node.title,
			children: node.children ? this.mapMenuTreeData(node.children) : undefined,
			disabled: node.state === 0 // 禁用的菜单节点不可选择
		}));
	};

	// 提交菜单权限分配
	handleSubmit = async () => {
		const { selectedRoleId } = this.state;
		const { onSubmit } = this.props;

		if (!selectedRoleId) {
			message.warning("请选择角色");
			return;
		}

		// 提交菜单权限分配
		onSubmit(selectedRoleId, this.state.checkedKeys);
	};

	handleCancel = () => {
		this.props.onCancel();
	};

	// 处理树节点选择
	onCheck = checkedKeys => {
		this.setState({ checkedKeys });
	};

	// 处理树节点展开
	onExpand = expandedKeys => {
		this.setState({ expandedKeys });
	};

	render() {
		const { modalVisible, record } = this.props;
		const { loading, menuTreeData, checkedKeys, expandedKeys, selectedRoleId } = this.state;

		return (
			<Modal
				open={modalVisible}
				title={`为角色「${record?.name || ""}」分配菜单权限`}
				destroyOnHidden={true}
				mask={{ closable: false }}
				width={800}
				height={600}
				onCancel={this.handleCancel}
				footer={[
					<Button key="cancel" onClick={this.handleCancel}>
						取消
					</Button>,
					<Button key="submit" type="primary" onClick={this.handleSubmit} disabled={selectedRoleId === null}>
						确定
					</Button>
				]}
			>
				{loading ? (
					<div style={{ textAlign: "center", padding: "40px" }}>
						<Spin description="加载菜单数据中..." />
					</div>
				) : (
					<div
						style={{
							maxHeight: "500px",
							overflowY: "auto",
							border: "1px solid #d9d9d9",
							padding: "12px",
							borderRadius: "4px"
						}}
					>
						<Tree
							checkable
							defaultExpandAll={false}
							expandedKeys={expandedKeys}
							checkedKeys={checkedKeys}
							treeData={menuTreeData}
							onCheck={this.onCheck}
							onExpand={this.onExpand}
							// showLine={true}
							checkStrictly={false} // 父子节点关联
						/>
					</div>
				)}
				<div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
					提示: 禁用的菜单将显示为灰色且无法选择，选择父节点将自动选择其所有子节点。
				</div>
			</Modal>
		);
	}
}
