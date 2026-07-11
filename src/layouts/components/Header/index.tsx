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
import type { UserInfo } from "@/api/modules/login";
import type { GlobalState } from "@/redux/interface";
import { connect } from "react-redux";
import "./index.less";

interface LayoutHeaderProps {
	layoutMode?: "side" | "top";
	userInfo?: UserInfo;
	isUserInfoLoaded: boolean;
	onUserInfoChange: (userInfo?: UserInfo) => void;
	global: GlobalState;
}

const LayoutHeader = (props: LayoutHeaderProps) => {
	const { Header } = Layout;
	const { layoutMode = "side", userInfo, isUserInfoLoaded, onUserInfoChange } = props;
	const isTopLayout = layoutMode === "top";

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
				<Theme userInfo={userInfo} />
				<Fullscreen />
				<MessageNotice />
				<span className="username">{userInfo ? userInfo.nickName : isUserInfoLoaded ? "-" : "加载中..."}</span>
				<AvatarIcon userInfo={userInfo} onUserInfoChange={onUserInfoChange} />
			</div>
		</Header>
	);
};

const mapStateToProps = (state: any) => ({ global: state.global });
export default connect(mapStateToProps)(LayoutHeader);
