export type BackendId = string;
export type BackendIdInput = BackendId | number;

/**请求响应参数(不包含data) */
export interface ApiResultBase {
	success: boolean;
	code: string;
	msg: string;
}

/**请求响应参数(包含data) */
export interface ApiResult<T = any> extends ApiResultBase {
	data: T;
}

/**分页请求参数 */
export interface PageReqBase {
	pageNumber: number;
	pageSize: number;
}

/**分页响应参数 */
export interface PageRes<T> extends PageReqBase {
	total: number;
	list: T[];
}

/**DTO基础参数 */
export interface DtoBase {
	id: BackendId;
	createUserId: BackendId;
	createTime: string;
	updateUserId: BackendId;
	updateTime: string;
	isDelete: boolean;
}

/**通用启用状态 */
export enum CommonState {
	Disable = 0,
	Enable = 1
}

/**登录 */
export namespace Login {
	/**登录方式 */
	export enum LoginType {
		/**账号密码登录（用户名 / 手机号 / 邮箱 + 密码） */
		Password = 1,
		/**手机短信验证码登录 */
		PhoneCode = 2,
		/**邮箱验证码登录 */
		EmailCode = 3
	}

	/**登录请求参数 */
	export interface LoginReq {
		/** 租户编码 */
		tenantCode?: string;
		/**账号（用户名 / 手机号 / 邮箱） */
		account: string;
		/**密码（LoginType=Password 时必填） */
		password: string;
		/**登录方式，默认 Password */
		loginType?: LoginType;
		captchaKey?: string;
		captchaCode?: string;
	}
	/**注册请求参数 */
	export interface RegisterReq {
		/**租户编码 */
		tenantCode?: string;
		/**用户名 */
		userName: string;
		/**密码 */
		password: string;
		/**手机号 */
		phoneNumber?: string;
		/**邮箱 */
		email?: string;
		captchaKey?: string;
		captchaCode?: string;
	}
	/**注册结果 */
	export interface RegisterRes {
		/**是否需要管理员审核 */
		requiresApproval: boolean;
		/**用户名 */
		userName: string;
		/**手机号 */
		phoneNumber?: string;
		/**邮箱 */
		email?: string;
		/**租户编码 */
		tenantCode?: string;
	}
	/**验证码响应参数 */
	export interface CaptchaRes {
		/**是否启用验证码 */
		enabled: boolean;
		/**验证码key */
		captchaKey: string | null;
		/**验证码图片 */
		image: string | null;
	}
	/**登录配置响应参数 */
	export interface LoginConfigRes {
		/**是否启用租户登录 */
		tenantEnabled: boolean;
		/**是否启用注册 */
		registerEnabled: boolean;
	}
	/**登录响应参数 */
	export interface LoginRes {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
	}
	export interface AuthButtonsRes {
		[propName: string]: any;
	}
}
