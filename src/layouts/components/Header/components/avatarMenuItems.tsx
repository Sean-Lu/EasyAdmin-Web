import { HomeOutlined, LockOutlined, LogoutOutlined, ProfileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";

interface AvatarMenuDependencies {
	t: (key: string) => string;
	goHome: () => void;
	showProfile: () => void;
	showPassword: () => void;
	lock: () => void;
	logout: () => void;
}

export const buildAvatarMenuItems = (dependencies: AvatarMenuDependencies): MenuProps["items"] => [
	{
		key: "1",
		icon: <HomeOutlined />,
		label: <span className="dropdown-item">首页</span>,
		onClick: dependencies.goHome
	},
	{
		key: "2",
		icon: <ProfileOutlined />,
		label: <span className="dropdown-item">个人信息</span>,
		onClick: dependencies.showProfile
	},
	{
		key: "3",
		icon: <SafetyCertificateOutlined />,
		label: <span className="dropdown-item">修改密码</span>,
		onClick: dependencies.showPassword
	},
	{
		key: "lock",
		icon: <LockOutlined />,
		label: <span className="dropdown-item">{dependencies.t("lockScreen.lock")}</span>,
		onClick: dependencies.lock
	},
	{
		type: "divider"
	},
	{
		key: "4",
		icon: <LogoutOutlined />,
		label: <span className="dropdown-item">退出登录</span>,
		onClick: dependencies.logout
	}
];
