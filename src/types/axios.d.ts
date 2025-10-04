import "axios"; // 必须导入原模块

declare module "axios" {
	// 扩展请求配置
	export interface AxiosRequestConfig {
		/**
		 * 是否下载请求（返回完整响应）
		 */
		isDownload?: boolean;

		/**
		 * 是否返回完整响应
		 */
		returnFullResponse?: boolean;

		/**
		 * 自定义标记（示例）
		 */
		// customFlag?: string;
	}

	// 扩展响应结构（可选）
	// export interface AxiosResponse<T = any> {
	// 	/**
	// 	 * 业务自定义字段
	// 	 */
	// 	customData?: string;

	// 	/**
	// 	 * 请求耗时（ms）
	// 	 */
	// 	duration?: number;
	// }

	// 扩展错误对象（可选）
	// export interface AxiosError<T = any> {
	// 	/**
	// 	 * 错误追踪ID
	// 	 */
	// 	traceId?: string;
	// }
}
