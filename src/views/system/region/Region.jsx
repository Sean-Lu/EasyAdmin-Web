import React from "react";
import { Button, Col, Form, Input, Row, Select } from "antd";
import StandardTable from "../../../components/StandardTable";
import RegionAdd from "./RegionAdd";
import RegionEdit from "./RegionEdit";
import RegionDetail from "./RegionDetail";
import { api } from "../../../actions/system/api";

// 行政区划列表
export default class RegionList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="行政区划名称" name="name">
						<Input placeholder="请输入行政区划名称" />
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="层级" name="level">
						<Select
							placeholder="请选择层级"
							allowClear
							options={[
								{ value: 1, label: "省" },
								{ value: 2, label: "市" },
								{ value: 3, label: "区" }
							]}
						/>
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
				<RegionAdd modalVisible={addModalVisible} onCancel={hideAddModal} onFinish={onAddFinish} />
				<RegionEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onFinish={onUpdateFinish} record={record} />
				<RegionDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
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
				title: "行政区划名称",
				dataIndex: "name",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "行政区划代码",
				dataIndex: "code",
				align: tableColumnAlign,
				width: 130
			},
			{
				title: "层级",
				dataIndex: "level",
				align: tableColumnAlign,
				width: 80,
				render: level => {
					const map = { 1: "省", 2: "市", 3: "区" };
					return map[level] || level;
				}
			},
			{
				title: "排序",
				dataIndex: "sort",
				align: tableColumnAlign,
				width: 65
			}
		];

		return (
			<>
				<StandardTable
					code={"system.region"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.region.add}
					apiDelete={api.region.delete}
					apiUpdate={api.region.update}
					apiUpdateState={api.region.updateState}
					apiList={api.region.listTree}
					apiDetail={api.region.detail}
					disablePageSearch={true}
				/>
			</>
		);
	}
}
