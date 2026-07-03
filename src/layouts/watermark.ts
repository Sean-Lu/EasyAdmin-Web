import { DEFAULT_WATERMARK_MODE, DEFAULT_WATERMARK_TEXT } from "@/config/watermark";
import type { WatermarkMode } from "@/config/watermark";

export { DEFAULT_WATERMARK_MODE, DEFAULT_WATERMARK_TEXT };
export type { WatermarkMode };

interface WatermarkConfig {
	watermark?: boolean;
	watermarkMode?: WatermarkMode;
	watermarkText?: string;
}

interface WatermarkUserInfo {
	nickName?: string;
	userName?: string;
}

export const getWatermarkContent = (config: WatermarkConfig, userInfo: WatermarkUserInfo): string | undefined => {
	if (!config.watermark) return undefined;

	if ((config.watermarkMode ?? DEFAULT_WATERMARK_MODE) === "custom") {
		return config.watermarkText?.trim() || DEFAULT_WATERMARK_TEXT;
	}

	return userInfo.nickName?.trim() || userInfo.userName?.trim() || undefined;
};
