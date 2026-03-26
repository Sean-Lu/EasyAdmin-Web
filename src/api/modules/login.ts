import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import qs from "qs";

import http from "@/api";

/**
 * @name 登录模块
 */
// * 用户登录接口
export const loginApi = (params: Login.LoginReq) => {
	return http.post<Login.LoginRes>(PORT1 + `/auth/login`, params);
	return http.post<Login.LoginRes>(PORT1 + `/auth/login`, {}, { params }); // post 请求携带 query 参数  ==>  ?username=admin&password=123456
	return http.post<Login.LoginRes>(PORT1 + `/auth/login`, qs.stringify(params)); // post 请求携带 表单 参数  ==>  application/x-www-form-urlencoded
	return http.post<Login.LoginRes>(PORT1 + `/auth/login`, params, { headers: { noLoading: true } }); // 控制当前请求不显示 loading
};

// * 获取按钮权限
export const getAuthorButtons = () => {
	return http.get<Login.AuthButtonsRes>(PORT1 + `/auth/buttons`);
};

// * 获取菜单列表
export const getMenuList = () => {
	return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/listTree`);
};

// * 获取用户信息
export const getUserInfo = () => {
	return http.get<UserInfo>(PORT1 + `/user/getUserInfo`);
};

export interface UserInfo {
	userName: string; // 用户名称
	nickName: string; // 昵称
	phoneNumber: string; // 手机号
	email: string; // 邮箱
	userRole: number; // 用户角色
	departmentId: string; // 所属部门ID
	departmentName: string; // 所属部门名称
	positionId: string; // 所属岗位ID
	positionName: string; // 所属岗位名称
}
