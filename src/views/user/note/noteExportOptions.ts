import type { NoteBatchExportType } from "@/services/tool/noteService";

export type NoteListExportType = NoteBatchExportType;

const standardItems: { key: NoteListExportType; label: string }[] = [
	{ key: "html", label: "HTML" },
	{ key: "doc", label: "Word" },
	{ key: "pdf", label: "PDF" }
];

export const getNoteExportMenuItems = (contentType: number) =>
	contentType === 1
		? [
				...standardItems,
				{ key: "markdown" as const, label: "Markdown" },
				{ key: "markdownPackage" as const, label: "Markdown资源包" }
		  ]
		: standardItems;

export const getBatchNoteExportMenuItems = (contentTypes: number[]) =>
	contentTypes.length > 0 && contentTypes.every(contentType => contentType === 1) ? getNoteExportMenuItems(1) : standardItems;

export const isMarkdownExportType = (exportType: NoteListExportType): exportType is "markdown" | "markdownPackage" =>
	exportType === "markdown" || exportType === "markdownPackage";
