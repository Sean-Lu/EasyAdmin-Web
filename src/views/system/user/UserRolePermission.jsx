import React from "react";
import { Button, Modal, Checkbox, Spin, message } from "antd";
import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

// 用户角色分配弹窗
export default class UserRolePermission extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			roleList: [],
			checkedRoleIds: [],
			selectedUserId: null
		};
	}

	// 当modalVisible从false变为true时加载数据
	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible && this.props.record) {
			this.setState({ selectedUserId: this.props.record.id });
			this.loadRoleList();
			this.loadUserRoleIds();
		}
	}

	// 加载角色列表
	loadRoleList = async () => {
		this.setState({ loading: true });
		try {
			const res = await axios.get(api.role.list, {});
			if (res.success) {
				this.setState({
					roleList: res.data || [],
					loading: false
				});
			} else {
				this.setState({ loading: false });
			}
		} catch (err) {
			console.log("查询角色列表异常", err);
			this.setState({ loading: false });
			message.error("加载角色列表失败");
		}
	};

	// 加载用户已分配的角色ID
	loadUserRoleIds = async () => {
		if (!this.props.record) return;

		try {
			const res = await axios.get(api.user.getUserRoleIds, {
				userId: this.props.record.id
			});
			if (res.success) {
				this.setState({ checkedRoleIds: res.data || [] });
			}
		} catch (err) {
			console.log("查询用户角色异常", err);
		}
	};

	// 提交角色分配
	handleSubmit = async () => {
		const { selectedUserId } = this.state;
		const { onSubmit } = this.props;

		if (!selectedUserId) {
			message.warning("请选择用户");
			return;
		}

		// 提交角色分配
		onSubmit(selectedUserId, this.state.checkedRoleIds);
	};

	handleCancel = () => {
		this.props.onCancel();
	};

	// 处理角色选择
	onCheck = (e, roleId) => {
		const { checkedRoleIds } = this.state;
		let newCheckedRoleIds;

		if (e.target.checked) {
			// 添加角色ID
			newCheckedRoleIds = [...checkedRoleIds, roleId];
		} else {
			// 移除角色ID
			newCheckedRoleIds = checkedRoleIds.filter(id => id !== roleId);
		}

		this.setState({ checkedRoleIds: newCheckedRoleIds });
	};

	render() {
		const { modalVisible, record } = this.props;
		const { loading, roleList, checkedRoleIds, selectedUserId } = this.state;

		return (
			<Modal
				open={modalVisible}
				title={`为用户「${record?.userName || ""}」分配角色`}
				destroyOnHidden={true}
				mask={{ closable: false }}
				width={600}
				height={500}
				onCancel={this.handleCancel}
				footer={[
					<Button key="cancel" onClick={this.handleCancel}>
						取消
					</Button>,
					<Button key="submit" type="primary" onClick={this.handleSubmit} disabled={selectedUserId === null}>
						确定
					</Button>
				]}
			>
				{loading ? (
					<div style={{ textAlign: "center", padding: "40px" }}>
						<Spin description="加载角色数据中..." />
					</div>
				) : (
					<div
						style={{
							maxHeight: "400px",
							overflowY: "auto",
							border: "1px solid #d9d9d9",
							padding: "12px",
							borderRadius: "4px"
						}}
					>
						{roleList.map(role => (
							<div key={role.id} style={{ marginBottom: "8px" }}>
								<Checkbox
									checked={checkedRoleIds.includes(role.id)}
									onChange={e => this.onCheck(e, role.id)}
									disabled={role.state === 0}
								>
									{role.name} {role.state === 0 && "(禁用)"}
								</Checkbox>
							</div>
						))}
						{roleList.length === 0 && <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>暂无角色数据</div>}
					</div>
				)}
				<div style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>提示: 禁用的角色将显示为灰色且无法选择。</div>
			</Modal>
		);
	}
}
