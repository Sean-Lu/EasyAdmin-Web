import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import MenuAdd from "./MenuAdd";
import MenuEdit from "./MenuEdit";
import MenuDetail from "./MenuDetail";
import { api } from "../../../actions/system/api";

// 菜单列表
export default class MenuList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="菜单名称" name="title">
						{<Input placeholder="请输入菜单名称" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="菜单路由" name="path">
						{<Input placeholder="请输入菜单路由" />}
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
				{/*新增信息弹框*/}
				<MenuAdd modalVisible={addModalVisible} handleCancel={hideAddModal} handleFinish={onAddFinish} />
				{/*修改信息弹框*/}
				<MenuEdit
					modalVisible={updateModalVisible}
					record={record}
					handleCancel={hideUpdateModal}
					handleFinish={onUpdateFinish}
				/>
				{/*查看详情弹框*/}
				<MenuDetail modalVisible={detailModalVisible} record={record} handleCancel={hideDetailModal} />
			</>
		);
	};

	render() {
		const tableColumnAlign = "left";
		const columns = [
			{
				title: "菜单名称",
				dataIndex: "title",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "菜单路由",
				dataIndex: "path",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "外部链接",
				dataIndex: "outLink",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "图标",
				dataIndex: "icon",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "排序",
				dataIndex: "sort",
				align: tableColumnAlign,
				width: 60
			}
		];

		return (
			<>
				<StandardTable
					code={"system.menu"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					apiAdd={api.menu.add}
					apiDelete={api.menu.delete}
					apiUpdate={api.menu.update}
					apiUpdateState={api.menu.updateState}
					apiList={api.menu.listTree}
					apiDetail={api.menu.detail}
					disablePageSearch={true}
				></StandardTable>
			</>
		);
	}
}
