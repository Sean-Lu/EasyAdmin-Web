import request from "@/api/index";
import { BackendIdInput, PageReqBase, PageRes } from "@/api/interface";
import { NoteContentType } from "@/services/tool/noteService";

export enum ShareTargetType {
	/** 普通文件 */
	File = 0,
	/** 笔记 */
	Note = 1
}

/** 分享列表状态 */
export enum ShareListStatus {
	/** 正常 */
	Normal = 0,
	/** 已停用 */
	Disabled = 1,
	/** 已过期 */
	Expired = 2,
	/** 目标已删除或不可用 */
	TargetDeleted = 3
}

/** 分享列表项 */
export interface ShareListItemDto {
	/** 分享ID */
	id: BackendIdInput;
	/** 目标类型 */
	targetType: ShareTargetType;
	/** 目标ID */
	targetId: BackendIdInput;
	/** 文件名称或笔记标题 */
	targetName: string;
	/** 当前分享码 */
	shareCode: string;
	/** 是否启用 */
	isEnabled: boolean;
	/** 是否设置访问密码 */
	hasPassword: boolean;
	/** 创建时间 */
	createTime?: string;
	/** 到期时间 */
	expiresAt?: string;
	/** 分享状态 */
	status: ShareListStatus;
	/** 分享目标是否仍可用 */
	targetAvailable: boolean;
}

/** 分享列表查询条件 */
export interface ShareListReqDto extends PageReqBase {
	/** 文件名称或笔记标题关键字 */
	keyword?: string;
	/** 目标类型筛选 */
	targetType?: ShareTargetType;
	/** 分享状态筛选 */
	status?: ShareListStatus;
}

/** 分享配置 */
export interface ShareConfigDto {
	/** 是否存在分享配置 */
	exists: boolean;
	/** 当前分享码 */
	shareCode?: string;
	/** 是否启用 */
	isEnabled: boolean;
	/** 到期时间 */
	expiresAt?: string;
	/** 是否设置访问密码 */
	hasPassword: boolean;
	/** 分享密码，仅用于已认证的配置页面 */
	password?: string;
}

/** 匿名访问分享状态 */
export interface PublicShareStatusDto {
	/** 目标类型 */
	targetType: ShareTargetType;
	/** 是否需要分享密码 */
	requiresPassword: boolean;
}

/** 匿名文件分享信息 */
export interface PublicShareFileDto {
	/** 分享者名称 */
	ownerName: string;
	/** 文件名称 */
	name: string;
	/** 文件大小 */
	size: number;
	/** MIME 类型 */
	contentType?: string;
	/** 到期时间 */
	expiresAt?: string;
}

/** 匿名笔记分享内容 */
export interface PublicShareNoteDto {
	/** 分享者名称 */
	ownerName: string;
	/** 笔记标题 */
	title: string;
	/** 正文格式 */
	contentType: NoteContentType;
	/** 清理后的正文 HTML */
	contentHtml?: string;
	/** 分类名称 */
	categoryName?: string;
	/** 标签名称 */
	tags: string[];
	/** 更新时间 */
	updateTime?: string;
	/** 到期时间 */
	expiresAt?: string;
}

/** 分享密码验证结果 */
export interface PublicShareVerifyResultDto {
	/** 短期访问令牌 */
	accessToken: string;
	/** 令牌有效分钟数 */
	expireMinutes: number;
}

/** 密码分享访问令牌的浏览器存储键 */
const tokenKey = (shareCode: string) => `share-access-token:${shareCode}`;

interface StoredShareAccessToken {
	accessToken: string;
	expiresAt: number;
}

const getStoredAccessToken = (shareCode: string): string | undefined => {
	const key = tokenKey(shareCode);
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return undefined;
		const stored = JSON.parse(raw) as Partial<StoredShareAccessToken>;
		if (typeof stored.accessToken !== "string" || typeof stored.expiresAt !== "number" || stored.expiresAt <= Date.now()) {
			localStorage.removeItem(key);
			return undefined;
		}
		return stored.accessToken;
	} catch {
		localStorage.removeItem(key);
		return undefined;
	}
};

const storeAccessToken = (shareCode: string, accessToken: string, expireMinutes: number) => {
	const stored: StoredShareAccessToken = {
		accessToken,
		expiresAt: Date.now() + expireMinutes * 60 * 1000
	};
	localStorage.setItem(tokenKey(shareCode), JSON.stringify(stored));
};

/** 为匿名分享请求附加短期访问令牌 */
const headers = (shareCode: string): Record<string, string> => {
	const accessToken = getStoredAccessToken(shareCode);
	return accessToken ? { "X-Share-Access-Token": accessToken } : {};
};

export class ShareService {
	/** 查询当前用户的分享列表 */
	static async list(params: ShareListReqDto) {
		return (await request.get<PageRes<ShareListItemDto>>("/Share/List", params)).data!;
	}

	/** 查询指定文件或笔记的分享配置 */
	static async config(targetType: ShareTargetType, targetId: BackendIdInput) {
		return (await request.get<ShareConfigDto>("/Share/Config", { targetType, targetId })).data!;
	}

	/** 保存指定文件或笔记的分享配置 */
	static async save(data: {
		/** 目标类型 */
		targetType: ShareTargetType;
		/** 目标ID */
		targetId: BackendIdInput;
		/** 是否启用 */
		isEnabled: boolean;
		/** 到期时间 */
		expiresAt?: string;
		/** 分享密码 */
		password?: string;
	}) {
		return (await request.post<ShareConfigDto>("/Share/Save", data)).data!;
	}

	/** 启用或停用指定分享 */
	static async toggle(targetType: ShareTargetType, targetId: BackendIdInput, isEnabled: boolean) {
		return (await request.post<ShareConfigDto>("/Share/Toggle", { targetType, targetId, isEnabled })).data!;
	}

	/** 重新生成分享码，使旧链接失效 */
	static async regenerate(targetType: ShareTargetType, targetId: BackendIdInput) {
		return (await request.post<ShareConfigDto>("/Share/Regenerate", { targetType, targetId })).data!;
	}

	/** 查询匿名分享状态 */
	static async status(shareCode: string) {
		return (await request.get<PublicShareStatusDto>("/PublicShare/Status", { shareCode })).data!;
	}

	/** 校验分享密码并保存浏览器级短期访问令牌 */
	static async verify(shareCode: string, password: string) {
		const data = (await request.post<PublicShareVerifyResultDto>("/PublicShare/Verify", { shareCode, password })).data!;
		storeAccessToken(shareCode, data.accessToken, data.expireMinutes);
	}

	/** 判断当前浏览器是否存在有效的分享访问令牌 */
	static hasAccessToken(shareCode: string) {
		return !!getStoredAccessToken(shareCode);
	}

	/** 获取当前分享的访问令牌 */
	static getAccessToken(shareCode: string) {
		return getStoredAccessToken(shareCode);
	}

	/** 清除当前分享的访问令牌 */
	static clearAccessToken(shareCode: string) {
		localStorage.removeItem(tokenKey(shareCode));
		sessionStorage.removeItem(tokenKey(shareCode));
	}

	/** 查询匿名文件分享信息 */
	static async fileInfo(shareCode: string) {
		return (await request.get<PublicShareFileDto>("/PublicShare/FileInfo", { shareCode }, { headers: headers(shareCode) })).data!;
	}

	/** 查询匿名笔记分享内容 */
	static async note(shareCode: string) {
		return (await request.get<PublicShareNoteDto>("/PublicShare/Note", { shareCode }, { headers: headers(shareCode) })).data!;
	}

	/** 打开匿名文件分享流 */
	static fileContent(shareCode: string) {
		return request.downloadGet("/PublicShare/File", { shareCode }, { headers: headers(shareCode) });
	}

	/** 下载匿名文件分享，兼容旧调用名称 */
	static download(shareCode: string) {
		return this.fileContent(shareCode);
	}

	/** 打开匿名笔记图片分享流 */
	static image(shareCode: string, fileId: string) {
		return request.downloadGet("/PublicShare/NoteImage", { shareCode, fileId }, { headers: headers(shareCode) });
	}
}
