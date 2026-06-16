import React from "react";
import { Button, Col, DatePicker, Divider, Form, Row } from "antd";

import dayjs from "dayjs";

import StandardTable from "../../../components/StandardTable";
import MonthWorkReportAdd from "./MonthWorkReportAdd";
import MonthWorkReportEdit from "./MonthWorkReportEdit";
import MonthWorkReportDetail from "./MonthWorkReportDetail";
import { api } from "../../../actions/tool/api";
import ExportButton from "../../../components/ExportButton";

const { RangePicker } = DatePicker;

// 月报列表
export default class MonthWorkReportList extends React.Component {
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
				<MonthWorkReportAdd modalVisible={addModalVisible} onCancel={hideAddModal} onFinish={onAddFinish} />
				<MonthWorkReportEdit
					modalVisible={updateModalVisible}
					onCancel={hideUpdateModal}
					onFinish={onUpdateFinish}
					record={record}
				/>
				<MonthWorkReportDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	renderCustomTableButton = pageInfo => {
		return (
			<>
				<Divider orientation="vertical" />
				<ExportButton pageInfo={pageInfo} apiUrl={api.monthWorkReport.export} />
			</>
		);
	};

	handleAddValues = values => {
		const monthDate = values.month;
		return {
			startTime: monthDate.startOf("month").format("YYYY-MM-DD"),
			endTime: monthDate.endOf("month").format("YYYY-MM-DD"),
			monthWork: values.monthWork,
			nextMonthPlan: values.nextMonthPlan
		};
	};

	handleUpdateValues = values => {
		const monthDate = values.month;
		return {
			startTime: monthDate.startOf("month").format("YYYY-MM-DD"),
			endTime: monthDate.endOf("month").format("YYYY-MM-DD"),
			monthWork: values.monthWork,
			nextMonthPlan: values.nextMonthPlan
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
				title: "周期",
				dataIndex: "monthRange",
				align: tableColumnAlign,
				width: 200,
				render: (text, record) => {
					return {
						children: `${dayjs(record.startTime).format("YYYY-MM-DD")} ~ ${dayjs(record.endTime).format("YYYY-MM-DD")}`
					};
				}
			},
			{
				title: "本月工作",
				dataIndex: "monthWork",
				align: tableColumnAlign,
				render: text =>
					text?.split("\n").map((line, index) => (
						<div key={index}>
							{line}
							{index < text.split("\n").length - 1 ? <br /> : null}
						</div>
					))
			},
			{
				title: "下月计划",
				dataIndex: "nextMonthPlan",
				align: tableColumnAlign,
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
					code={"tool.monthWorkReport"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderCustomTableButton={this.renderCustomTableButton}
					handleAddValues={this.handleAddValues}
					handleUpdateValues={this.handleUpdateValues}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.monthWorkReport.add}
					apiDelete={api.monthWorkReport.delete}
					apiUpdate={api.monthWorkReport.update}
					apiPage={api.monthWorkReport.page}
					apiDetail={api.monthWorkReport.detail}
				/>
			</>
		);
	}
}
