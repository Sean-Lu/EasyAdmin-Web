import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setTabsList } from "@/redux/modules/tabs/action";
import { routerArray } from "@/routers";
import { searchRoute } from "@/utils/util";
import MoreButton from "./components/MoreButton";
import "./index.less";

const LayoutTabs = (props: any) => {
	const { tabsList } = props.tabs;
	const { themeConfig } = props.global;
	const { setTabsList } = props;
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const [activeValue, setActiveValue] = useState<string>(pathname);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!isDeleting) {
			addTabs();
		}
		setIsDeleting(false);
	}, [pathname]);

	// click tabs
	const clickTabs = (path: string) => {
		navigate(path);
	};

	// add tabs
	const addTabs = () => {
		if (pathname === "/empty") return;
		const route = searchRoute(pathname, routerArray);
		let newTabsList = JSON.parse(JSON.stringify(tabsList));
		if (tabsList.length === 0 || tabsList.every((item: any) => item.path !== route.path)) {
			newTabsList.push({ title: route.meta!.title, path: route.path });
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
					navigate(nextTab.path);
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

	return (
		<>
			{!themeConfig.tabs && tabsList.length > 0 && (
				<div className="tabs">
					<div className="tabs-content">
						{tabsList.map((item: Menu.MenuOptions, index: number) => (
							<div
								key={item.path}
								className={`tabs-tab ${item.path === pathname ? "tabs-tab-active" : ""}`}
								onMouseDown={e => {
									e.preventDefault(); // 阻止默认行为，防止文本复制
									const targetTab = e.currentTarget;
									const originalIndex = index; // 保持原始索引不变
									const tabWidth = targetTab.offsetWidth;
									let currentOverIndex = index;

									const handleMouseMove = (moveEvent: MouseEvent) => {
										targetTab.classList.add("tabs-tab-dragging");

										const tabs = document.querySelectorAll(".tabs-tab");
										tabs.forEach((tab, tabIndex) => {
											const rect = tab.getBoundingClientRect();
											const centerX = rect.left + rect.width / 2;
											if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
												currentOverIndex = tabIndex;
											}
										});

										if (currentOverIndex !== originalIndex) {
											handleDragEnd(originalIndex, currentOverIndex); // 使用原始索引
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
								onClick={() => clickTabs(item.path)}
							>
								<span className="tabs-tab-content">
									{item.path == HOME_URL ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="tabs-tab-icon"
										>
											<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
											<polyline points="9 22 9 12 15 12 15 22"></polyline>
										</svg>
									) : (
										""
									)}
									<span className="tabs-tab-title">{item.title}</span>
								</span>
								<span
									className="tabs-tab-close"
									onClick={e => {
										e.stopPropagation();
										delTabs(item.path);
									}}
								>
									×
								</span>
							</div>
						))}
					</div>
					<MoreButton tabsList={tabsList} delTabs={delTabs} setTabsList={setTabsList}></MoreButton>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => state;
const mapDispatchToProps = { setTabsList };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutTabs);
