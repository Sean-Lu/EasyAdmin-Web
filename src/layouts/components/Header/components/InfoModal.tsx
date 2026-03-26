import { useState, useImperativeHandle, Ref } from "react";
import { Modal, message } from "antd";
import { UserInfo } from "@/api/modules/login";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void } | undefined>;
	userInfo: UserInfo;
}

const InfoModal = (props: Props) => {
	const [modalVisible, setModalVisible] = useState(false);

	useImperativeHandle(props.innerRef, () => ({
		showModal
	}));

	const showModal = (params: { name: number }) => {
		setModalVisible(true);
	};

	const handleOk = () => {
		setModalVisible(false);
		// message.success("修改用户信息成功 🎉🎉🎉");
	};

	const handleCancel = () => {
		setModalVisible(false);
	};

	const userRoleEnumMap: { [key: number]: string } = {
		0: "未知",
		1: "普通用户",
		2: "管理员",
		3: "超级管理员"
	};

	return (
		<Modal title="个人信息" open={modalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}>
			<p>昵称：{props.userInfo?.nickName}</p>
			<p>手机号码：{props.userInfo?.phoneNumber}</p>
			<p>邮箱：{props.userInfo?.email}</p>
			<p>角色：{userRoleEnumMap[props.userInfo?.userRole || 0]}</p>
			<p>部门：{props.userInfo?.departmentName}</p>
			<p>岗位：{props.userInfo?.positionName}</p>
		</Modal>
	);
};
export default InfoModal;
