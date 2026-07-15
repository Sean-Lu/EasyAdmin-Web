import type { BackendId } from "@/api/interface";

/** 用于生成在线用户展示名称的用户字段 */
export interface OnlineUserNameRecord {
	nickName?: string;
	userName?: string;
}

/** 获取在线用户的显示名称 */
export const getOnlineUserDisplayName = (user: OnlineUserNameRecord): string => {
	const nickName = user.nickName?.trim();
	const userName = user.userName?.trim();
	if (nickName && userName) return `${nickName}（${userName}）`;
	return nickName || userName || "-";
};

/** 判断强踢的用户是否为当前登录用户 */
export const shouldLogoutAfterKick = (kickedUserId: BackendId, currentUserId: BackendId): boolean =>
	String(kickedUserId) === String(currentUserId);

export interface OnlineUserQuery {
	userName?: string;
	ipAddress?: string;
}

/** 构建已提交的在线用户查询条件 */
export const buildOnlineUserQuery = (userName: string, ipAddress: string): OnlineUserQuery => ({
	userName: userName.trim() || undefined,
	ipAddress: ipAddress.trim() || undefined
});

/** 清空在线用户查询条件 */
export const resetOnlineUserQuery = (): OnlineUserQuery => ({ userName: undefined, ipAddress: undefined });
