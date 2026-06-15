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

// * 刷新token接口
export const refreshTokenApi = (refreshToken: string) => {
	return http.post<Login.LoginRes>(PORT1 + `/auth/refreshToken`, { refreshToken }, { headers: { noLoading: true } });
};

// * 用户退出登录接口
export const logoutApi = () => {
	return http.post(PORT1 + `/auth/logout`);
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

// * 更新用户信息
export const updateUserProfile = (params: UserProfileUpdateReq) => {
	return http.post<boolean>(PORT1 + `/user/updateProfile`, params);
};

// * 上传用户头像
export const uploadUserAvatar = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);

	return http.post<number>(PORT1 + `/user/uploadAvatar`, formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// * 删除用户头像文件
export const deleteUserAvatarFile = (avatarFileId?: number) => {
	if (!avatarFileId) return Promise.resolve();

	return http.delete<boolean>(PORT1 + `/file/deletefile`, { id: avatarFileId });
};

// * 获取用户头像文件的 Object URL
export const getAvatarObjectUrl = async (avatarFileId?: number) => {
	if (!avatarFileId) return "";

	const response = await http.downloadGet(PORT1 + `/file/downloadfile`, { id: avatarFileId });
	return URL.createObjectURL(response.data);
};

// * 更新用户信息请求参数
export interface UserProfileUpdateReq {
	nickName?: string;
	avatarFileId?: number;
}

// * 用户信息
export interface UserInfo {
	userName: string; // 用户名称
	nickName: string; // 昵称
	avatarFileId?: number; // 头像文件ID
	phoneNumber: string; // 手机号
	email: string; // 邮箱
	departmentId: string; // 所属部门ID
	departmentName: string; // 所属部门名称
	positionId: string; // 所属岗位ID
	positionName: string; // 所属岗位名称
}
