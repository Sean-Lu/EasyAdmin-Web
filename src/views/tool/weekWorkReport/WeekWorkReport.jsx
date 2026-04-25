import React from "react";
import { Button, Col, DatePicker, Divider, Form, Row } from "antd";

import dayjs from "dayjs";

import StandardTable from "../../../components/StandardTable";
import WeekWorkReportAdd from "./WeekWorkReportAdd";
import WeekWorkReportEdit from "./WeekWorkReportEdit";
import WeekWorkReportDetail from "./WeekWorkReportDetail";
import { api } from "../../../actions/tool/api";
import ExportButton from "../../../components/ExportButton";

const { RangePicker } = DatePicker;

// 周报列表
export default class WeekWorkReportList extends React.Component {
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
				<WeekWorkReportAdd modalVisible={addModalVisible} onCancel={hideAddModal} onFinish={onAddFinish} />
				<WeekWorkReportEdit
					modalVisible={updateModalVisible}
					onCancel={hideUpdateModal}
					onFinish={onUpdateFinish}
					record={record}
				/>
				<WeekWorkReportDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	renderCustomTableButton = pageInfo => {
		return (
			<>
				<Divider orientation="vertical" />
				<ExportButton pageInfo={pageInfo} apiUrl={api.weekWorkReport.export} />
			</>
		);
	};

	handleAddValues = values => {
		const weekDate = values.week;
		return {
			startTime: weekDate.startOf("week").format("YYYY-MM-DD"),
			endTime: weekDate.endOf("week").format("YYYY-MM-DD"),
			weekWork: values.weekWork,
			nextWeekPlan: values.nextWeekPlan
		};
	};

	handleUpdateValues = values => {
		const weekDate = values.week;
		return {
			startTime: weekDate.startOf("week").format("YYYY-MM-DD"),
			endTime: weekDate.endOf("week").format("YYYY-MM-DD"),
			weekWork: values.weekWork,
			nextWeekPlan: values.nextWeekPlan
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
				dataIndex: "weekRange",
				align: tableColumnAlign,
				width: 200,
				render: (text, record) => {
					return {
						children: `${dayjs(record.startTime).format("YYYY-MM-DD")} ~ ${dayjs(record.endTime).format("YYYY-MM-DD")}`
					};
				}
			},
			{
				title: "本周工作",
				dataIndex: "weekWork",
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
				title: "下周计划",
				dataIndex: "nextWeekPlan",
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
					code={"tool.weekWorkReport"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					renderCustomTableButton={this.renderCustomTableButton}
					handleAddValues={this.handleAddValues}
					handleUpdateValues={this.handleUpdateValues}
					handleSearchValues={this.handleSearchValues}
					apiAdd={api.weekWorkReport.add}
					apiDelete={api.weekWorkReport.delete}
					apiUpdate={api.weekWorkReport.update}
					apiPage={api.weekWorkReport.page}
					apiDetail={api.weekWorkReport.detail}
				/>
			</>
		);
	}
}
