import React from "react";
import { Button, Col, DatePicker, Divider, Form, Row } from "antd";

import moment from "moment";
import "moment/locale/zh-cn";

import StandardTable from "../../../components/StandardTable";
import DayWorkReportAdd from "./DayWorkReportAdd";
import DayWorkReportEdit from "./DayWorkReportEdit";
import DayWorkReportDetail from "./DayWorkReportDetail";
import { api } from "../../../actions/tool/api";
import ExportButton from "../../../components/ExportButton";

const { RangePicker } = DatePicker;

moment.locale("zh-cn");

// 日报列表
export default class DayWorkReportList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="日期范围" name="rangeTime">
						<RangePicker placeholder={["开始日期", "结束日期"]} allowEmpty={[true, true]} />
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
				<DayWorkReportAdd modalVisible={addModalVisible} onCancel={hideAddModal} onFinish={onAddFinish} />
				<DayWorkReportEdit
					modalVisible={updateModalVisible}
					onCancel={hideUpdateModal}
					onFinish={onUpdateFinish}
					record={record}
				/>
				<DayWorkReportDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	renderCustomTableButton = pageInfo => {
		return (
			<>
				<Divider orientation="vertical" />
				<ExportButton pageInfo={pageInfo} apiUrl={api.dayWorkReport.export} />
			</>
		);
	};

	handleAddValues = values => {
		return {
			recordTime: moment(values.recordTime).format("YYYY-MM-DD"),
			todayWork: values.todayWork,
			tomorrowPlan: values.tomorrowPlan
		};
	};

	handleUpdateValues = values => {
		return {
			recordTime: moment(values.recordTime).format("YYYY-MM-DD"),
			todayWork: values.todayWork,
			tomorrowPlan: values.tomorrowPlan
		};
	};

	handleSearchValues = fields => {
		return {
			startTime:
				Array.isArray(fields.rangeTime) && fields.rangeTime.length > 0 ? fields.rangeTime[0]?.format("YYYY-MM-DD") : null,
			endTime: Array.isArray(fields.rangeTime) && fields.rangeTime.length > 1 ? fields.rangeTime[1]?.format("YYYY-MM-DD") : null
		};
	};

	render() {
		const tableColumnAlign = "left";
		const columns = [
			{
				title: "日期",
				dataIndex: "recordTime",
				align: tableColumnAlign,
				width: 105,
				render: text => {
					return {
						children: moment(text).format("YYYY-MM-DD")
					};
				}
			},
			{
				title: "今日工作",
				dataIndex: "todayWork",
				align: tableColumnAlign,
				// width: 250,
				render: text =>
					text?.split("\n").map((line, index) => (
						<div key={index}>
							{line}
							{index < text.split("\n").length - 1 ? <br /> : null}
						</div>
					))
			},
			{
				title: "明日计划",
				dataIndex: "tomorrowPlan",
				align: tableColumnAlign,
				// width: 250,
				render: text =>
					text?.split("\n").map((line, index) => (
						<div key={index}>
							{line}
							{index < text.split("\n").length - 1 ? <br /> : null}
						</div>
					))
			}
		];

		return (
			<>
				<StandardTable
					code={"tool.dayWorkReport"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderCustomTableButton={this.renderCustomTableButton}
					handleAddValues={this.handleAddValues}
					handleUpdateValues={this.handleUpdateValues}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.dayWorkReport.add}
					apiDelete={api.dayWorkReport.delete}
					apiUpdate={api.dayWorkReport.update}
					apiPage={api.dayWorkReport.page}
					apiDetail={api.dayWorkReport.detail}
				/>
			</>
		);
	}
}
