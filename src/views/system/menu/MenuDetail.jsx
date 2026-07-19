import React from "react";
import { Form, Modal } from "antd";
import * as Icons from "@ant-design/icons";
import { getMenuTypeLabel, getOutLinkOpenTypeLabel, MenuType } from "../../../enums/menu";

const renderIcon = iconName => {
	if (!iconName) return null;
	const IconComponent = Icons[iconName];
	if (!IconComponent) return null;
	return <IconComponent style={{ fontSize: 18, color: "#1890ff", marginRight: 8 }} />;
};

// 菜单详情弹窗
export default class MenuDetail extends React.Component {
	render() {
		const { modalVisible, onCancel, record } = this.props;

		return (
			<Modal open={modalVisible} title="查看菜单信息" footer={null} destroyOnHidden={true} onCancel={onCancel}>
				<Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} layout="horizontal">
					<Form.Item label="上级菜单">
						<span>{record.parentFullPath}</span>
					</Form.Item>
					<Form.Item label="菜单类型">
						<span>{getMenuTypeLabel(record.type)}</span>
					</Form.Item>
					<Form.Item label="菜单名称">
						<span>{record.title}</span>
					</Form.Item>
					{record.type !== MenuType.Directory && (
						<Form.Item label="菜单路由">
							<span>{record.path}</span>
						</Form.Item>
					)}
					{record.type === MenuType.External && (
						<>
							<Form.Item label="外部链接">
								<span>{record.outLink}</span>
							</Form.Item>
							<Form.Item label="打开方式">
								<span>{getOutLinkOpenTypeLabel(record.outLinkOpenType)}</span>
							</Form.Item>
						</>
					)}
					<Form.Item label="图标">
						<span>
							{renderIcon(record.icon)}
							{record.icon || "无"}
						</span>
					</Form.Item>
					<Form.Item label="排序">
						<span>{record.sort}</span>
					</Form.Item>
					<Form.Item label="状态">
						<span>{record.state === 1 ? "启用" : "禁用"}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
