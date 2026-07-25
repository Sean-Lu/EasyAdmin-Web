import React, { useMemo } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import lightTheme from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import darkTheme from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import less from "react-syntax-highlighter/dist/esm/languages/prism/less";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { csharp as csharpMode, java as javaMode } from "@codemirror/legacy-modes/mode/clike";
import { useSelector } from "react-redux";
import { GlobalState } from "@/redux/interface";
import { CodeLanguage } from "./languages";
import "./index.less";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("less", less);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("sql", sql);

interface CodeBlockBaseProps {
	code: string;
	language?: CodeLanguage;
	className?: string;
}

type CodeBlockProps =
	| (CodeBlockBaseProps & { editable?: false; onChange?: never })
	| (CodeBlockBaseProps & { editable: true; onChange: (value: string) => void });

interface CodeBlockReduxState {
	global: GlobalState;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "text", editable = false, onChange, className = "" }) => {
	const isDark = useSelector((state: CodeBlockReduxState) => state.global.themeConfig.isDark);
	const editorLanguage = useMemo(() => {
		if (language === "java") return StreamLanguage.define(javaMode);
		if (language === "csharp") return StreamLanguage.define(csharpMode);
		return undefined;
	}, [language]);

	if (editable) {
		return (
			<div className={`code-block-editor ${className}`}>
				<CodeMirror
					value={code}
					onChange={onChange}
					extensions={editorLanguage ? [editorLanguage] : []}
					theme={isDark ? "dark" : "light"}
					basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
				/>
			</div>
		);
	}

	if (language === "text") {
		return <pre className={`code-block-plain ${className}`}>{code}</pre>;
	}

	return (
		<SyntaxHighlighter
			language={language}
			style={isDark ? darkTheme : lightTheme}
			className={`code-block ${className}`}
			customStyle={{ margin: 0, padding: "16px 20px", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
		>
			{code}
		</SyntaxHighlighter>
	);
};

export default CodeBlock;
