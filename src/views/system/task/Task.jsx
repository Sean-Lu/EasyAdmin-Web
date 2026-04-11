import React from "react";
import { Button, Col, Form, Input, Row, Select } from "antd";
import StandardTable from "../../../components/StandardTable";

import moment from "moment";
import "moment/locale/zh-cn";

import TaskAdd from "./TaskAdd";
import TaskEdit from "./TaskEdit";
import TaskDetail from "./TaskDetail";
import { api } from "../../../actions/system/api";

moment.locale("zh-cn");

// 任务列表
export default class TaskList extends React.Component {
	searchFormRef = React.createRef();

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={6} sm={24}>
					<Form.Item label="任务名称" name="taskName">
						{<Input placeholder="请输入任务名称" />}
					</Form.Item>
				</Col>
				<Col md={6} sm={24}>
					<Form.Item label="任务类型" name="taskType">
						<Select
							placeholder="请选择任务类型"
							allowClear={true}
							options={[
								{
									value: 1,
									label: "新手任务"
								},
								{
									value: 2,
									label: "日常任务"
								},
								{
									value: 3,
									label: "活动任务"
								}
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
				<TaskAdd modalVisible={addModalVisible} onCancel={hideAddModal} onSubmit={onAddFinish} />
				<TaskEdit modalVisible={updateModalVisible} onCancel={hideUpdateModal} onSubmit={onUpdateFinish} record={record} />
				<TaskDetail modalVisible={detailModalVisible} onCancel={hideDetailModal} record={record} />
			</>
		);
	};

	handleAddValues = values => {
		return {
			taskName: values.taskName,
			taskType: values.taskType,
			taskReward: values.taskReward,
			taskStartTime:
				Array.isArray(values.taskTimeRange) && values.taskTimeRange.length > 0
					? values.taskTimeRange[0].format("YYYY-MM-DD HH:mm:ss")
					: null,
			taskEndTime:
				Array.isArray(values.taskTimeRange) && values.taskTimeRange.length > 1
					? values.taskTimeRange[1].format("YYYY-MM-DD HH:mm:ss")
					: null,
			taskRule: values.taskRule
		};
	};

	handleUpdateValues = values => {
		return {
			taskName: values.taskName,
			taskType: values.taskType,
			taskReward: values.taskReward,
			taskStartTime:
				Array.isArray(values.taskTimeRange) && values.taskTimeRange.length > 0
					? values.taskTimeRange[0].format("YYYY-MM-DD HH:mm:ss")
					: null,
			taskEndTime:
				Array.isArray(values.taskTimeRange) && values.taskTimeRange.length > 1
					? values.taskTimeRange[1].format("YYYY-MM-DD HH:mm:ss")
					: null,
			taskRule: values.taskRule
		};
	};

	render() {
		const tableColumnAlign = "center";
		const taskTypeEnumMap = {
			1: "新手任务",
			2: "日常任务",
			3: "活动任务"
		};
		const columns = [
			{
				title: "任务名称",
				dataIndex: "taskName",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "任务类型",
				dataIndex: "taskType",
				align: tableColumnAlign,
				width: 150,
				render: text => taskTypeEnumMap[text] || "未知"
			},
			{
				title: "任务奖励",
				dataIndex: "taskReward",
				align: tableColumnAlign,
				width: 150
			},
			{
				title: "有效期",
				dataIndex: "taskStartTime",
				colSpan: 2,
				align: tableColumnAlign,
				width: 150,
				render: text => {
					return {
						children: text !== null ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
					};
				}
			},
			{
				colSpan: 0,
				dataIndex: "taskEndTime",
				align: tableColumnAlign,
				width: 150,
				render: text => {
					return {
						children: text !== null ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""
					};
				}
			},
			{
				title: "任务规则",
				dataIndex: "taskRule",
				align: tableColumnAlign,
				width: 150
			}
		];

		return (
			<>
				<StandardTable
					code={"system.task"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					handleAddValues={this.handleAddValues}
					handleUpdateValues={this.handleUpdateValues}
					apiAdd={api.task.add}
					apiDelete={api.task.delete}
					apiUpdate={api.task.update}
					apiUpdateState={api.task.updateState}
					apiPage={api.task.page}
					apiDetail={api.task.detail}
				/>
			</>
		);
	}
}
