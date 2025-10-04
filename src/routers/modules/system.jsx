import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

// 系统管理模块
const systemRouter = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "系统管理"
		},
		children: [
			{
				path: "/system/tenant",
				element: lazyLoad(React.lazy(() => import("@/views/system/tenant/Tenant"))),
				meta: {
					requiresAuth: true,
					title: "租户管理",
					key: "system-tenant"
				}
			},
			{
				path: "/system/user",
				element: lazyLoad(React.lazy(() => import("@/views/system/user/User"))),
				meta: {
					requiresAuth: true,
					title: "用户管理",
					key: "system-user"
				}
			},
			// {
			// 	path: "/system/role",
			// 	element: lazyLoad(React.lazy(() => import("@/views/system/role/Role"))),
			// 	meta: {
			// 		requiresAuth: true,
			// 		title: "角色管理",
			// 		key: "system-role"
			// 	}
			// },
			// {
			// 	path: "/system/dept",
			// 	element: lazyLoad(React.lazy(() => import("@/views/system/dept/Dept"))),
			// 	meta: {
			// 		requiresAuth: true,
			// 		title: "部门管理",
			// 		key: "system-dept"
			// 	}
			// },
			// {
			// 	path: "/system/post",
			// 	element: lazyLoad(React.lazy(() => import("@/views/system/post/Post"))),
			// 	meta: {
			// 		requiresAuth: true,
			// 		title: "岗位管理",
			// 		key: "system-post"
			// 	}
			// },
			{
				path: "/system/menu",
				element: lazyLoad(React.lazy(() => import("@/views/system/menu/Menu"))),
				meta: {
					requiresAuth: true,
					title: "菜单管理",
					key: "system-menu"
				}
			},
			// {
			// 	path: "/system/dict",
			// 	element: lazyLoad(React.lazy(() => import("@/views/system/dict/Dict"))),
			// 	meta: {
			// 		requiresAuth: true,
			// 		title: "字典管理",
			// 		key: "system-dict"
			// 	}
			// },
			{
				path: "/system/param",
				element: lazyLoad(React.lazy(() => import("@/views/system/param/Param"))),
				meta: {
					requiresAuth: true,
					title: "参数管理",
					key: "system-param"
				}
			},
			{
				path: "/system/task",
				element: lazyLoad(React.lazy(() => import("@/views/system/task/Task"))),
				meta: {
					requiresAuth: true,
					title: "任务管理",
					key: "system-task"
				}
			},
			{
				path: "/system/file",
				element: lazyLoad(React.lazy(() => import("@/views/system/file/FileList"))),
				meta: {
					requiresAuth: true,
					title: "文件管理",
					key: "system-file"
				}
			}
		]
	}
];

export default systemRouter;
