import { Navigate, useRoutes, RouteObject as ReactRouterRouteObject } from "react-router-dom";
import { RouteObject } from "@/routers/interface";
import Login from "@/views/login/index";
import CheckIn from "@/views/user/checkIn/Calendar";
import SharePage from "@/views/share";

// * 导入所有router
// const metaRouters = import.meta.globEager("./modules/*.tsx"); // 支持：*.tsx
const metaRouters = import.meta.globEager("./modules/*.*"); // 支持：*.tsx | *.jsx

// * 处理路由
export const routerArray: RouteObject[] = [];
Object.keys(metaRouters).forEach(item => {
	Object.keys(metaRouters[item]).forEach((key: any) => {
		routerArray.push(...metaRouters[item][key]);
	});
});

export const rootRouter: RouteObject[] = [
	{
		path: "/",
		element: <Navigate to="/home/index" />
	},
	{
		path: "/login",
		element: <Login />,
		meta: {
			requiresAuth: false,
			title: "登录",
			key: "login"
		}
	},
	{
		path: "/checkin",
		element: <CheckIn />,
		meta: {
			requiresAuth: true,
			title: "签到",
			key: "checkin"
		}
	},
	{
		path: "/share/:shareCode",
		element: <SharePage />,
		meta: { requiresAuth: false, title: "分享", key: "share" }
	},
	...routerArray,
	{
		path: "*",
		element: <Navigate to="/404" />
	}
];

const Router = () => {
	const routes = useRoutes(rootRouter as ReactRouterRouteObject[]);
	return routes;
};

export default Router;
