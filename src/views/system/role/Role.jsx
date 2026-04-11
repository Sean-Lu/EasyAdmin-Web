import React from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import RoleAdd from "./RoleAdd";
import RoleEdit from "./RoleEdit";
import RoleDetail from "./RoleDetail";
import RoleMenuPermission from "./RoleMenuPermission";
import { api } from "../../../actions/system/api";
import axios from "../../../api/index";

// 角色列表
export default class RoleList extends React.Component {
	searchFormRef = React.createRef();

	constructor(props) {
		super(props);

		this.state = {
			menuPermissionModalVisible: false, // 菜单权限设置弹窗是否可见
			currentRecord: null // 当前选中的角色记录
		};
	}

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="角色名称" name="name">
						{<Input placeholder="请输入角色名称" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="角色编码" name="code">
						{<Input placeholder="请输入角色编码" />}
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
				<RoleAdd modalVisible={addModalVisible} onCancel={hideAddModal} onSubmit={onAddFinish} />
				<RoleEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onSubmit={onUpdateFinish} record={record} />
				<RoleDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	// ============ 行数据操作列功能扩展 ===============
	renderRecordOperate = record => {
		return (
			<>
				<span onClick={() => this.handleMenuPermission(record)}>菜单权限</span>
			</>
		);
	};

	// 菜单权限设置
	handleMenuPermission = record => {
		this.setState({
			menuPermissionModalVisible: true,
			currentRecord: record
		});
	};

	// 处理菜单权限提交
	handleMenuPermissionSubmit = async (roleId, menuIds) => {
		try {
			const res = await axios.post(api.role.assignMenus, {
				roleId,
				menuIds
			});
			if (res.success) {
				message.success("更新菜单权限成功 🎉");
				this.setState({ menuPermissionModalVisible: false });
			} else {
				message.error(res.message || "更新菜单权限失败");
			}
		} catch (err) {
			console.log("更新菜单权限异常", err);
			message.error("更新菜单权限异常");
		}
	};

	render() {
		const columns = [
			{
				title: "角色名称",
				key: "name",
				dataIndex: "name",
				align: "center",
				ellipsis: true
			},
			{
				title: "角色编码",
				key: "code",
				dataIndex: "code",
				align: "center",
				ellipsis: true
			},
			{
				title: "角色描述",
				key: "description",
				dataIndex: "description",
				align: "center",
				ellipsis: true
			}
		];

		return (
			<>
				<StandardTable
					code={"system.role"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderRecordOperate={this.renderRecordOperate}
					recordOperateColWidth={200}
					apiAdd={api.role.add}
					apiDelete={api.role.delete}
					apiUpdate={api.role.update}
					apiUpdateState={api.role.updateState}
					apiPage={api.role.page}
					apiDetail={api.role.detail}
				/>
				<RoleMenuPermission
					modalVisible={this.state?.menuPermissionModalVisible || false}
					onCancel={() => this.setState({ menuPermissionModalVisible: false })}
					onSubmit={this.handleMenuPermissionSubmit}
					record={this.state?.currentRecord || null}
				/>
			</>
		);
	}
}
