import React from "react";
import lazyLoad from "@/routers/utils/lazyLoad";
import { LayoutIndex } from "@/routers/constant";
import { RouteObject } from "@/routers/interface";

// 外部链接模块
const linkRouter: Array<RouteObject> = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "外部链接"
		},
		children: [
			{
				path: "/link/gitee",
				element: lazyLoad(React.lazy(() => import("@/views/link/embedded/index"))),
				meta: {
					requiresAuth: true,
					title: "Gitee 仓库",
					key: "gitee"
				}
			},
			{
				path: "/link/github",
				element: lazyLoad(React.lazy(() => import("@/views/link/embedded/index"))),
				meta: {
					requiresAuth: true,
					title: "GitHub 仓库",
					key: "github"
				}
			},
			{
				path: "/link/baidu",
				element: lazyLoad(React.lazy(() => import("@/views/link/embedded/index"))),
				meta: {
					requiresAuth: true,
					title: "百度搜索",
					key: "baidu"
				}
			}
		]
	}
];

export default linkRouter;
