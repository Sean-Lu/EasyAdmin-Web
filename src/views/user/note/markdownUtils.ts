const NOTE_IMAGE_PATTERN = /!\[[^\]]*\]\(note-file:(\d+)\)/gi;
const MAX_MARKDOWN_FILE_SIZE = 1024 * 1024;

export const extractNoteImageIds = (markdown: string) => {
	const ids: string[] = [];
	for (const match of markdown.matchAll(NOTE_IMAGE_PATTERN)) {
		if (!ids.includes(match[1])) ids.push(match[1]);
	}
	return ids;
};

export const readMarkdownFile = async (file: File) => {
	if (file.name.toLowerCase().endsWith(".md") === false) throw new Error("请选择 .md 文件");
	if (file.size > MAX_MARKDOWN_FILE_SIZE) throw new Error("Markdown 文件不能超过 1MB");
	const contentMarkdown = (await file.text()).replace(/^\uFEFF/, "");
	return {
		title: file.name.replace(/\.md$/i, "") || "未命名笔记",
		contentMarkdown
	};
};
