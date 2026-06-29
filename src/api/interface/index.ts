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
	/**登录请求参数 */
	export interface LoginReq {
		username: string;
		password: string;
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
