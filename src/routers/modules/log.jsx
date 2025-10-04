import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

// 日志管理模块
const systemRouter = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "日志管理"
		},
		children: [
			{
				path: "/log/loginLog",
				element: lazyLoad(React.lazy(() => import("@/views/log/loginLog/LoginLog"))),
				meta: {
					requiresAuth: true,
					title: "登录日志",
					key: "log-loginLog"
				}
			},
			{
				path: "/log/operateLog",
				element: lazyLoad(React.lazy(() => import("@/views/log/operateLog/OperateLog"))),
				meta: {
					requiresAuth: true,
					title: "操作日志",
					key: "log-operateLog"
				}
			}
		]
	}
];

export default systemRouter;
