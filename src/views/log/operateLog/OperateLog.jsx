import React from "react";
import { Button, Col, Form, Input, Row, Select } from "antd";
import StandardTable from "../../../components/StandardTable";
import OperateLogDetail from "./OperateLogDetail";
import axios from "../../../api/index";
import { api } from "../../../actions/system/api";
import moment from "moment";

// 操作日志列表
export default class OperateLogList extends React.Component {
	searchFormRef = React.createRef();

	constructor(prors) {
		super(prors);

		this.state = {
			userSelectData: []
		};
	}

	componentDidMount() {
		this.loadUserSelectData();
	}

	/**异步加载用户列表数据 */
	loadUserSelectData = async () => {
		try {
			const res = await axios.get(api.user.list);
			if (res.success) {
				this.setState({
					userSelectData: this.mapUserSelectData(res.data)
				});
			}
		} catch (err) {
			console.log("查询用户列表异常", err);
		}
	};

	/**字段映射 */
	mapUserSelectData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			label: node.nickName
		}));
	};

	// ============ 查询表单 ===============
	renderSearchForm = onSearchFormReset => {
		return (
			<Row gutter={{ md: 8, lg: 24, xl: 48 }}>
				<Col md={4} sm={24}>
					<Form.Item label="用户" name="userId">
						<Select
							placeholder="请选择用户"
							options={this.state.userSelectData}
							allowClear
							showSearch
							filterOption={(input, option) => (option?.label ?? "").includes(input)}
						/>
					</Form.Item>
				</Col>
				<Col md={4} sm={24}>
					<Form.Item label="IP" name="ip">
						{<Input placeholder="请输入IP" />}
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
				{/*查看详情弹框*/}
				<OperateLogDetail modalVisible={detailModalVisible} record={record} handleCancel={hideDetailModal} />
			</>
		);
	};

	render() {
		const tableColumnAlign = "left";
		const columns = [
			{
				title: "用户",
				dataIndex: "userNickName",
				align: tableColumnAlign,
				width: 300
			},
			{
				title: "操作内容",
				dataIndex: "content",
				align: tableColumnAlign,
				width: 300
			},
			{
				title: "IP",
				dataIndex: "ip",
				align: tableColumnAlign,
				width: 300
			}
		];

		return (
			<>
				<StandardTable
					code={"log.operateLog"}
					searchFormRef={this.searchFormRef}
					columns={columns}
					renderSearchForm={this.renderSearchForm}
					renderModal={this.renderModal}
					apiDelete={api.operateLog.delete}
					apiPage={api.operateLog.page}
					apiDetail={api.operateLog.detail}
				></StandardTable>
			</>
		);
	}
}
