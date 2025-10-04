import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

// 工具模块
const toolRouter = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "工具"
		},
		children: [
			{
				path: "/tool/todoList",
				element: lazyLoad(React.lazy(() => import("@/views/tool/todoList/index"))),
				meta: {
					requiresAuth: true,
					title: "待办事项",
					key: "tool-todoList"
				}
			},
			{
				path: "/tool/dayWorkReport",
				element: lazyLoad(React.lazy(() => import("@/views/tool/dayWorkReport/DayWorkReport"))),
				meta: {
					requiresAuth: true,
					title: "日报",
					key: "tool-dayWorkReport"
				}
			},
			{
				path: "/tool/crypto",
				element: lazyLoad(React.lazy(() => import("@/views/tool/crypto/index"))),
				meta: {
					requiresAuth: true,
					title: "加解密",
					key: "tool-crypto"
				}
			},
			{
				path: "/tool/checkIn",
				element: lazyLoad(React.lazy(() => import("@/views/tool/checkIn/index"))),
				meta: {
					requiresAuth: true,
					title: "签到",
					key: "tool-checkIn"
				}
			}
		]
	}
];

export default toolRouter;
