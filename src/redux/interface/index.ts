import type { SizeType } from "antd/lib/config-provider/SizeContext";
import type { WatermarkMode } from "@/config/watermark";

/* themeConfigProp */
export interface ThemeConfigProp {
	primary: string;
	isDark: boolean;
	weakOrGray: string;
	layout: "side" | "top";
	breadcrumb: boolean;
	tabs: boolean;
	footer: boolean;
	watermark: boolean;
	watermarkMode: WatermarkMode;
	watermarkText: string;
}

/* GlobalState */
export interface GlobalState {
	token: string;
	userInfo: any;
	assemblySize: SizeType;
	language: string;
	themeConfig: ThemeConfigProp;
}

/* MenuState */
export interface MenuState {
	isCollapse: boolean;
	menuList: Menu.MenuOptions[];
}

/* TabsState */
export interface TabsState {
	tabsActive: string;
	tabsList: Menu.MenuOptions[];
}

/* BreadcrumbState */
export interface BreadcrumbState {
	breadcrumbList: {
		[propName: string]: any;
	};
}

/* AuthState */
export interface AuthState {
	authButtons: {
		[propName: string]: any;
	};
	authRouter: string[];
}

export type IdleTimeoutMinutes = 5 | 10 | 15 | 30 | 60;

export interface LockPreference {
	autoLockEnabled: boolean;
	idleTimeoutMinutes: IdleTimeoutMinutes;
}

export interface LockRuntime {
	locked: boolean;
	lockedAt: number | null;
	lastActiveAt: number;
	version: number;
}

export interface LockState extends LockPreference, LockRuntime {
	hydrated: boolean;
}
