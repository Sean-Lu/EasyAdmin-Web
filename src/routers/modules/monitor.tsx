import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

// 运行监控模块路由
const monitorRouter = [
	{
		element: <LayoutIndex />,
		meta: { title: "运行监控" },
		children: [
			{
				path: "/monitor/server",
				element: lazyLoad(React.lazy(() => import("@/views/monitor/server"))),
				meta: { requiresAuth: true, title: "服务器监控", key: "monitor-server" }
			},
			{
				path: "/monitor/onlineUsers",
				element: lazyLoad(React.lazy(() => import("@/views/monitor/onlineUsers"))),
				meta: { requiresAuth: true, title: "在线用户", key: "monitor-online-users" }
			}
		]
	}
];

export default monitorRouter;
