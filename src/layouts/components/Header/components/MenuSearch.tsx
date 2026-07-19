import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Empty, Input, InputRef, Modal, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as Icons from "@ant-design/icons";
import { flattenMenuTree } from "@/utils/util";
import { getMenuAction } from "@/layouts/components/Menu/menuTree";
import { BackendIdInput } from "@/api/interface";
import FavoriteButton from "@/components/FavoriteButton";
import { toFavoriteIdMap } from "@/components/FavoriteButton/favoriteState";
import { FavoriteService, FavoriteTargetType } from "@/services/user/favoriteService";
import "./MenuSearch.less";

interface MenuSearchProps {
	menuList: Menu.MenuOptions[];
	themeConfig: { isDark?: boolean };
}

type SearchableMenuItem = Menu.MenuOptions & { parentTitles: string[]; fullTitle: string };

// 菜单搜索面板
const MenuSearch = (props: MenuSearchProps) => {
	const { menuList, themeConfig } = props;
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const [favoriteIds, setFavoriteIds] = useState<Record<string, BackendIdInput>>({});
	const inputRef = useRef<InputRef>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const flatMenuList = useMemo(() => flattenMenuTree(menuList), [menuList]);

	const filteredList = useMemo(() => {
		const value = keyword.trim().toLowerCase();
		if (!value) return flatMenuList;
		return flatMenuList.filter(item => item.title.toLowerCase().includes(value));
	}, [keyword, flatMenuList]);

	useEffect(() => {
		if (!open || flatMenuList.length === 0) {
			setFavoriteIds({});
			return;
		}
		let active = true;
		const targets = flatMenuList
			.filter(item => Boolean(item.id))
			.map(item => ({ targetType: FavoriteTargetType.Menu, targetId: item.id! }));
		void FavoriteService.status(targets)
			.then(items => {
				if (active) setFavoriteIds(toFavoriteIdMap(items));
			})
			.catch(() => {
				if (active) setFavoriteIds({});
			});
		return () => {
			active = false;
		};
	}, [open, flatMenuList]);

	useEffect(() => {
		setActiveIndex(0);
	}, [filteredList]);

	useEffect(() => {
		if (!listRef.current) return;
		const activeItem = listRef.current.querySelector(".menu-search-item-active");
		if (activeItem) {
			activeItem.scrollIntoView({ block: "nearest" });
		}
	}, [activeIndex]);

	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				setOpen(prev => !prev);
			} else if (event.key === "Escape") {
				setOpen(false);
			}
		};
		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, []);

	const handleOpen = () => {
		setOpen(true);
		setKeyword("");
		setActiveIndex(0);
	};

	const handleClose = () => {
		setOpen(false);
		setKeyword("");
		setActiveIndex(0);
	};

	const handleSelect = (item: SearchableMenuItem) => {
		const action = getMenuAction(item);
		if (action.type === "external") window.open(action.url, "_blank", "noopener,noreferrer");
		if (action.type === "navigate") navigate(action.url);
		handleClose();
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!filteredList.length) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex(prev => (prev + 1) % filteredList.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex(prev => (prev - 1 + filteredList.length) % filteredList.length);
		} else if (event.key === "Enter") {
			event.preventDefault();
			if (filteredList[activeIndex]) {
				handleSelect(filteredList[activeIndex]);
			}
		} else if (event.key === "Escape") {
			handleClose();
		}
	};

	const highlightTitle = (title: string, keywordValue: string) => {
		const value = keywordValue.trim().toLowerCase();
		if (!value) return title;
		const lowerTitle = title.toLowerCase();
		const index = lowerTitle.indexOf(value);
		if (index === -1) return title;
		const before = title.slice(0, index);
		const match = title.slice(index, index + value.length);
		const after = title.slice(index + value.length);
		return (
			<>
				{before}
				<span className="menu-search-highlight">{match}</span>
				{after}
			</>
		);
	};

	const customIcons: { [key: string]: any } = Icons;
	const renderIcon = (name?: string) => {
		if (!name) return null;
		return customIcons[name] ? React.createElement(customIcons[name]) : null;
	};

	return (
		<>
			<Tooltip title="搜索菜单 (Ctrl+K)" placement="bottom">
				<span className="menu-search-trigger icon-style" onClick={handleOpen}>
					<SearchOutlined />
				</span>
			</Tooltip>
			<Modal
				open={open}
				onCancel={handleClose}
				footer={null}
				closable={false}
				width={520}
				centered
				rootClassName={themeConfig?.isDark ? "menu-search-modal-root-dark" : ""}
				className="menu-search-modal"
				afterOpenChange={visible => {
					if (visible) {
						inputRef.current?.focus();
					}
				}}
			>
				<div className="menu-search-panel">
					<Input
						ref={inputRef}
						prefix={<SearchOutlined />}
						placeholder="搜索菜单（Ctrl+K）"
						allowClear
						value={keyword}
						onChange={e => setKeyword(e.target.value)}
						onKeyDown={onKeyDown}
					/>
					<div className="menu-search-result" ref={listRef}>
						{filteredList.length ? (
							filteredList.map((item, index) => (
								<div
									key={`${item.path}-${item.title}-${index}`}
									className={`menu-search-item ${index === activeIndex ? "menu-search-item-active" : ""}`}
									onClick={() => handleSelect(item)}
									onMouseEnter={() => setActiveIndex(index)}
								>
									<div className="menu-search-item-content">
										<div className="menu-search-item-title">
											{renderIcon(item.icon)}
											<span>{highlightTitle(item.title, keyword)}</span>
										</div>
										<div className="menu-search-item-path">{item.fullTitle}</div>
									</div>
									{item.id && (
										<FavoriteButton
											type="text"
											targetType={FavoriteTargetType.Menu}
											targetId={item.id}
											favoriteId={favoriteIds[String(item.id)]}
											onChange={favoriteId =>
												setFavoriteIds(current => {
													const next = { ...current };
													if (favoriteId) next[String(item.id)] = favoriteId;
													else delete next[String(item.id)];
													return next;
												})
											}
										/>
									)}
								</div>
							))
						) : (
							<Empty description="未找到匹配的菜单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						)}
					</div>
					<div className="menu-search-footer">
						<span>↑↓ 选择</span>
						<span>↵ 打开</span>
						<span>Esc 关闭</span>
					</div>
				</div>
			</Modal>
		</>
	);
};

const mapStateToProps = (state: any) => ({
	menuList: state.menu.menuList,
	themeConfig: state.global.themeConfig
});
export default connect(mapStateToProps)(MenuSearch);
