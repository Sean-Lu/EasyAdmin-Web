import React from "react";
import lazyLoad from "@/routers/utils/lazyLoad";
import { LayoutIndex } from "@/routers/constant";
import { RouteObject } from "@/routers/interface";

// 外部链接模块 - 动态路由匹配，支持所有 /link/* 路径
const linkRouter: Array<RouteObject> = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "外部链接"
		},
		children: [
			{
				path: "/link/:key",
				element: lazyLoad(React.lazy(() => import("@/views/link/embedded/index"))),
				meta: {
					requiresAuth: true,
					title: "外部链接",
					key: "external-link"
				}
			}
		]
	}
];

export default linkRouter;
