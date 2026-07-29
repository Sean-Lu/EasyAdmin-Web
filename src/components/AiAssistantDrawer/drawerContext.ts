/** AI 快捷入口可使用的页面上下文 */
export interface DrawerPageContext {
	/** 当前路径 */
	pathname: string;
	/** 匹配路由标识 */
	routeKey?: string;
	/** 匹配路由标题 */
	routeTitle?: string;
}

/** 从路由信息中提取安全的页面上下文 */
export function deriveDrawerPageContext(
	location: { pathname: string },
	route?: { key?: string; title?: string }
): DrawerPageContext {
	return {
		pathname: location.pathname,
		routeKey: route?.key,
		routeTitle: route?.title
	};
}
