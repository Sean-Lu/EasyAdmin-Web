import { message } from "antd";
import { BackendIdInput } from "@/api/interface";
import { NoteExportType, NoteService } from "@/services/tool/noteService";

export const getNoteExportExtension = (exportType: NoteExportType) => (exportType === "doc" ? "doc" : exportType);

const readDownloadError = async (blob: Blob) => {
	if (!blob.type.toLowerCase().includes("json")) return "";
	const text = await blob.text();
	try {
		const data = JSON.parse(text);
		return data?.msg || data?.message || text;
	} catch {
		return text;
	}
};

const isPdfBlob = async (blob: Blob) => (await blob.slice(0, 4).text()) === "%PDF";

const isZipBlob = async (blob: Blob) => (await blob.slice(0, 2).text()) === "PK";

const getDownloadFileName = (disposition: string, fallbackFileName: string) => {
	const match = disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="?(.+?)"?(;|$)/i);
	return match?.[1] ? decodeURIComponent(match[1].replace(/"/g, "")) : fallbackFileName;
};

const saveDownload = async (
	response: any,
	fallbackFileName: string,
	validate?: (blob: Blob) => Promise<boolean>,
	errorMessage?: string
) => {
	const contentType = response.headers["content-type"] || response.data?.type || "";
	const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
	const downloadError = await readDownloadError(blob);
	if (downloadError) {
		message.error(downloadError);
		return;
	}
	if (validate && !(await validate(blob))) {
		message.error(errorMessage || "导出失败：服务端未返回有效文件");
		return;
	}
	const fileName = getDownloadFileName(response.headers["content-disposition"] || "", fallbackFileName);
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

export const downloadNoteExport = async (
	noteId: BackendIdInput,
	exportType: NoteExportType,
	title?: string,
	unlockToken?: string
) => {
	const response = await NoteService.export(noteId, exportType, unlockToken);
	await saveDownload(
		response,
		`${title || "我的笔记"}.${getNoteExportExtension(exportType)}`,
		exportType === "pdf" ? isPdfBlob : undefined,
		"PDF导出失败：服务端未返回有效的PDF文件"
	);
};

export const downloadBatchNoteExport = async (noteIds: BackendIdInput[], exportType: NoteExportType, unlockToken?: string) => {
	const response = await NoteService.batchExport(noteIds, exportType, unlockToken);
	await saveDownload(response, "我的笔记.zip", isZipBlob, "批量导出失败：服务端未返回有效的压缩包");
};
