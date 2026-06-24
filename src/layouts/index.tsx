import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button, Layout, Tooltip } from "antd";
import { FullscreenExitOutlined } from "@ant-design/icons";
import { setAuthButtons } from "@/redux/modules/auth/action";
import { updateCollapse } from "@/redux/modules/menu/action";
import { getAuthorButtons } from "@/api/modules/login";
import { connect } from "react-redux";
import LayoutMenu from "./components/Menu";
import LayoutHeader from "./components/Header";
import LayoutTabs from "./components/Tabs";
import LayoutFooter from "./components/Footer";
import "./index.less";

const LayoutIndex = (props: any) => {
	const { Sider, Content } = Layout;
	const { isCollapse, updateCollapse, setAuthButtons, tabsList } = props;
	const { pathname } = useLocation();
	const [menuFullscreen, setMenuFullscreen] = useState(false);
	const [showFullscreenTip, setShowFullscreenTip] = useState(false);
	const [showFullscreenExit, setShowFullscreenExit] = useState(false);
	const [contentRefreshKey, setContentRefreshKey] = useState(0);

	// 获取按钮权限列表
	const getAuthButtonsList = async () => {
		const { data } = await getAuthorButtons();
		setAuthButtons(data);
	};

	// 监听窗口大小变化
	const listeningWindow = () => {
		window.onresize = () => {
			return (() => {
				let screenWidth = document.body.clientWidth;
				if (!isCollapse && screenWidth < 1200) updateCollapse(true);
				if (!isCollapse && screenWidth > 1200) updateCollapse(false);
			})();
		};
	};

	// 刷新当前菜单
	const refreshCurrentMenu = () => {
		setContentRefreshKey(Date.now());
	};

	useEffect(() => {
		listeningWindow();
		getAuthButtonsList();
	}, []);

	useEffect(() => {
		setMenuFullscreen(false);
	}, [pathname]);

	useEffect(() => {
		if (!menuFullscreen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuFullscreen(false);
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [menuFullscreen]);

	useEffect(() => {
		if (!menuFullscreen) {
			setShowFullscreenTip(false);
			setShowFullscreenExit(false);
			return;
		}

		setShowFullscreenTip(true);
		const timer = window.setTimeout(() => setShowFullscreenTip(false), 3000);
		return () => window.clearTimeout(timer);
	}, [menuFullscreen]);

	return (
		// 这里不用 Layout 组件原因是切换页面时样式会先错乱然后在正常显示，造成页面闪屏效果
		<section className={`container ${menuFullscreen ? "menu-fullscreen" : ""}`}>
			{!menuFullscreen && (
				<Sider trigger={null} collapsed={props.isCollapse} width={220} theme="dark">
					<LayoutMenu></LayoutMenu>
				</Sider>
			)}
			<Layout>
				{!menuFullscreen && <LayoutHeader></LayoutHeader>}
				{!menuFullscreen && (
					<LayoutTabs
						menuFullscreen={menuFullscreen}
						onMenuFullscreenChange={setMenuFullscreen}
						onRefreshCurrentMenu={refreshCurrentMenu}
					></LayoutTabs>
				)}
				<Content>
					{menuFullscreen && (
						<>
							{showFullscreenTip && <div className="menu-fullscreen-tip">已进入当前菜单全屏，按 Esc 或移到右上角退出</div>}
							<div
								className="menu-fullscreen-exit-zone"
								onMouseEnter={() => setShowFullscreenExit(true)}
								onMouseLeave={() => setShowFullscreenExit(false)}
							>
								<Tooltip title="退出全屏" placement="left">
									<Button
										className={`menu-fullscreen-exit ${showFullscreenExit ? "menu-fullscreen-exit-show" : ""}`}
										type="primary"
										shape="circle"
										size="small"
										icon={<FullscreenExitOutlined />}
										aria-label="退出全屏"
										onClick={() => setMenuFullscreen(false)}
									/>
								</Tooltip>
							</div>
						</>
					)}
					<Outlet key={`${pathname}-${contentRefreshKey}`} />
				</Content>
				{!menuFullscreen && <LayoutFooter></LayoutFooter>}
			</Layout>
		</section>
	);
};

const mapStateToProps = (state: any) => ({ ...state.menu, global: state.global });
const mapDispatchToProps = { setAuthButtons, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex);
