import React from "react";
import { Button, Card, Form, Select, Space, Spin, Table, Tag, message } from "antd";
import { connect } from "react-redux";
import dayjs from "dayjs";
import axios from "../../../api/index";
import { api } from "../../../actions/system/api";
import { hasSafeIdParam, toSafeIdParam } from "../../../utils/id";
import { showMessageDetailModal } from "../../../components/MessageDetailModal";

const noticeTypeMap = {
	1: { text: "普通", color: "blue" },
	2: { text: "重要", color: "orange" },
	3: { text: "紧急", color: "red" }
};

class MessageList extends React.Component {
	searchFormRef = React.createRef();

	constructor(props) {
		super(props);
		this.state = {
			pageNumber: 1,
			pageSize: 10,
			total: 0,
			data: [],
			loading: false,
			selectedRowKeys: [],
			activeDetailId: ""
		};
	}

	componentDidMount() {
		this.handleSearch(() => {
			this.openDetailFromUrl();
		});
		window.addEventListener("hashchange", this.openDetailFromUrl);
	}

	componentWillUnmount() {
		window.removeEventListener("hashchange", this.openDetailFromUrl);
	}

	dispatchRefresh = () => {
		window.dispatchEvent(new Event("easyadmin-message-refresh"));
	};

	getUrlMessageId = () => {
		return new URLSearchParams(window.location.hash.split("?")[1] || "").get("id");
	};

	openDetailFromUrl = () => {
		const id = this.getUrlMessageId();
		const safeId = toSafeIdParam(id);
		if (!hasSafeIdParam(safeId)) {
			return;
		}
		this.showDetail(safeId);
	};

	requestApi = (method, url, params, onSuccess) => {
		this.setState({ loading: true });
		return axios[method](url, params)
			.then(res => {
				this.setState({ loading: false });
				if (res.success) {
					onSuccess && onSuccess(res);
				} else {
					message.error(res.msg || "操作失败");
				}
				return res;
			})
			.catch(err => {
				this.setState({ loading: false });
				console.log("消息请求异常", err);
			});
	};

	handleSearch = callback => {
		const fields = this.searchFormRef.current?.getFieldsValue() || {};
		this.requestApi(
			"get",
			api.userMessage.page,
			{
				pageNumber: this.state.pageNumber,
				pageSize: this.state.pageSize,
				...fields
			},
			res => {
				this.setState(
					{
						data: res.data.list || [],
						total: res.data.total || 0
					},
					callback
				);
			}
		);
	};

	handleReset = () => {
		this.searchFormRef.current.resetFields();
		this.setState({ pageNumber: 1 }, () => this.handleSearch());
	};

	onChangePage = (page, pageSize) => {
		this.setState({ pageNumber: page, pageSize }, () => this.handleSearch());
	};

	showDetail = id => {
		const safeId = toSafeIdParam(id);
		if (!safeId) {
			return;
		}
		this.setState({ activeDetailId: safeId });
		this.requestApi("get", api.userMessage.detail, { id: safeId }, res => {
			const record = res.data;
			showMessageDetailModal(
				record,
				() => {
					this.setState({ activeDetailId: "" });
					this.handleSearch();
					this.dispatchRefresh();
				},
				{ isDark: this.props.global?.themeConfig?.isDark }
			);
			this.handleSearch();
			this.dispatchRefresh();
		});
	};

	markRead = ids => {
		if (!ids || ids.length < 1) {
			message.info("请选择消息");
			return;
		}
		this.requestApi("post", api.userMessage.markRead, { ids }, () => {
			message.success("操作成功");
			this.setState({ selectedRowKeys: [] });
			this.handleSearch();
			this.dispatchRefresh();
		});
	};

	markAllRead = () => {
		this.requestApi("post", api.userMessage.markAllRead, {}, () => {
			message.success("操作成功");
			this.setState({ selectedRowKeys: [] });
			this.handleSearch();
			this.dispatchRefresh();
		});
	};

	render() {
		const columns = [
			{
				title: "标题",
				dataIndex: "title",
				width: 260
			},
			{
				title: "类型",
				dataIndex: "noticeType",
				align: "center",
				width: 100,
				render: text => {
					const type = noticeTypeMap[text] || noticeTypeMap[1];
					return <Tag color={type.color}>{type.text}</Tag>;
				}
			},
			{
				title: "发送时间",
				dataIndex: "sendTime",
				align: "center",
				width: 170,
				render: text => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "")
			},
			{
				title: "状态",
				dataIndex: "isRead",
				align: "center",
				width: 100,
				render: text => (text ? <Tag>已读</Tag> : <Tag color="red">未读</Tag>)
			},
			{
				title: "操作",
				key: "operation",
				align: "center",
				width: 140,
				render: (_, record) => (
					<Space>
						<span style={{ color: "#2378f7", cursor: "pointer" }} onClick={() => this.showDetail(record.id)}>
							查看
						</span>
						{!record.isRead && (
							<span style={{ color: "#2378f7", cursor: "pointer" }} onClick={() => this.markRead([record.id])}>
								已读
							</span>
						)}
					</Space>
				)
			}
		];

		const rowSelection = {
			selectedRowKeys: this.state.selectedRowKeys,
			onChange: selectedRowKeys => this.setState({ selectedRowKeys })
		};

		return (
			<Card>
				<Form ref={this.searchFormRef} onFinish={() => this.setState({ pageNumber: 1 }, () => this.handleSearch())}>
					<Space>
						<Form.Item label="状态" name="isRead">
							<Select
								allowClear
								placeholder="请选择状态"
								style={{ width: 160 }}
								options={[
									{ value: false, label: "未读" },
									{ value: true, label: "已读" }
								]}
							/>
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								查询
							</Button>
							<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
								重置
							</Button>
						</Form.Item>
					</Space>
				</Form>
				<Space style={{ marginBottom: 8 }}>
					<Button type="primary" onClick={() => this.markRead(this.state.selectedRowKeys)}>
						标记已读
					</Button>
					<Button onClick={this.markAllRead}>全部已读</Button>
				</Space>
				<Spin spinning={this.state.loading}>
					<Table
						rowKey={record => record.id}
						rowSelection={rowSelection}
						columns={columns}
						dataSource={this.state.data}
						pagination={{
							current: this.state.pageNumber,
							pageSize: this.state.pageSize,
							total: this.state.total,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: total => `共 ${total} 条`,
							onChange: this.onChangePage
						}}
						bordered
					/>
				</Spin>
			</Card>
		);
	}
}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(MessageList);
