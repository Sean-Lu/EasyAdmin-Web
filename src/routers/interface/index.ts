import type { RouteObject as RRouteObject } from "react-router-dom";

export interface MetaProps {
	keepAlive?: boolean;
	requiresAuth?: boolean;
	title: string;
	key?: string;
}

// 扩展 react-router-dom 的 RouteObject 类型
export interface RouteObject extends Omit<RRouteObject, "children"> {
	children?: RouteObject[];
	meta?: MetaProps;
	outLink?: string;
}
