import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import ParamAdd from "./ParamAdd";
import ParamEdit from "./ParamEdit";
import ParamDetail from "./ParamDetail";
import { api } from "../../../actions/system/api";

// 参数列表
export default class ParamList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="参数名称" name="paramName">
						{<Input placeholder="请输入参数名称" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="参数键名" name="paramKey">
						{<Input placeholder="请输入参数键名" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="参数键值" name="paramValue">
						{<Input placeholder="请输入参数键值" />}
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
				<ParamAdd modalVisible={addModalVisible} handleCancel={hideAddModal} handleFinish={onAddFinish} />
				{/*修改信息弹框*/}
				<ParamEdit
					modalVisible={updateModalVisible}
					record={record}
					handleCancel={hideUpdateModal}
					handleFinish={onUpdateFinish}
				/>
				{/*查看详情弹框*/}
				<ParamDetail modalVisible={detailModalVisible} record={record} handleCancel={hideDetailModal} />
			</>
		);
	};

	render() {
		const tableColumnAlign = "center";
		const columns = [
			{
				title: "参数名称",
				dataIndex: "paramName",
				align: tableColumnAlign,
				width: 300
			},
			{
				title: "参数键名",
				dataIndex: "paramKey",
				align: tableColumnAlign,
				width: 300
			},
			{
				title: "参数键值",
				dataIndex: "paramValue",
				align: tableColumnAlign,
				width: 300
			}
		];

		return (
			<>
				<StandardTable
					code={"system.param"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					apiAdd={api.param.add}
					apiDelete={api.param.delete}
					apiUpdate={api.param.update}
					apiUpdateState={api.param.updateState}
					apiPage={api.param.page}
					apiDetail={api.param.detail}
				></StandardTable>
			</>
		);
	}
}
