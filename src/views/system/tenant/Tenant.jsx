import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import TenantAdd from "./TenantAdd";
import TenantEdit from "./TenantEdit";
import TenantDetail from "./TenantDetail";
import { api } from "../../../actions/system/api";

// 租户列表
export default class TenantList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="租户名称" name="name">
						{<Input placeholder="请输入租户名称" />}
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
				<TenantAdd modalVisible={addModalVisible} onCancel={hideAddModal} onSubmit={onAddFinish} />
				<TenantEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onSubmit={onUpdateFinish} record={record} />
				<TenantDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	render() {
		const tableColumnAlign = "center";
		const columns = [
			{
				title: "租户名称",
				dataIndex: "name",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "租管账号",
				dataIndex: "adminUserName",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "备注",
				dataIndex: "remark",
				align: tableColumnAlign,
				width: 300
			}
		];

		return (
			<>
				<StandardTable
					code={"system.tenant"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					apiAdd={api.tenant.add}
					apiDelete={api.tenant.delete}
					apiUpdate={api.tenant.update}
					apiUpdateState={api.tenant.updateState}
					apiPage={api.tenant.page}
					apiDetail={api.tenant.detail}
				/>
			</>
		);
	}
}
