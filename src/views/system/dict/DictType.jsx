import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import StandardTable from "../../../components/StandardTable";
import DictTypeAdd from "./DictTypeAdd";
import DictTypeEdit from "./DictTypeEdit";
import DictTypeDetail from "./DictTypeDetail";
import DictTypeDataManager from "./DictTypeDataManager";
import { api } from "../../../actions/system/api";

export default class DictTypeList extends React.Component {
	searchFormRef = React.createRef();

	constructor(props) {
		super(props);

		this.state = {
			dataManagerModalVisible: false,
			currentRecord: null
		};
	}

	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="类型名称" name="name">
						<Input placeholder="请输入类型名称" />
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="类型编码" name="code">
						<Input placeholder="请输入类型编码" />
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
				<DictTypeAdd modalVisible={addModalVisible} onCancel={hideAddModal} onFinish={onAddFinish} />
				<DictTypeEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onFinish={onUpdateFinish} record={record} />
				<DictTypeDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	renderRecordOperate = record => {
		return (
			<>
				<span onClick={() => this.handleDataManager(record)}>管理数据</span>
			</>
		);
	};

	handleDataManager = record => {
		this.setState({
			dataManagerModalVisible: true,
			currentRecord: record
		});
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
				title: "类型名称",
				dataIndex: "name",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "类型编码",
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
					code={"system.dictType"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderRecordOperate={this.renderRecordOperate}
					recordOperateColWidth={200}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.dictType.add}
					apiDelete={api.dictType.delete}
					apiUpdate={api.dictType.update}
					apiUpdateState={api.dictType.updateState}
					apiPage={api.dictType.page}
					apiDetail={api.dictType.detail}
				/>
				<DictTypeDataManager
					modalVisible={this.state.dataManagerModalVisible}
					onCancel={() => this.setState({ dataManagerModalVisible: false })}
					record={this.state.currentRecord}
				/>
			</>
		);
	}
}
