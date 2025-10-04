import http from "../../api/index";
import { ApiResult, PageReqBase, PageRes } from "@/api/interface";

/**
 * 文件存储类型
 */
export enum FileStoreType {
	/** 本地文件 */
	LocalFile = 0
}

export interface FileDto {
	id: string;
	name: string;
	path: string;
	size: number;
	contentType: string;
	storeType: FileStoreType;
	createTime: string;
	description?: string;
}

export interface FilePageReqDto extends PageReqBase {
	name?: string;
	description?: string;
}

// export interface FileItem extends FileDto {
// 	// 可以根据需要添加前端特有的属性
// }

// 分页查询文件列表
export const getFiles = async (params: FilePageReqDto): Promise<PageRes<FileDto>> => {
	const response = await http.get<PageRes<FileDto>>("/file/page", { ...params });
	return response.data!;
};

// 获取文件详情
export const getFileById = async (id: string): Promise<ApiResult<FileDto>> => {
	return await http.get<FileDto>(`/file/detail`, { id: id });
};

// 上传文件
export const uploadFile = async (file: File, description: string): Promise<ApiResult<FileDto>> => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("description", description || "");

	return await http.post<FileDto>("/file/uploadfile", formData, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
};

// 下载文件
export const downloadFile = async (id: string): Promise<void> => {
	try {
		const response = await http.downloadGet("/file/downloadfile", { id });

		// 根据响应头获取文件名
		const contentDisposition = response.headers["content-disposition"];
		let fileName = `file-${id}`;
		if (contentDisposition) {
			// 优先尝试获取RFC 5987编码的文件名(filename*)
			const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
			if (utf8FilenameMatch && utf8FilenameMatch[1]) {
				fileName = decodeURIComponent(utf8FilenameMatch[1]);
			} else {
				// 退回到普通filename
				const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
				if (filenameMatch && filenameMatch[1]) {
					fileName = filenameMatch[1].replace(/"/g, "");
				}
			}
		}

		// 创建下载链接
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();

		// 清理
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error("下载文件出错:", error);
		throw error;
	}
};

// 删除文件
export const deleteFile = async (id: string): Promise<ApiResult<boolean>> => {
	return await http.delete<boolean>("/file/deletefile", { id: id });
};
