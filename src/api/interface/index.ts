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
	id: number;
	createUserId: number;
	createTime: string;
	updateUserId: number;
	updateTime: string;
	isDelete: boolean;
}

/**登录 */
export namespace Login {
	/**登录请求参数 */
	export interface LoginReq {
		username: string;
		password: string;
	}
	/**登录响应参数 */
	export interface LoginRes {
		accessToken: string;
	}
	export interface AuthButtonsRes {
		[propName: string]: any;
	}
}
