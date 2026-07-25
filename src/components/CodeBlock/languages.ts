export type CodeLanguage =
	| "csharp"
	| "css"
	| "html"
	| "java"
	| "javascript"
	| "json"
	| "less"
	| "markdown"
	| "sql"
	| "text"
	| "typescript";

const languageByExtension: Record<string, CodeLanguage> = {
	cs: "csharp",
	css: "css",
	html: "html",
	java: "java",
	js: "javascript",
	jsx: "javascript",
	json: "json",
	less: "less",
	md: "markdown",
	sql: "sql",
	ts: "typescript",
	tsx: "typescript",
	xhtml: "html"
};

export const detectCodeLanguage = (fileName: string): CodeLanguage => {
	const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
	return languageByExtension[extension] ?? "text";
};
