import { useEffect, useState } from "react";
import { Layout } from "antd";
import AvatarIcon from "./components/AvatarIcon";
import CollapseIcon from "./components/CollapseIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import MenuSearch from "./components/MenuSearch";
import LayoutMenu from "../Menu";
import AssemblySize from "./components/AssemblySize";
import Language from "./components/Language";
import Theme from "./components/Theme";
import Fullscreen from "./components/Fullscreen";
import MessageNotice from "./components/MessageNotice";
import { getUserInfo, UserInfo } from "@/api/modules/login";
import { connect } from "react-redux";
import "./index.less";

const LayoutHeader = (props: any) => {
	const { Header } = Layout;
	const { layoutMode = "side" } = props;
	const isTopLayout = layoutMode === "top";

	const [userInfo, setUserInfo] = useState<UserInfo>();

	const fetchUserInfo = async () => {
		try {
			const userInfo = await getUserInfo();
			setUserInfo(userInfo.data);
		} catch (error) {
			// console.error("获取用户信息异常", error);
		}
	};

	useEffect(() => {
		fetchUserInfo();
	}, []); // 空数组确保副作用仅运行一次

	return (
		<Header className={isTopLayout ? "layout-header-top" : ""}>
			<div className="header-lf">
				{isTopLayout ? (
					<LayoutMenu
						className="top-layout-menu"
						mode="horizontal"
						showLogo
						forceLogoExpanded
						theme={props.global?.themeConfig?.isDark ? "dark" : "light"}
					/>
				) : (
					<>
						<CollapseIcon />
						<MenuSearch />
						<BreadcrumbNav />
					</>
				)}
			</div>
			<div className="header-ri">
				{isTopLayout && <MenuSearch />}
				<AssemblySize />
				<Language />
				<Theme />
				<Fullscreen />
				<MessageNotice />
				<span className="username">{userInfo ? userInfo.nickName : "加载中..."}</span>
				<AvatarIcon userInfo={userInfo} onUserInfoChange={setUserInfo} />
			</div>
		</Header>
	);
};

const mapStateToProps = (state: any) => ({ global: state.global });
export default connect(mapStateToProps)(LayoutHeader);
