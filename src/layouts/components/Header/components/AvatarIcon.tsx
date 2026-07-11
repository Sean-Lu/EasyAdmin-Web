import { useRef } from "react";
import { Modal, Dropdown, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import PasswordModal from "./PasswordModal";
import InfoModal from "./InfoModal";
import { logoutApi } from "@/api/modules/login";
import { clearLockRuntime } from "@/utils/lockStorage";
import { lockScreen, resetLockRuntime } from "@/redux/modules/lock/action";
import { useTranslation } from "react-i18next";
import { broadcastLogout } from "@/utils/sessionSync";
import useUserAvatar from "@/hooks/useUserAvatar";
import { buildAvatarMenuItems } from "./avatarMenuItems";
import UserAvatar from "@/components/UserAvatar";
import { setLockAvatar } from "@/utils/lockAvatar";

const AvatarIcon = (props: any) => {
	const { setToken, setTabsList, userInfo, onUserInfoChange, lockScreen, resetLockRuntime } = props;
	const navigate = useNavigate();
	const avatarSrc = useUserAvatar(userInfo?.avatarFileId);
	const { t } = useTranslation();

	interface ModalProps {
		showModal: (params: { name: number }) => void;
	}
	const passRef = useRef<ModalProps>(null);
	const infoRef = useRef<ModalProps>(null);

	// 退出登录
	const logout = () => {
		Modal.confirm({
			title: "温馨提示 🧡",
			icon: <ExclamationCircleOutlined />,
			content: "是否确认退出登录？",
			okText: "确认",
			cancelText: "取消",
			onOk: async () => {
				try {
					await logoutApi();
				} catch {
					// 即使服务端登出失败，也清除本地状态
				}
				setToken("");
				setTabsList([]);
				resetLockRuntime();
				onUserInfoChange(undefined);
				localStorage.removeItem("Token");
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				clearLockRuntime();
				broadcastLogout();
				message.success("退出登录成功！");
				navigate("/login");
			}
		});
	};

	// Dropdown Menu
	const menuItems = buildAvatarMenuItems({
		t,
		goHome: () => navigate(HOME_URL),
		showProfile: () => infoRef.current!.showModal({ name: 11 }),
		showPassword: () => passRef.current!.showModal({ name: 11 }),
		lock: () => {
			setLockAvatar(avatarSrc);
			lockScreen(Date.now());
		},
		logout
	});
	return (
		<>
			<Dropdown menu={{ items: menuItems }} placement="bottom" arrow trigger={["click"]}>
				<UserAvatar size="large" src={avatarSrc}>
					{userInfo?.nickName?.slice(0, 1) || userInfo?.userName?.slice(0, 1)}
				</UserAvatar>
			</Dropdown>
			<InfoModal innerRef={infoRef} onUserInfoChange={onUserInfoChange}></InfoModal>
			<PasswordModal innerRef={passRef}></PasswordModal>
		</>
	);
};

const mapDispatchToProps = { setToken, setTabsList, lockScreen, resetLockRuntime };
export default connect(null, mapDispatchToProps)(AvatarIcon);
