import { useEffect, useRef, useState } from "react";
import { Avatar, Modal, MenuProps, Dropdown, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import PasswordModal from "./PasswordModal";
import InfoModal from "./InfoModal";
import avatar from "@/assets/images/avatar.png";
import { getAvatarObjectUrl, logoutApi } from "@/api/modules/login";

const AvatarIcon = (props: any) => {
	const { setToken, setTabsList, userInfo, onUserInfoChange } = props;
	const navigate = useNavigate();
	const [avatarSrc, setAvatarSrc] = useState("");

	interface ModalProps {
		showModal: (params: { name: number }) => void;
	}
	const passRef = useRef<ModalProps>(null);
	const infoRef = useRef<ModalProps>(null);

	useEffect(() => {
		let objectUrl = "";
		let disposed = false;

		const loadAvatar = async () => {
			try {
				const nextAvatarSrc = await getAvatarObjectUrl(userInfo?.avatarFileId);
				if (disposed) {
					if (nextAvatarSrc.startsWith("blob:")) URL.revokeObjectURL(nextAvatarSrc);
					return;
				}
				objectUrl = nextAvatarSrc.startsWith("blob:") ? nextAvatarSrc : "";
				setAvatarSrc(nextAvatarSrc);
			} catch {
				setAvatarSrc("");
			}
		};

		loadAvatar();
		return () => {
			disposed = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [userInfo?.avatarFileId]);

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
				onUserInfoChange(undefined);
				localStorage.removeItem("refreshToken");
				message.success("退出登录成功！");
				navigate("/login");
			}
		});
	};

	// Dropdown Menu
	const menuItems: MenuProps["items"] = [
		{
			key: "1",
			label: <span className="dropdown-item">首页</span>,
			onClick: () => navigate(HOME_URL)
		},
		{
			key: "2",
			label: <span className="dropdown-item">个人信息</span>,
			onClick: () => infoRef.current!.showModal({ name: 11 })
		},
		{
			key: "3",
			label: <span className="dropdown-item">修改密码</span>,
			onClick: () => passRef.current!.showModal({ name: 11 })
		},
		{
			type: "divider"
		},
		{
			key: "4",
			label: <span className="dropdown-item">退出登录</span>,
			onClick: logout
		}
	];
	return (
		<>
			<Dropdown menu={{ items: menuItems }} placement="bottom" arrow trigger={["click"]}>
				<Avatar size="large" src={avatarSrc || avatar}>
					{userInfo?.nickName?.slice(0, 1) || userInfo?.userName?.slice(0, 1)}
				</Avatar>
			</Dropdown>
			<InfoModal innerRef={infoRef} onUserInfoChange={onUserInfoChange}></InfoModal>
			<PasswordModal innerRef={passRef}></PasswordModal>
		</>
	);
};

const mapDispatchToProps = { setToken, setTabsList };
export default connect(null, mapDispatchToProps)(AvatarIcon);
