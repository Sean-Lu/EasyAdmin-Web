import React from "react";
import { Button, Col, Form, Input, message, Modal, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import UserAdd from "./UserAdd";
import UserEdit from "./UserEdit";
import UserDetail from "./UserDetail";
import UserRolePermission from "./UserRolePermission";
import { api } from "../../../actions/system/api";
import axios from "../../../api/index";

// 用户列表
export default class UserList extends React.Component {
	searchFormRef = React.createRef();

	constructor(props) {
		super(props);

		this.state = {
			rolePermissionModalVisible: false, // 角色权限设置弹窗是否可见
			currentRecord: null // 当前选中的用户记录
		};
	}

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="用户名称" name="userName">
						{<Input placeholder="请输入用户名称" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="手机号码" name="phoneNumber">
						{<Input placeholder="请输入手机号码" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="邮箱" name="email">
						{<Input placeholder="请输入邮箱" />}
					</Form.Item>
				</Col>
				<Col>
					<div style={{ float: "right" }}>
						<Button type="primary" htmlType="submit">
							查询
						</Button>
						<Button style={{ marginLeft: 8 }} onClick={onSearchFormReset}>
							重置
						</Button>
					</div>
				</Col>
			</Row>
		);
	};

	// ============ 弹窗 ===============
	renderModal = (
		record,
		addModalVisible,
		hideAddModal,
		onAddFinish,
		updateModalVisible,
		hideUpdateModal,
		onUpdateFinish,
		detailModalVisible,
		hideDetailModal
	) => {
		return (
			<>
				<UserAdd modalVisible={addModalVisible} onCancel={hideAddModal} onSubmit={onAddFinish} />
				<UserEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onSubmit={onUpdateFinish} record={record} />
				<UserDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	// ============ 行数据操作列功能扩展 ===============
	renderRecordOperate = record => {
		return (
			<>
				<span onClick={() => this.resetUserPassword(record)}>重置密码</span>
				<span onClick={() => this.handleRolePermission(record)}>分配角色</span>
			</>
		);
	};

	resetUserPassword = record => {
		Modal.confirm({
			title: "是否确认重置密码?",
			okText: "确认",
			okType: "danger",
			cancelText: "取消",
			// 点击确认触发
			onOk() {
				axios
					.post(api.user.resetPassword, {
						id: record.id
					})
					.then(res => {
						if (res.data === true) {
							message.success("操作成功");
						}
					})
					.catch(err => {
						console.log("重置密码异常", err);
					});
			},
			// 点击取消触发
			onCancel() {}
		});
	};

	// 处理角色权限提交
	handleRolePermissionSubmit = async (userId, roleIds) => {
		try {
			const res = await axios.post(api.user.assignRoles, {
				userId,
				roleIds
			});
			if (res.success) {
				message.success("更新角色权限成功 🎉");
				this.setState({ rolePermissionModalVisible: false });
			} else {
				message.error(res.message || "更新角色权限失败");
			}
		} catch (err) {
			console.log("更新角色权限异常", err);
			message.error("更新角色权限异常");
		}
	};

	// 角色权限设置
	handleRolePermission = record => {
		this.setState({
			rolePermissionModalVisible: true,
			currentRecord: record
		});
	};

	render() {
		const tableColumnAlign = "center";
		const columns = [
			{
				title: "用户名称",
				dataIndex: "userName",
				align: tableColumnAlign,
				width: 100
			},
			{
				title: "昵称",
				dataIndex: "nickName",
				align: tableColumnAlign,
				width: 120
			},
			{
				title: "手机号码",
				dataIndex: "phoneNumber",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "部门",
				dataIndex: "departmentName",
				align: tableColumnAlign,
				width: 100
			},
			{
				title: "岗位",
				dataIndex: "positionName",
				align: tableColumnAlign,
				width: 100
			},
			{
				title: "邮箱",
				dataIndex: "email",
				align: tableColumnAlign,
				width: 150
			}
		];

		return (
			<>
				<StandardTable
					code={"system.user"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderRecordOperate={this.renderRecordOperate}
					recordOperateColWidth={265}
					apiAdd={api.user.add}
					apiDelete={api.user.delete}
					apiUpdate={api.user.update}
					apiUpdateState={api.user.updateState}
					apiPage={api.user.page}
					apiDetail={api.user.detail}
				/>
				<UserRolePermission
					modalVisible={this.state?.rolePermissionModalVisible || false}
					onCancel={() => this.setState({ rolePermissionModalVisible: false })}
					onSubmit={this.handleRolePermissionSubmit}
					record={this.state?.currentRecord || null}
				/>
			</>
		);
	}
}
