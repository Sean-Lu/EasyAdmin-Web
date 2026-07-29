/** AI 模型配置表单值 */
export interface AiConfigFormValues {
	/** 服务地址 */
	baseUrl: string;
	/** 模型名称 */
	model: string;
	/** 新接口密钥 */
	apiKey?: string;
	/** 脱敏接口密钥 */
	maskedApiKey?: string;
	/** 超时秒数 */
	timeoutSeconds: number;
	/** 最大输出令牌 */
	maxOutputTokens: number;
	/** 生成温度 */
	temperature: number;
}

/** 校验并转换模型配置提交参数 */
export function toAiConfigRequest(values: AiConfigFormValues) {
	if (!/^https?:\/\//i.test(values.baseUrl)) throw new Error("服务地址必须是 HTTP(S) URL");
	if (!values.model.trim()) throw new Error("模型不能为空");
	if (values.timeoutSeconds < 5 || values.timeoutSeconds > 300) throw new Error("超时时间必须在 5-300 秒");
	if (values.maxOutputTokens < 128 || values.maxOutputTokens > 32768) throw new Error("输出令牌数必须在 128-32768");
	if (values.temperature < 0 || values.temperature > 2) throw new Error("温度必须在 0-2");
	const apiKey = values.apiKey?.trim();
	return {
		baseUrl: values.baseUrl.trim(),
		model: values.model.trim(),
		timeoutSeconds: Number(values.timeoutSeconds),
		maxOutputTokens: Number(values.maxOutputTokens),
		temperature: Number(values.temperature),
		...(apiKey && apiKey !== values.maskedApiKey && !apiKey.includes("****") ? { apiKey } : {})
	};
}
