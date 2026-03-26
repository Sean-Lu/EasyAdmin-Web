import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import PositionAdd from "./PositionAdd";
import PositionEdit from "./PositionEdit";
import PositionDetail from "./PositionDetail";
import { api } from "../../../actions/system/api";

// 岗位列表
export default class PositionList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="岗位名称" name="name">
						<Input placeholder="请输入岗位名称" />
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="岗位编码" name="code">
						<Input placeholder="请输入岗位编码" />
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
				<PositionAdd modalVisible={addModalVisible} handleCancel={hideAddModal} handleFinish={onAddFinish} />
				{/*修改信息弹框*/}
				<PositionEdit
					modalVisible={updateModalVisible}
					record={record}
					handleCancel={hideUpdateModal}
					handleFinish={onUpdateFinish}
				/>
				{/*查看详情弹框*/}
				<PositionDetail modalVisible={detailModalVisible} record={record} handleCancel={hideDetailModal} />
			</>
		);
	};

	render() {
		const tableColumnAlign = "left";
		const columns = [
			{
				title: "岗位名称",
				dataIndex: "name",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "岗位编码",
				dataIndex: "code",
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
					code={"system.position"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					apiAdd={api.position.add}
					apiDelete={api.position.delete}
					apiUpdate={api.position.update}
					apiUpdateState={api.position.updateState}
					apiPage={api.position.page}
					apiDetail={api.position.detail}
				></StandardTable>
			</>
		);
	}
}
