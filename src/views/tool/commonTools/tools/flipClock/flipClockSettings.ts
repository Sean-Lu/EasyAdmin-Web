export interface FlipClockSettings {
	/** 纯色背景颜色 */
	backgroundColor: string;
	/** 背景图片的 Base64 数据地址 */
	backgroundImage: string;
	/** 是否显示秒数 */
	showSeconds: boolean;
	/** 是否显示日期 */
	showDate: boolean;
	/** 是否显示星期 */
	showWeekday: boolean;
}

/** 翻页时钟设置的本地存储键 */
export const FLIP_CLOCK_SETTINGS_KEY = "easyadmin.flip-clock.settings";

/** 翻页时钟的默认设置 */
export const DEFAULT_FLIP_CLOCK_SETTINGS: FlipClockSettings = {
	backgroundColor: "#101828",
	backgroundImage: "",
	showSeconds: true,
	showDate: false,
	showWeekday: false
};

const isHexColor = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const isBackgroundImage = (value: unknown): value is string =>
	typeof value === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);

/** 从本地存储读取并校验翻页时钟设置 */
export function loadFlipClockSettings(storage: Storage): FlipClockSettings {
	try {
		const parsed = JSON.parse(storage.getItem(FLIP_CLOCK_SETTINGS_KEY) ?? "null") as Partial<FlipClockSettings> | null;
		const backgroundColor =
			parsed && isHexColor(parsed.backgroundColor) ? parsed.backgroundColor : DEFAULT_FLIP_CLOCK_SETTINGS.backgroundColor;
		return {
			backgroundColor,
			backgroundImage:
				parsed && isBackgroundImage(parsed.backgroundImage)
					? parsed.backgroundImage
					: DEFAULT_FLIP_CLOCK_SETTINGS.backgroundImage,
			showSeconds: typeof parsed?.showSeconds === "boolean" ? parsed.showSeconds : DEFAULT_FLIP_CLOCK_SETTINGS.showSeconds,
			showDate: typeof parsed?.showDate === "boolean" ? parsed.showDate : DEFAULT_FLIP_CLOCK_SETTINGS.showDate,
			showWeekday: typeof parsed?.showWeekday === "boolean" ? parsed.showWeekday : DEFAULT_FLIP_CLOCK_SETTINGS.showWeekday
		};
	} catch {
		return { ...DEFAULT_FLIP_CLOCK_SETTINGS };
	}
}

/** 校验并保存翻页时钟设置到本地存储 */
export function saveFlipClockSettings(storage: Storage, settings: FlipClockSettings): void {
	storage.setItem(
		FLIP_CLOCK_SETTINGS_KEY,
		JSON.stringify({
			backgroundColor: isHexColor(settings.backgroundColor)
				? settings.backgroundColor
				: DEFAULT_FLIP_CLOCK_SETTINGS.backgroundColor,
			backgroundImage: isBackgroundImage(settings.backgroundImage) ? settings.backgroundImage : "",
			showSeconds: Boolean(settings.showSeconds),
			showDate: Boolean(settings.showDate),
			showWeekday: Boolean(settings.showWeekday)
		})
	);
}
