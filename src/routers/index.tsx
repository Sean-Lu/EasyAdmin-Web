import { Navigate, useRoutes } from "react-router-dom";
import { RouteObject } from "@/routers/interface";
import Login from "@/views/login/index";
import CheckIn from "@/views/tool/checkIn/Calendar";

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
	...routerArray,
	{
		path: "*",
		element: <Navigate to="/404" />
	}
];

const Router = () => {
	const routes = useRoutes(rootRouter);
	return routes;
};

export default Router;
