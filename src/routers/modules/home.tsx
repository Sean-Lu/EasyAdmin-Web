// import React from "react";
// import lazyLoad from "@/routers/util/lazyLoad";
import { LayoutIndex } from "@/routers/constant";
import { RouteObject } from "@/routers/interface";
import Home from "@/views/home/index";
import EmptyPage from "@/views/empty";

// 首页模块
const homeRouter: Array<RouteObject> = [
	{
		element: <LayoutIndex />,
		children: [
			{
				path: "/home/index",
				// element: lazyLoad(React.lazy(() => import("@/views/home/index"))),
				element: <Home />,
				meta: {
					requiresAuth: true,
					title: "首页",
					key: "home"
				}
			},
			{
				path: "/empty",
				element: <EmptyPage />,
				meta: {
					requiresAuth: false,
					title: "空状态",
					key: "empty"
				}
			}
		]
	}
];

export default homeRouter;
