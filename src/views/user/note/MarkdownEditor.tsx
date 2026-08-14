import React, { useEffect, useRef, useState } from "react";
import { Button, Segmented, Space, Upload, message } from "antd";
import { BoldOutlined, FileImageOutlined, ItalicOutlined, LinkOutlined } from "@ant-design/icons";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import NoteOutline from "./NoteOutline";

interface MarkdownEditorProps {
	value: string;
	readonly?: boolean;
	isDark?: boolean;
	onChange?: (value: string) => void;
	onUploadImage?: (file: File) => Promise<{ fileId: string; alt: string }>;
	resolveImageUrl: (fileId: string) => Promise<string>;
}

type MarkdownView = "edit" | "preview" | "split";

const NoteImage: React.FC<{ src?: string; alt?: string; resolveImageUrl: (fileId: string) => Promise<string> }> = ({
	src,
	alt,
	resolveImageUrl
}) => {
	const [url, setUrl] = useState("");
	useEffect(() => {
		let active = true;
		let objectUrl = "";
		const fileId = src?.match(/^note-file:(\d+)$/)?.[1];
		if (fileId) {
			void resolveImageUrl(fileId).then(result => {
				objectUrl = result;
				if (active) setUrl(result);
			});
		}
		return () => {
			active = false;
			if (objectUrl) window.URL.revokeObjectURL(objectUrl);
		};
	}, [src, resolveImageUrl]);
	return url ? <img src={url} alt={alt || "笔记图片"} /> : <span className="note-markdown-image-error">图片不可用</span>;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
	value,
	readonly = false,
	isDark = false,
	onChange,
	onUploadImage,
	resolveImageUrl
}) => {
	const editorRef = useRef<ReactCodeMirrorRef>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const [view, setView] = useState<MarkdownView>(readonly ? "preview" : "split");
	const [outlineTriggerHost, setOutlineTriggerHost] = useState<HTMLSpanElement | null>(null);

	const insert = (prefix: string, suffix = prefix, placeholder = "文本") => {
		const editor = editorRef.current?.view;
		if (!editor || !onChange) return;
		const range = editor.state.selection.main;
		const selected = editor.state.sliceDoc(range.from, range.to) || placeholder;
		const text = `${prefix}${selected}${suffix}`;
		editor.dispatch({
			changes: { from: range.from, to: range.to, insert: text },
			selection: { anchor: range.from + text.length }
		});
		onChange(editor.state.doc.toString());
		editor.focus();
	};

	const uploadImage = async (file: File) => {
		if (!onUploadImage) return false;
		try {
			const result = await onUploadImage(file);
			insert(`![${result.alt}](note-file:${result.fileId})`, "", "");
		} catch {
			message.error("图片上传失败");
		}
		return false;
	};

	const preview = (
		<div ref={previewRef} className="note-markdown-preview">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				transformImageUri={url => (url.startsWith("note-file:") ? url : "")}
				components={{ img: props => <NoteImage {...props} resolveImageUrl={resolveImageUrl} /> }}
			>
				{value}
			</ReactMarkdown>
		</div>
	);
	const viewSwitcher = (
		<Segmented
			value={view}
			onChange={value => setView(value as MarkdownView)}
			options={
				readonly
					? [{ label: "预览", value: "preview" }]
					: [
							{ label: "编辑", value: "edit" },
							{ label: "预览", value: "preview" },
							{ label: "分屏", value: "split" }
					  ]
			}
		/>
	);

	return (
		<div className={`note-markdown-editor note-markdown-editor-${view}`}>
			<div className="note-markdown-toolbar">
				{!readonly && (
					<Space>
						<Button icon={<BoldOutlined />} onClick={() => insert("**")} />
						<Button icon={<ItalicOutlined />} onClick={() => insert("*")} />
						<Button icon={<LinkOutlined />} onClick={() => insert("[", "](https://)", "链接文字")} />
						<Upload showUploadList={false} beforeUpload={uploadImage} accept="image/*">
							<Button icon={<FileImageOutlined />}>图片</Button>
						</Upload>
					</Space>
				)}
				{readonly && viewSwitcher}
				{readonly ? (
					<span ref={setOutlineTriggerHost} className="note-outline-trigger-host" />
				) : (
					<Space>
						{viewSwitcher}
						<span ref={setOutlineTriggerHost} className="note-outline-trigger-host" />
					</Space>
				)}
			</div>
			<div className={`note-markdown-body note-markdown-${view}`}>
				{view !== "preview" && (
					<CodeMirror
						ref={editorRef}
						className="note-markdown-codemirror"
						value={value}
						height="100%"
						theme={isDark ? "dark" : "light"}
						extensions={[markdown()]}
						onChange={next => onChange?.(next)}
					/>
				)}
				{view !== "edit" && (
					<div className="note-markdown-preview-pane">
						{preview}
						<NoteOutline
							contentRef={previewRef}
							contentVersion={value}
							idPrefix="note-markdown-heading"
							isDark={isDark}
							scrollContainerRef={previewRef}
							triggerHost={outlineTriggerHost}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default MarkdownEditor;
