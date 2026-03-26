import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import DepartmentAdd from "./DepartmentAdd";
import DepartmentEdit from "./DepartmentEdit";
import DepartmentDetail from "./DepartmentDetail";
import { api } from "../../../actions/system/api";

// 部门列表
export default class DepartmentList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="部门名称" name="name">
						<Input placeholder="请输入部门名称" />
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
				<DepartmentAdd modalVisible={addModalVisible} handleCancel={hideAddModal} handleFinish={onAddFinish} />
				{/*修改信息弹框*/}
				<DepartmentEdit
					modalVisible={updateModalVisible}
					record={record}
					handleCancel={hideUpdateModal}
					handleFinish={onUpdateFinish}
				/>
				{/*查看详情弹框*/}
				<DepartmentDetail modalVisible={detailModalVisible} record={record} handleCancel={hideDetailModal} />
			</>
		);
	};

	handleSearchValues = fields => {
		return {
			all: true,
			...fields
		};
	};

	render() {
		const tableColumnAlign = "left";
		const columns = [
			{
				title: "部门名称",
				dataIndex: "name",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "负责人",
				dataIndex: "leaderName",
				align: tableColumnAlign,
				width: 100
			},
			{
				title: "联系电话",
				dataIndex: "phone",
				align: tableColumnAlign,
				width: 130
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
					code={"system.department"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.department.add}
					apiDelete={api.department.delete}
					apiUpdate={api.department.update}
					apiUpdateState={api.department.updateState}
					apiList={api.department.listTree}
					apiDetail={api.department.detail}
					disablePageSearch={true}
				></StandardTable>
			</>
		);
	}
}
