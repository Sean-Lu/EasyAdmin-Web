import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Select, Spin, Switch, TreeSelect } from "antd";

import axios from "../../../api/index";
import { api } from "../../../actions/system/api";
import { getMenuTypeOptions, getOutLinkOpenTypeOptions, MenuType, OutLinkOpenType } from "../../../enums/menu";
import FormIconPicker from "../../../components/IconPicker/FormIconPicker";

const routeKeyPattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const externalRoutePrefix = "/link/";

const mapDirectoryTreeData = nodes =>
	nodes
		.filter(node => node.type === MenuType.Directory)
		.map(node => ({
			key: node.id,
			value: node.id,
			title: node.title,
			children: node.children ? mapDirectoryTreeData(node.children) : undefined
		}));

const MenuFormModal = ({ modalVisible, onCancel, onFinish, record, title }) => {
	const [form] = Form.useForm();
	const [menuTreeData, setMenuTreeData] = useState([]);
	const [menuTreeLoading, setMenuTreeLoading] = useState(false);
	const menuType = Form.useWatch("type", form);

	useEffect(() => {
		if (!modalVisible) return;
		form.resetFields();
		form.setFieldsValue({
			state: true,
			sort: 1,
			type: MenuType.Internal,
			...record,
			routeKey: record?.path?.startsWith(externalRoutePrefix) ? record.path.slice(externalRoutePrefix.length) : ""
		});
		setMenuTreeLoading(true);
		axios
			.get(api.menu.listTree, { all: true, includeTopMenu: true })
			.then(res => {
				if (res.success) setMenuTreeData(mapDirectoryTreeData(res.data));
			})
			.catch(() => setMenuTreeData([]))
			.finally(() => setMenuTreeLoading(false));
	}, [form, modalVisible, record]);

	const submit = values => {
		const result = { ...values };
		delete result.routeKey;
		if (values.type === MenuType.Directory) {
			result.path = null;
			result.outLink = null;
			result.outLinkOpenType = null;
		} else if (values.type === MenuType.Internal) {
			result.outLink = null;
			result.outLinkOpenType = null;
		} else {
			result.path = `${externalRoutePrefix}${values.routeKey.trim()}`;
		}
		onFinish(result);
	};

	return (
		<Modal open={modalVisible} title={title} footer={null} destroyOnHidden onCancel={onCancel}>
			<Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal" onFinish={submit}>
				<Form.Item name="pId" label="上级菜单" rules={[{ required: true, message: "请选择上级菜单" }]}>
					{menuTreeLoading ? (
						<Spin description="加载菜单数据..." />
					) : (
						<TreeSelect
							placeholder="请选择上级目录"
							treeData={menuTreeData}
							showSearch
							filterTreeNode={(input, treeNode) => (treeNode?.title ?? "").includes(input)}
							styles={{ popup: { root: { maxHeight: 400, overflow: "auto" } } }}
						/>
					)}
				</Form.Item>
				<Form.Item name="type" label="菜单类型" rules={[{ required: true, message: "请选择菜单类型" }]}>
					<Select options={getMenuTypeOptions()} />
				</Form.Item>
				<Form.Item name="title" label="菜单名称" rules={[{ required: true, message: "请输入菜单名称" }]}>
					<Input placeholder="请输入菜单名称" />
				</Form.Item>
				{menuType === MenuType.Internal && (
					<Form.Item name="path" label="菜单路由" rules={[{ required: true, message: "请输入菜单路由" }]}>
						<Input placeholder="例如 /system/user" />
					</Form.Item>
				)}
				{menuType === MenuType.External && (
					<>
						<Form.Item
							name="routeKey"
							label="菜单路由"
							rules={[
								{ required: true, message: "请输入路由标识" },
								{ pattern: routeKeyPattern, message: "仅支持字母、数字、短横线和下划线，且需以字母或数字开头" }
							]}
						>
							<Input addonBefore={externalRoutePrefix} placeholder="例如 GitHub" />
						</Form.Item>
						<Form.Item name="outLink" label="外部链接" rules={[{ required: true, type: "url", message: "请输入有效的外部链接" }]}>
							<Input placeholder="例如 https://github.com" />
						</Form.Item>
						<Form.Item
							name="outLinkOpenType"
							label="打开方式"
							initialValue={OutLinkOpenType.Inline}
							rules={[{ required: true, message: "请选择打开方式" }]}
						>
							<Select options={getOutLinkOpenTypeOptions()} />
						</Form.Item>
					</>
				)}
				<Form.Item name="icon" label="图标">
					<FormIconPicker placeholder="请选择图标" />
				</Form.Item>
				<Form.Item name="sort" label="排序">
					<InputNumber min={1} />
				</Form.Item>
				<Form.Item name="state" label="状态" valuePropName="checked">
					<Switch checkedChildren="启用" unCheckedChildren="禁用" />
				</Form.Item>
				<Form.Item style={{ margin: "20px 0 0 120px" }}>
					<Button onClick={onCancel}>取消</Button>
					<Button type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
						确定
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default MenuFormModal;
