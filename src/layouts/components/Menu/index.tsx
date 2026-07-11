import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Spin } from "antd";
import { findAllBreadcrumb, getOpenKeys, handleRouter, searchRoute } from "@/utils/util";
import { setMenuList } from "@/redux/modules/menu/action";
import { setBreadcrumbList } from "@/redux/modules/breadcrumb/action";
import { setAuthRouter } from "@/redux/modules/auth/action";
import { getMenuList } from "@/api/modules/login";
import { connect } from "react-redux";
import type { MenuProps } from "antd";
import * as Icons from "@ant-design/icons";
import { MoreOutlined } from "@ant-design/icons";
import Logo from "./components/Logo";
import "./index.less";
import { createProtectedLoader } from "../../lockLoadGuard";

const LayoutMenu = (props: any) => {
	const { pathname } = useLocation();
	const { isCollapse, setBreadcrumbList, setAuthRouter, setMenuList: setMenuListAction } = props;
	const { className = "", mode = "inline", theme = "dark", showLogo = true, forceLogoExpanded = false } = props;
	const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);
	const isHorizontal = mode === "horizontal";
	const horizontalMenuStyle: React.CSSProperties | undefined = isHorizontal
		? { flex: "1 1 0", width: 0, minWidth: 0, height: 55, lineHeight: "55px" }
		: undefined;

	// 刷新页面菜单保持高亮
	useEffect(() => {
		setSelectedKeys([pathname]);
		isCollapse || mode === "horizontal" ? setOpenKeys([]) : setOpenKeys(getOpenKeys(pathname));
	}, [pathname, isCollapse, mode]);

	// 设置当前展开的 subMenu
	const onOpenChange = (openKeys: string[]) => {
		if (openKeys.length === 0 || openKeys.length === 1) return setOpenKeys(openKeys);
		const latestOpenKey = openKeys[openKeys.length - 1];
		if (latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
		setOpenKeys([latestOpenKey]);
	};

	// 定义 menu 类型
	type MenuItem = Required<MenuProps>["items"][number];
	const getItem = (
		label: React.ReactNode,
		key?: React.Key | null,
		icon?: React.ReactNode,
		children?: MenuItem[],
		type?: "group"
	): MenuItem => {
		return {
			key,
			icon,
			children,
			label,
			type
		} as MenuItem;
	};

	// 动态渲染 Icon 图标
	const customIcons: { [key: string]: any } = Icons;
	const addIcon = (name?: string) => {
		if (!name) return undefined;
		return customIcons[name] ? React.createElement(customIcons[name]) : undefined;
	};

	// 处理后台返回菜单 key 值为 antd 菜单需要的 key 值
	const deepLoopFloat = (menuList: Menu.MenuOptions[], newArr: MenuItem[] = []) => {
		menuList.forEach((item: Menu.MenuOptions) => {
			// 下面判断代码解释 *** !item?.children?.length   ==>   (!item.children || item.children.length === 0)
			if (!item?.children?.length) return newArr.push(getItem(item.title, item.path, addIcon(item.icon!)));
			newArr.push(getItem(item.title, item.path, addIcon(item.icon!), deepLoopFloat(item.children)));
		});
		return newArr;
	};

	// 获取菜单列表并处理成 antd menu 需要的格式
	const [menuList, setMenuList] = useState<MenuItem[]>([]);
	const [loading, setLoading] = useState(false);
	const menuLoader = React.useRef(createProtectedLoader()).current;
	const getMenuData = async () => {
		setLoading(true);
		try {
			const { data } = await getMenuList();
			if (!data) return;
			setMenuList(deepLoopFloat(data));
			// 存储处理过后的所有面包屑导航栏到 redux 中
			setBreadcrumbList(findAllBreadcrumb(data));
			// 把路由菜单处理成一维数组，存储到 redux 中，做菜单权限判断
			const dynamicRouter = handleRouter(data);
			setAuthRouter(dynamicRouter);
			setMenuListAction(data);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		menuLoader.run(Boolean(props.lock?.locked), getMenuData);
	}, [props.lock?.locked, menuLoader]);

	// 点击当前菜单跳转页面
	const navigate = useNavigate();
	const clickMenu: MenuProps["onClick"] = ({ key }: { key: string }) => {
		const route = searchRoute(key, props.menuList);
		if (route.outLink) {
			if (route.outLinkOpenType === 1) {
				window.open(route.outLink, "_blank");
				return;
			}
		}
		navigate(key);
	};

	return (
		<div className={`menu ${className}`}>
			<Spin spinning={loading} description="Loading...">
				{showLogo && <Logo forceExpanded={forceLogoExpanded}></Logo>}
				<Menu
					className={isHorizontal ? "top-menu-horizontal" : undefined}
					style={horizontalMenuStyle}
					theme={theme}
					mode={mode}
					triggerSubMenuAction={isHorizontal ? "hover" : "click"}
					overflowedIndicator={
						isHorizontal ? (
							<span className="top-menu-more">
								<MoreOutlined />
								<span>更多</span>
							</span>
						) : undefined
					}
					openKeys={isHorizontal ? undefined : openKeys}
					selectedKeys={selectedKeys}
					items={menuList}
					onClick={clickMenu}
					onOpenChange={onOpenChange}
				></Menu>
			</Spin>
		</div>
	);
};

const mapStateToProps = (state: any) => ({ ...state.menu, lock: state.lock });
const mapDispatchToProps = { setMenuList, setBreadcrumbList, setAuthRouter };
export default connect<any, any, any>(mapStateToProps, mapDispatchToProps)(LayoutMenu);
