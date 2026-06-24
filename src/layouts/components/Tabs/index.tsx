import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Dropdown, MenuProps } from "antd";
import {
	ArrowLeftOutlined,
	ArrowRightOutlined,
	CloseCircleOutlined,
	CloseOutlined,
	DeleteOutlined,
	FullscreenExitOutlined,
	FullscreenOutlined,
	ReloadOutlined,
	SelectOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { setTabsList } from "@/redux/modules/tabs/action";
import { routerArray } from "@/routers";
import { searchRoute } from "@/utils/util";
import * as Icons from "@ant-design/icons";
import "./index.less";

interface LayoutTabsOwnProps {
	menuFullscreen?: boolean;
	onMenuFullscreenChange?: (menuFullscreen: boolean) => void;
	onRefreshCurrentMenu?: () => void;
}

const renderIcon = (iconName?: string) => {
	if (!iconName) return null;
	const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
	if (!IconComponent) return null;
	return <IconComponent className="tabs-tab-icon" />;
};

const LayoutTabs = (props: any & LayoutTabsOwnProps) => {
	const { t } = useTranslation();
	const { tabsList } = props.tabs;
	const { themeConfig } = props.global;
	const { setTabsList } = props;
	const { pathname, search } = useLocation();
	const navigate = useNavigate();
	const tabsContentRef = useRef<HTMLDivElement>(null);
	const [activeValue, setActiveValue] = useState<string>(pathname);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!isDeleting) {
			addTabs();
		}
		setIsDeleting(false);
	}, [pathname, search]);

	useLayoutEffect(() => {
		scrollActiveTabIntoView();
	}, [pathname, tabsList]);

	// find menu by path
	const findMenuByPath = (menus: Menu.MenuOptions[], targetPath: string): Menu.MenuOptions | undefined => {
		for (const menu of menus) {
			if (menu.path === targetPath) return menu;
			if (menu.children) {
				const found = findMenuByPath(menu.children, targetPath);
				if (found) return found;
			}
		}
		return undefined;
	};

	// click tabs
	const clickTabs = (item: Menu.MenuOptions) => {
		navigate(item.fullPath ?? item.path);
	};

	const toggleMenuFullscreen = () => {
		props.onMenuFullscreenChange?.(!props.menuFullscreen);
	};

	const ensureActiveTabVisible = (nextTabsList: Menu.MenuOptions[], fallbackTab?: Menu.MenuOptions) => {
		const activeTab = nextTabsList.find((item: Menu.MenuOptions) => item.path === pathname);
		if (activeTab) return;

		if (fallbackTab && nextTabsList.some((item: Menu.MenuOptions) => item.path === fallbackTab.path)) {
			navigate(fallbackTab.fullPath ?? fallbackTab.path);
			return;
		}

		const nextTab = nextTabsList[nextTabsList.length - 1];
		navigate(nextTab ? nextTab.fullPath ?? nextTab.path : "/empty");
	};

	const refreshTab = (tab: Menu.MenuOptions) => {
		if (pathname !== tab.path || pathname + search !== tab.fullPath) {
			navigate(tab.fullPath ?? tab.path);
		}
		props.onRefreshCurrentMenu?.();
	};

	const closeMultipleTab = (tab?: Menu.MenuOptions) => {
		if (tab) {
			const handleTabsList = [tab];
			setTabsList(handleTabsList);
			ensureActiveTabVisible(handleTabsList, tab);
			return;
		}

		setTabsList([]);
		navigate("/empty");
	};

	const closeLeftTabs = (tab: Menu.MenuOptions) => {
		const currentIndex = tabsList.findIndex((item: Menu.MenuOptions) => item.path === tab.path);
		const handleTabsList = tabsList.filter((_item: Menu.MenuOptions, index: number) => index >= currentIndex);
		setTabsList(handleTabsList);
		ensureActiveTabVisible(handleTabsList, tab);
	};

	const closeRightTabs = (tab: Menu.MenuOptions) => {
		const currentIndex = tabsList.findIndex((item: Menu.MenuOptions) => item.path === tab.path);
		const handleTabsList = tabsList.filter((_item: Menu.MenuOptions, index: number) => index <= currentIndex);
		setTabsList(handleTabsList);
		ensureActiveTabVisible(handleTabsList, tab);
	};

	const getTabContextMenuItems = (tab: Menu.MenuOptions): MenuProps["items"] => [
		{
			key: "refresh",
			icon: <ReloadOutlined />,
			label: <span>{t("tabs.refreshCurrent")}</span>,
			onClick: () => refreshTab(tab)
		},
		{
			key: "fullscreen",
			icon: props.menuFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />,
			label: <span>{props.menuFullscreen ? t("tabs.exitMenuFullscreen") : t("tabs.menuFullscreen")}</span>,
			onClick: toggleMenuFullscreen
		},
		{
			type: "divider"
		},
		{
			key: "closeCurrent",
			icon: <CloseCircleOutlined />,
			label: <span>{t("tabs.closeCurrent")}</span>,
			onClick: () => delTabs(tab.path)
		},
		{
			key: "closeLeft",
			icon: <ArrowLeftOutlined />,
			label: <span>{t("tabs.closeLeft")}</span>,
			onClick: () => closeLeftTabs(tab)
		},
		{
			key: "closeRight",
			icon: <ArrowRightOutlined />,
			label: <span>{t("tabs.closeRight")}</span>,
			onClick: () => closeRightTabs(tab)
		},
		{
			key: "closeOther",
			icon: <SelectOutlined />,
			label: <span>{t("tabs.closeOther")}</span>,
			onClick: () => closeMultipleTab(tab)
		},
		{
			key: "closeAll",
			icon: <DeleteOutlined />,
			label: <span>{t("tabs.closeAll")}</span>,
			onClick: () => closeMultipleTab()
		}
	];

	// add tabs
	const addTabs = () => {
		if (pathname === "/empty") return;
		const route = searchRoute(pathname, routerArray);
		const menuData = props.menu.menuList;
		const menuItem = findMenuByPath(menuData, pathname);

		let icon = route.meta?.icon;
		let title = route.meta?.title;

		if (menuItem) {
			if (!icon) icon = menuItem.icon;
			if (menuItem.title) title = menuItem.title;
		} else if (!icon && menuData.length > 0) {
			const findIcon = (menus: Menu.MenuOptions[]): string | undefined => {
				for (const menu of menus) {
					if (menu.path === pathname) return menu.icon;
					if (menu.children) {
						const found = findIcon(menu.children);
						if (found) return found;
					}
				}
				return undefined;
			};
			icon = findIcon(menuData);
		}

		if (!title) return;

		const fullPath = pathname + search;
		let newTabsList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(tabsList));
		const existingIndex = newTabsList.findIndex((item: Menu.MenuOptions) => item.path === pathname);
		if (existingIndex === -1) {
			newTabsList.push({ title, path: pathname, icon, fullPath });
		} else {
			// Tab 已存在，更新 fullPath 以记住最新 query 参数
			newTabsList[existingIndex] = { ...newTabsList[existingIndex], fullPath };
		}
		setTabsList(newTabsList);
		setActiveValue(pathname);
	};

	// delete tabs
	const delTabs = (tabPath?: string) => {
		if (pathname === tabPath && tabsList.length > 1) {
			tabsList.forEach((item: Menu.MenuOptions, index: number) => {
				if (item.path !== pathname) return;
				const nextTab = tabsList[index + 1] || tabsList[index - 1];
				if (nextTab) {
					setIsDeleting(true);
					navigate(nextTab.fullPath ?? nextTab.path);
				}
			});
		} else if (pathname === tabPath && tabsList.length === 1) {
			setIsDeleting(true);
			navigate("/empty");
		}
		setTabsList(tabsList.filter((item: Menu.MenuOptions) => item.path !== tabPath));
	};

	// drag tabs to reorder
	const handleDragEnd = (fromIndex: number, toIndex: number) => {
		const newTabsList = [...tabsList];
		const [removed] = newTabsList.splice(fromIndex, 1);
		newTabsList.splice(toIndex, 0, removed);
		setTabsList(newTabsList);
	};

	const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		const tabsContent = tabsContentRef.current;
		if (e.ctrlKey || !tabsContent || tabsContent.scrollWidth <= tabsContent.clientWidth) return;

		e.preventDefault();
		tabsContent.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
	};

	// scroll active tab into view
	const scrollActiveTabIntoView = () => {
		const tabsContent = tabsContentRef.current;
		const activeTab = tabsContent?.querySelector<HTMLDivElement>(".tabs-tab-active");
		if (!tabsContent || !activeTab) return;

		const visibleLeft = tabsContent.scrollLeft;
		const visibleRight = visibleLeft + tabsContent.clientWidth;
		const tabLeft = activeTab.offsetLeft;
		const tabRight = tabLeft + activeTab.offsetWidth;

		if (tabLeft < visibleLeft) {
			tabsContent.scrollTo({ left: tabLeft, behavior: "smooth" });
			return;
		}

		if (tabRight > visibleRight) {
			tabsContent.scrollTo({ left: tabRight - tabsContent.clientWidth, behavior: "smooth" });
		}
	};

	return (
		<>
			{!themeConfig.tabs && tabsList.length > 0 && (
				<div className="tabs">
					<div className="tabs-content" ref={tabsContentRef} onWheel={handleTabsWheel}>
						{tabsList.map((item: Menu.MenuOptions, index: number) => (
							<Dropdown key={item.path} menu={{ items: getTabContextMenuItems(item) }} trigger={["contextMenu"]}>
								<div
									className={`tabs-tab ${item.path === pathname ? "tabs-tab-active" : ""}`}
									onMouseDown={e => {
										if (e.button !== 0) return;
										e.preventDefault(); // 阻止默认行为，防止文本复制
										const targetTab = e.currentTarget;
										const originalIndex = index; // 保持原始索引不变
										let currentOverIndex = index;

										const handleMouseMove = (moveEvent: MouseEvent) => {
											targetTab.classList.add("tabs-tab-dragging");

											const tabs = document.querySelectorAll(".tabs-tab");
											tabs.forEach((tab, tabIndex) => {
												const rect = tab.getBoundingClientRect();
												if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
													currentOverIndex = tabIndex;
												}
											});

											if (currentOverIndex !== originalIndex) {
												handleDragEnd(originalIndex, currentOverIndex);
											}
										};

										const handleMouseUp = () => {
											targetTab.classList.remove("tabs-tab-dragging");
											document.removeEventListener("mousemove", handleMouseMove);
											document.removeEventListener("mouseup", handleMouseUp);
										};

										document.addEventListener("mousemove", handleMouseMove);
										document.addEventListener("mouseup", handleMouseUp);
									}}
									onClick={() => clickTabs(item)}
								>
									<span className="tabs-tab-content">
										{renderIcon(item.icon)}
										<span className="tabs-tab-title" title={item.title}>
											{item.title}
										</span>
									</span>
									<span
										className="tabs-tab-close"
										onClick={e => {
											e.stopPropagation();
											delTabs(item.path);
										}}
									>
										<CloseOutlined />
									</span>
								</div>
							</Dropdown>
						))}
					</div>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => state;
const mapDispatchToProps = { setTabsList };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutTabs) as ComponentType<LayoutTabsOwnProps>;
