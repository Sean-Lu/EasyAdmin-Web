import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

const userRouter = [
	{
		element: <LayoutIndex />,
		children: [
			{
				path: "/user/message",
				element: lazyLoad(React.lazy(() => import("@/views/user/message/MessageList"))),
				meta: {
					requiresAuth: true,
					title: "我的消息",
					key: "user-message"
				}
			},
			{
				path: "/user/todoList",
				// element: lazyLoad(React.lazy(() => import("@/views/tool/todoList/index"))), // 纯前端实现（不涉及后端）
				element: lazyLoad(React.lazy(() => import("@/views/tool/todoListWithPriority/index"))),
				meta: {
					requiresAuth: true,
					title: "待办事项",
					key: "user-todoList"
				}
			},
			{
				path: "/user/checkIn",
				element: lazyLoad(React.lazy(() => import("@/views/tool/checkIn/index"))),
				meta: {
					requiresAuth: true,
					title: "签到",
					key: "user-checkIn"
				}
			},
			{
				path: "/user/dayWorkReport",
				element: lazyLoad(React.lazy(() => import("@/views/tool/dayWorkReport/DayWorkReport"))),
				meta: {
					requiresAuth: true,
					title: "日报",
					key: "user-dayWorkReport"
				}
			},
			{
				path: "/user/weekWorkReport",
				element: lazyLoad(React.lazy(() => import("@/views/tool/weekWorkReport/WeekWorkReport"))),
				meta: {
					requiresAuth: true,
					title: "周报",
					key: "user-weekWorkReport"
				}
			},
			{
				path: "/user/monthWorkReport",
				element: lazyLoad(React.lazy(() => import("@/views/tool/monthWorkReport/MonthWorkReport"))),
				meta: {
					requiresAuth: true,
					title: "月报",
					key: "user-monthWorkReport"
				}
			}
		]
	}
];

export default userRouter;
