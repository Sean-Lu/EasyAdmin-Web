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
		/**账号（用户名 / 手机号 / 邮箱） */
		account: string;
		/**密码（LoginType=Password 时必填） */
		password: string;
		/**登录方式，默认 Password */
		loginType?: LoginType;
		captchaKey?: string;
		captchaCode?: string;
	}
	export interface CaptchaRes {
		enabled: boolean;
		captchaKey: string | null;
		image: string | null;
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
