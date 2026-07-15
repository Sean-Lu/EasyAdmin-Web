import request from "@/api/index";
import { BackendIdInput } from "@/api/interface";
import { NoteContentType } from "@/services/tool/noteService";

export enum ShareTargetType {
	File = 0,
	Note = 1
}

export interface ShareConfigDto {
	exists: boolean;
	shareCode?: string;
	isEnabled: boolean;
	expiresAt?: string;
	hasPassword: boolean;
	password?: string;
}

export interface PublicShareStatusDto {
	targetType: ShareTargetType;
	requiresPassword: boolean;
}

export interface PublicShareFileDto {
	ownerName: string;
	name: string;
	size: number;
	contentType?: string;
	expiresAt?: string;
}

export interface PublicShareNoteDto {
	ownerName: string;
	title: string;
	contentType: NoteContentType;
	contentHtml?: string;
	categoryName?: string;
	tags: string[];
	updateTime?: string;
	expiresAt?: string;
}

const tokenKey = (shareCode: string) => `share-access-token:${shareCode}`;
const headers = (shareCode: string): Record<string, string> => {
	const accessToken = sessionStorage.getItem(tokenKey(shareCode));
	return accessToken ? { "X-Share-Access-Token": accessToken } : {};
};

export class ShareService {
	static async config(targetType: ShareTargetType, targetId: BackendIdInput) {
		return (await request.get<ShareConfigDto>("/Share/Config", { targetType, targetId })).data!;
	}

	static async save(data: {
		targetType: ShareTargetType;
		targetId: BackendIdInput;
		isEnabled: boolean;
		expiresAt?: string;
		password?: string;
	}) {
		return (await request.post<ShareConfigDto>("/Share/Save", data)).data!;
	}

	static async toggle(targetType: ShareTargetType, targetId: BackendIdInput, isEnabled: boolean) {
		return (await request.post<ShareConfigDto>("/Share/Toggle", { targetType, targetId, isEnabled })).data!;
	}

	static async regenerate(targetType: ShareTargetType, targetId: BackendIdInput) {
		return (await request.post<ShareConfigDto>("/Share/Regenerate", { targetType, targetId })).data!;
	}

	static async status(shareCode: string) {
		return (await request.get<PublicShareStatusDto>("/PublicShare/Status", { shareCode })).data!;
	}

	static async verify(shareCode: string, password: string) {
		const data = (await request.post<{ accessToken: string }>("/PublicShare/Verify", { shareCode, password })).data!;
		sessionStorage.setItem(tokenKey(shareCode), data.accessToken);
	}

	static hasAccessToken(shareCode: string) {
		return !!sessionStorage.getItem(tokenKey(shareCode));
	}

	static clearAccessToken(shareCode: string) {
		sessionStorage.removeItem(tokenKey(shareCode));
	}

	static async fileInfo(shareCode: string) {
		return (await request.get<PublicShareFileDto>("/PublicShare/FileInfo", { shareCode }, { headers: headers(shareCode) })).data!;
	}

	static async note(shareCode: string) {
		return (await request.get<PublicShareNoteDto>("/PublicShare/Note", { shareCode }, { headers: headers(shareCode) })).data!;
	}

	static fileContent(shareCode: string) {
		return request.downloadGet("/PublicShare/File", { shareCode }, { headers: headers(shareCode) });
	}

	static download(shareCode: string) {
		return this.fileContent(shareCode);
	}

	static image(shareCode: string, fileId: string) {
		return request.downloadGet("/PublicShare/NoteImage", { shareCode, fileId }, { headers: headers(shareCode) });
	}
}
