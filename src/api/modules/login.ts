import { BackendId, BackendIdInput, Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import qs from "qs";

import http from "@/api";
import { createFreshUserInfoParams } from "./userInfoRequest";

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

// * 用户注册接口
export const registerApi = (params: Login.RegisterReq) => {
	return http.post<Login.RegisterRes>(PORT1 + `/auth/register`, params);
};

// * 获取登录配置
export const getLoginConfigApi = () => {
	return http.get<Login.LoginConfigRes>(PORT1 + `/auth/loginConfig`, undefined, { headers: { noLoading: true } });
};

// * 获取登录验证码
export const getCaptchaApi = () => {
	return http.get<Login.CaptchaRes>(PORT1 + `/auth/captcha`, undefined, { headers: { noLoading: true } });
};

// * 刷新token接口
export const refreshTokenApi = (refreshToken: string) => {
	return http.post<Login.LoginRes>(PORT1 + `/auth/refreshToken`, { refreshToken }, { headers: { noLoading: true } });
};

// * 用户退出登录接口
export const logoutApi = () => {
	return http.post(PORT1 + `/auth/logout`);
};

// * 验证当前用户密码
export const verifyPasswordApi = (password: string) => {
	return http.post<boolean>(PORT1 + `/auth/verifyPassword`, { password }, { headers: { noLoading: true } });
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
export const getUserInfo = (forceRefresh = false) => {
	return http.get<UserInfo>(PORT1 + `/user/getUserInfo`, forceRefresh ? createFreshUserInfoParams() : undefined);
};

// * 更新用户信息
export const updateUserProfile = (params: UserProfileUpdateReq) => {
	return http.post<boolean>(PORT1 + `/user/updateProfile`, params);
};

// * 上传用户头像
export const uploadUserAvatar = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);

	return http.post<BackendId>(PORT1 + `/user/uploadAvatar`, formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// * 删除用户头像文件
export const deleteUserAvatarFile = (avatarFileId?: BackendIdInput) => {
	if (!avatarFileId) return Promise.resolve();

	// 头像属于业务文件，不能走文件管理删除接口；这里使用用户头像专用清理接口。
	return http.delete<boolean>(PORT1 + `/user/deleteAvatarFile`, { id: avatarFileId });
};

// * 获取用户头像文件的 Object URL
export const getAvatarObjectUrl = async (avatarFileId?: BackendIdInput, allowWhenLocked = false) => {
	if (!avatarFileId) return "";

	const response = await http.downloadGet(
		PORT1 + `/file/downloadfile`,
		{ id: avatarFileId },
		{
			headers: allowWhenLocked ? { "x-easyadmin-lock-avatar-preload": "true" } : undefined
		}
	);
	return URL.createObjectURL(response.data);
};

// * 更新用户信息请求参数
export interface UserProfileUpdateReq {
	nickName?: string; // 昵称
	avatarFileId?: BackendIdInput; // 头像文件ID
	phoneNumber?: string; // 手机号
	email?: string; // 邮箱
	currentPassword?: string; // 当前登录密码（MD5）
}

// * 用户信息
export interface UserInfo {
	id: BackendId;
	tenantId: BackendId;
	tenantCode: string;
	tenantName: string;
	userName: string; // 用户名称
	nickName: string; // 昵称
	avatarFileId?: BackendId; // 头像文件ID
	phoneNumber: string; // 手机号
	email: string; // 邮箱
	departmentId: BackendId; // 所属部门ID
	departmentName: string; // 所属部门名称
	positionId: BackendId; // 所属岗位ID
	positionName: string; // 所属岗位名称
}
