import { OutLinkOpenType } from "@/enums/menu";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

// 外部链接组件(iframe)
const EmbeddedLink = () => {
	const [url, setUrl] = useState("");
	const [title, setTitle] = useState("");
	const [openType, setOpenType] = useState<number>(0);
	const menuList = useSelector((state: any) => state.menu.menuList);
	const { pathname } = useLocation();

	useEffect(() => {
		const findMenu = (list: any[]): any => {
			for (const item of list) {
				if (item.path === pathname) {
					return item;
				}
				if (item.children && item.children.length > 0) {
					const found = findMenu(item.children);
					if (found) return found;
				}
			}
			return null;
		};
		const menu = findMenu(menuList);
		if (menu) {
			setUrl(menu.outLink || "");
			setTitle(menu.title || "");
			setOpenType(menu.outLinkOpenType || OutLinkOpenType.Inline);
		}
	}, [menuList, pathname]);

	if (openType === OutLinkOpenType.Blank) {
		return (
			<div className="card content-box">
				<span className="text">该链接配置为在新标签页打开，请点击左侧菜单重新打开</span>
			</div>
		);
	}

	return (
		<div className="card content-box iframe-container">
			{url ? (
				<iframe
					src={url}
					title={title}
					width="100%"
					height="100%"
					frameBorder="0"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
				/>
			) : (
				<span className="text">无法加载外部链接</span>
			)}
		</div>
	);
};

export default EmbeddedLink;
