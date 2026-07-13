import type { BackendId } from "@/api/interface";

/** 用于生成在线用户展示名称的用户字段 */
export interface OnlineUserNameRecord {
	nickName?: string;
	userName?: string;
}

/** 获取在线用户的显示名称 */
export const getOnlineUserDisplayName = (user: OnlineUserNameRecord): string =>
	user.nickName?.trim() || user.userName?.trim() || "-";

/** 判断强踢的用户是否为当前登录用户 */
export const shouldLogoutAfterKick = (kickedUserId: BackendId, currentUserId: BackendId): boolean =>
	String(kickedUserId) === String(currentUserId);
