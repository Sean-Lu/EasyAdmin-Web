import React from "react";
import { Button, Form, Input, InputNumber, Modal, Spin, Switch, TreeSelect, Select } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";

// 行政区划编辑弹窗
export default class RegionEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			regionTreeData: [],
			regionTreeLoading: false
		};
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.loadRegionTreeData();
		}
	}

	loadRegionTreeData = async () => {
		this.setState({ regionTreeLoading: true });
		try {
			const res = await axios.get(api.region.listTree, { all: true });
			if (res.success) {
				this.setState({
					regionTreeData: this.mapTreeData(res.data),
					regionTreeLoading: false
				});
			} else {
				this.setState({ regionTreeLoading: false });
			}
		} catch (err) {
			console.log("查询行政区划树异常", err);
			this.setState({ regionTreeLoading: false });
		}
	};

	mapTreeData = nodes => {
		return nodes.map(node => ({
			key: node.id,
			value: node.id,
			title: node.name,
			children: node.children ? this.mapTreeData(node.children) : undefined
		}));
	};

	render() {
		const { modalVisible, onCancel, onFinish, record } = this.props;
		const { regionTreeData, regionTreeLoading } = this.state;
		return (
			<Modal open={modalVisible} title="修改行政区划信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onFinish}
					initialValues={{
						...record
					}}
				>
					<Form.Item
						name="pId"
						label="上级行政区划"
						rules={[
							{
								required: false
							}
						]}
					>
						{regionTreeLoading ? (
							<Spin description="加载行政区划数据..." />
						) : (
							<TreeSelect
								placeholder="请选择上级行政区划"
								treeData={regionTreeData}
								allowClear
								showSearch
								filterTreeNode={(input, treeNode) => (treeNode?.title ?? "").includes(input)}
								styles={{ popup: { root: { maxHeight: 400, overflow: "auto" } } }}
							/>
						)}
					</Form.Item>
					<Form.Item
						name="name"
						label="行政区划名称"
						rules={[
							{
								required: true,
								message: "请输入行政区划名称"
							}
						]}
					>
						<Input placeholder="请输入行政区划名称" />
					</Form.Item>
					<Form.Item
						name="code"
						label="行政区划代码"
						rules={[
							{
								required: true,
								message: "请输入行政区划代码"
							}
						]}
					>
						<Input placeholder="请输入行政区划代码" />
					</Form.Item>
					<Form.Item
						name="level"
						label="层级"
						rules={[
							{
								required: true,
								message: "请选择层级"
							}
						]}
					>
						<Select
							options={[
								{ value: 1, label: "省" },
								{ value: 2, label: "市" },
								{ value: 3, label: "区" }
							]}
						/>
					</Form.Item>
					<Form.Item
						name="sort"
						label="排序"
						rules={[
							{
								required: false
							}
						]}
					>
						<InputNumber min={1} />
					</Form.Item>
					<Form.Item
						name="state"
						label="状态"
						valuePropName="checked"
						rules={[
							{
								required: false
							}
						]}
					>
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="cancel" onClick={onCancel}>
							取消
						</Button>
						<Button key="submit" type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
							确定
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
