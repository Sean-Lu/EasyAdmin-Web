import { useState, useImperativeHandle, Ref } from "react";
import { Modal, Spin, message } from "antd";
import { getUserInfo, UserInfo } from "@/api/modules/login";
import { ThemeConfigProp } from "@/redux/interface";
import { connect } from "react-redux";
import "./InfoModal.less";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void } | undefined>;
	themeConfig?: ThemeConfigProp;
}

const InfoModal = (props: Props) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [modalUserInfo, setModalUserInfo] = useState<UserInfo>();
	const userInfo = modalUserInfo;
	const infoItems = [
		{ label: "昵称", value: userInfo?.nickName },
		{ label: "手机号码", value: userInfo?.phoneNumber },
		{ label: "邮箱", value: userInfo?.email },
		{ label: "部门", value: userInfo?.departmentName },
		{ label: "岗位", value: userInfo?.positionName }
	];
	const avatarText = userInfo?.nickName?.slice(0, 1) || userInfo?.userName?.slice(0, 1) || "-";

	useImperativeHandle(props.innerRef, () => ({
		showModal
	}));

	const showModal = async (params: { name: number }) => {
		setModalVisible(true);
		setModalUserInfo(undefined);
		setLoading(true);
		try {
			const res = await getUserInfo();
			setModalUserInfo(res.data);
		} catch (error) {
			message.error("获取个人信息失败");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setModalVisible(false);
	};

	return (
		<Modal
			title="个人信息"
			open={modalVisible}
			onCancel={handleCancel}
			destroyOnHidden={true}
			footer={null}
			width={560}
			className={`user-info-modal${props.themeConfig?.isDark ? " user-info-modal-dark" : ""}`}
		>
			<Spin spinning={loading}>
				<div className="user-info-profile">
					<div className="user-info-avatar">{avatarText}</div>
					<div className="user-info-main">
						<div className="user-info-name">{userInfo?.nickName || userInfo?.userName || "-"}</div>
						<div className="user-info-subtitle">
							{userInfo?.departmentName || "-"} · {userInfo?.positionName || "-"}
						</div>
					</div>
				</div>
				<div className="user-info-list">
					{infoItems.map(item => (
						<div className="user-info-item" key={item.label}>
							<span className="user-info-label">{item.label}</span>
							<span className="user-info-value">{item.value || "-"}</span>
						</div>
					))}
				</div>
			</Spin>
		</Modal>
	);
};

const mapStateToProps = (state: any) => state.global;
export default connect(mapStateToProps)(InfoModal);
