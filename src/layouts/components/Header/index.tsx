import { useEffect, useState } from "react";
import { Layout } from "antd";
import AvatarIcon from "./components/AvatarIcon";
import CollapseIcon from "./components/CollapseIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import AssemblySize from "./components/AssemblySize";
import Language from "./components/Language";
import Theme from "./components/Theme";
import Fullscreen from "./components/Fullscreen";
import { getUserInfo, UserInfo } from "@/api/modules/login";
import "./index.less";

const LayoutHeader = () => {
	const { Header } = Layout;

	const [userInfo, setUserInfo] = useState<UserInfo>();

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const userInfo = await getUserInfo();
				setUserInfo(userInfo.data);
			} catch (error) {
				// console.error("获取用户信息异常", error);
			}
		};

		fetchUserInfo();
	}, []); // 空数组确保副作用仅运行一次

	return (
		<Header>
			<div className="header-lf">
				<CollapseIcon />
				<BreadcrumbNav />
			</div>
			<div className="header-ri">
				<AssemblySize />
				<Language />
				<Theme />
				<Fullscreen />
				<span className="username">{userInfo ? userInfo?.nickName : "加载中..."}</span>
				<AvatarIcon userInfo={userInfo} />
			</div>
		</Header>
	);
};

export default LayoutHeader;
