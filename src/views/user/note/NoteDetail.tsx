import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Switch, Tooltip, message } from "antd";
import {
	AlignCenterOutlined,
	AlignLeftOutlined,
	AlignRightOutlined,
	ArrowLeftOutlined,
	BoldOutlined,
	ClearOutlined,
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	FileImageOutlined,
	ItalicOutlined,
	LinkOutlined,
	MinusOutlined,
	OrderedListOutlined,
	RedoOutlined,
	SaveOutlined,
	StrikethroughOutlined,
	UnderlineOutlined,
	UndoOutlined,
	UnorderedListOutlined
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { FileBizType, FileStoreType, getFileObjectUrl, uploadFile } from "@/services/system/fileService";
import { NoteCategoryDto, NoteCategoryService, NoteDto, NoteService, NoteUpdateDto } from "@/services/tool/noteService";
import "./note.less";

interface NoteDetailProps {
	noteId?: string;
	unlockToken?: string;
	defaultCategoryId?: string;
	readonly?: boolean;
	onBack: () => void;
	onEdit?: () => void;
	onSaved?: () => void;
}

const fontSizeOptions = [
	{ label: "12", value: "12" },
	{ label: "14", value: "14" },
	{ label: "16", value: "16" },
	{ label: "18", value: "18" },
	{ label: "20", value: "20" },
	{ label: "24", value: "24" },
	{ label: "32", value: "32" }
];

interface ImageRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

interface ResizeState {
	startX: number;
	startWidth: number;
	aspectRatio: number;
	image: HTMLImageElement;
}

// 笔记详情页
const NoteDetail: React.FC<NoteDetailProps> = ({
	noteId = "",
	unlockToken = "",
	defaultCategoryId = "",
	readonly = false,
	onBack,
	onEdit,
	onSaved
}) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const editorRef = useRef<HTMLDivElement>(null);
	const editorShellRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const selectionRef = useRef<Range | null>(null);
	const objectUrlsRef = useRef<string[]>([]);
	const uploadedImageIdsRef = useRef<Set<string>>(new Set());
	const savedRef = useRef(false);
	const selectedImageRef = useRef<HTMLImageElement | null>(null);
	const resizeStateRef = useRef<ResizeState | null>(null);
	const [form] = Form.useForm();
	const [linkForm] = Form.useForm();
	const [categories, setCategories] = useState<NoteCategoryDto[]>([]);
	const [note, setNote] = useState<NoteDto | null>(null);
	const [linkModalOpen, setLinkModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [selectedImageRect, setSelectedImageRect] = useState<ImageRect | null>(null);

	useEffect(() => {
		void init();
	}, [noteId, unlockToken]);

	useEffect(() => {
		return () => {
			if (!savedRef.current) {
				void cleanupUploadedImages();
			}
			revokeEditorImageUrls();
		};
	}, []);

	useEffect(() => {
		if (!note) return;
		if (readonly) {
			void hydratePreviewImages();
			return;
		}
		if (editorRef.current) {
			editorRef.current.innerHTML = note.contentHtml || "";
			void hydrateEditorImages();
		}
	}, [readonly, note?.contentHtml]);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			const resizeState = resizeStateRef.current;
			if (!resizeState) return;
			const nextWidth = Math.max(80, resizeState.startWidth + event.clientX - resizeState.startX);
			resizeState.image.style.width = `${Math.round(nextWidth)}px`;
			resizeState.image.style.height = `${Math.round(nextWidth / resizeState.aspectRatio)}px`;
			updateSelectedImageRect();
		};
		const handleMouseUp = () => {
			resizeStateRef.current = null;
			updateSelectedImageRect();
		};
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	const init = async () => {
		const categoryList = await NoteCategoryService.list();
		setCategories(categoryList);
		if (noteId) {
			setLoading(true);
			try {
				const detail = await NoteService.detail(noteId, unlockToken);
				setNote(detail);
				form.setFieldsValue({
					title: detail.title,
					categoryId: String(detail.categoryId),
					tags: (detail.tags || []).map(tag => tag.name),
					isTop: detail.isTop,
					isProtected: detail.isProtected
				});
				if (!readonly && editorRef.current) {
					editorRef.current.innerHTML = detail.contentHtml || "";
					await hydrateEditorImages();
				}
			} finally {
				setLoading(false);
			}
		} else {
			form.setFieldsValue({
				title: "",
				categoryId: defaultCategoryId || (categoryList[0]?.id ? String(categoryList[0].id) : ""),
				tags: [],
				isTop: false,
				isProtected: false
			});
		}
	};

	const backToList = async () => {
		await cleanupUploadedImages();
		onBack();
	};

	const isNodeInEditor = (node: Node | null) => !!node && !!editorRef.current?.contains(node);

	const saveSelection = () => {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
		const node = selection.anchorNode;
		if (isNodeInEditor(node)) {
			selectionRef.current = selection.getRangeAt(0).cloneRange();
		}
	};

	// 工具栏按钮会抢走 contentEditable 的焦点，执行命令前需要恢复或创建一个可用选区。
	const ensureEditorSelection = () => {
		const editor = editorRef.current;
		const selection = window.getSelection();
		if (!editor || !selection) return;

		editor.focus();
		if (selectionRef.current && isNodeInEditor(selectionRef.current.commonAncestorContainer)) {
			selection.removeAllRanges();
			selection.addRange(selectionRef.current);
			return;
		}
		selectionRef.current = null;

		if (selection.rangeCount > 0 && isNodeInEditor(selection.anchorNode)) {
			selectionRef.current = selection.getRangeAt(0).cloneRange();
			return;
		}

		const range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
		selectionRef.current = range.cloneRange();
	};

	const exec = (command: string, value?: string) => {
		ensureEditorSelection();
		document.execCommand(command, false, value);
		editorRef.current?.focus();
		saveSelection();
	};

	const insertHtml = (html: string) => {
		ensureEditorSelection();
		document.execCommand("insertHTML", false, html);
		editorRef.current?.focus();
		saveSelection();
	};

	const insertNodeAtSelection = (node: Node) => {
		ensureEditorSelection();
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
		const range = selection.getRangeAt(0);
		if (!isNodeInEditor(range.commonAncestorContainer)) return;
		range.deleteContents();
		range.insertNode(node);
		setCursorAfterNode(node);
		editorRef.current.focus();
		saveSelection();
	};

	function updateSelectedImageRect() {
		const image = selectedImageRef.current;
		const shell = editorShellRef.current;
		if (!image || !shell || !document.body.contains(image)) {
			setSelectedImageRect(null);
			return;
		}
		const imageRect = image.getBoundingClientRect();
		const shellRect = shell.getBoundingClientRect();
		setSelectedImageRect({
			top: imageRect.top - shellRect.top + shell.scrollTop,
			left: imageRect.left - shellRect.left + shell.scrollLeft,
			width: imageRect.width,
			height: imageRect.height
		});
	}

	const clearSelectedImage = () => {
		selectedImageRef.current = null;
		setSelectedImageRect(null);
	};

	const selectImage = (image: HTMLImageElement) => {
		selectedImageRef.current = image;
		window.requestAnimationFrame(updateSelectedImageRect);
	};

	const setCursorAfterNode = (node: Node) => {
		const selection = window.getSelection();
		if (!selection) return;
		const range = document.createRange();
		range.setStartAfter(node);
		range.collapse(true);
		selection.removeAllRanges();
		selection.addRange(range);
		selectionRef.current = range.cloneRange();
	};

	const getSavedEditorRange = () => {
		const range = selectionRef.current?.cloneRange();
		if (range && isNodeInEditor(range.commonAncestorContainer)) return range;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return null;
		const currentRange = selection.getRangeAt(0).cloneRange();
		return isNodeInEditor(currentRange.commonAncestorContainer) ? currentRange : null;
	};

	const cleanupEmptyInlineElements = () => {
		editorRef.current?.querySelectorAll("a,b,strong,i,em,span,u,s,strike").forEach(element => {
			if (!element.textContent && element.children.length === 0) {
				element.remove();
			}
		});
	};

	const escapeHtml = (value: string) =>
		value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

	const getClosestEditableBlock = (node: Node | null) => {
		if (!node || !editorRef.current) return null;
		let element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
		while (element && element !== editorRef.current) {
			if (["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE"].includes(element.tagName)) {
				return element;
			}
			element = element.parentElement;
		}
		return null;
	};

	const clearFormat = () => {
		ensureEditorSelection();
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
		const range = selection.getRangeAt(0);
		if (!isNodeInEditor(range.commonAncestorContainer)) return;

		if (selection.isCollapsed) {
			const block = getClosestEditableBlock(selection.anchorNode);
			if (!block || block === editorRef.current) return;
			const paragraph = document.createElement("p");
			paragraph.textContent = block.textContent || "";
			block.replaceWith(paragraph);
			setCursorAfterNode(paragraph);
			return;
		}

		const text = selection.toString();
		if (!text) return;
		const lines = text.split(/\r?\n/);
		const html = lines.length > 1 ? lines.map(line => `<p>${line ? escapeHtml(line) : "<br />"}</p>`).join("") : escapeHtml(text);
		document.execCommand("insertHTML", false, html);
		cleanupEmptyInlineElements();
		editorRef.current.focus();
		saveSelection();
	};

	const applyFontSize = (fontSize?: string) => {
		if (!fontSize) return;
		ensureEditorSelection();
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !editorRef.current) {
			message.warning("请先选择需要调整字号的文字");
			return;
		}
		const range = selection.getRangeAt(0);
		if (!isNodeInEditor(range.commonAncestorContainer)) return;
		const span = document.createElement("span");
		span.style.fontSize = `${fontSize}px`;
		span.appendChild(range.extractContents());
		range.insertNode(span);
		setCursorAfterNode(span);
		editorRef.current.focus();
		saveSelection();
	};

	const openLinkModal = () => {
		ensureEditorSelection();
		saveSelection();
		linkForm.setFieldsValue({ href: "" });
		setLinkModalOpen(true);
	};

	const confirmLink = async () => {
		const values = await linkForm.validateFields();
		const range = getSavedEditorRange();
		if (!range || !editorRef.current) return;
		const link = document.createElement("a");
		link.href = values.href;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		if (range.collapsed) {
			link.textContent = values.href;
		} else {
			link.appendChild(range.extractContents());
		}
		range.insertNode(link);
		setCursorAfterNode(link);
		editorRef.current.focus();
		saveSelection();
		setLinkModalOpen(false);
	};

	const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		if (target.tagName === "IMG") {
			selectImage(target as HTMLImageElement);
			return;
		}
		clearSelectedImage();
	};

	const startImageResize = (event: React.MouseEvent<HTMLSpanElement>) => {
		event.preventDefault();
		event.stopPropagation();
		const image = selectedImageRef.current;
		if (!image) return;
		const rect = image.getBoundingClientRect();
		resizeStateRef.current = {
			startX: event.clientX,
			startWidth: rect.width,
			aspectRatio: rect.width / rect.height,
			image
		};
	};

	const deleteSelectedImage = () => {
		const image = selectedImageRef.current;
		if (!image) return;
		const selection = window.getSelection();
		const range = document.createRange();
		range.setStartBefore(image);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
		image.remove();
		selectionRef.current = range.cloneRange();
		clearSelectedImage();
	};

	const resetSelectedImageSize = () => {
		const image = selectedImageRef.current;
		if (!image) return;
		image.style.width = "";
		image.style.height = "";
		image.removeAttribute("width");
		image.removeAttribute("height");
		window.requestAnimationFrame(updateSelectedImageRect);
	};

	const escapeAttr = (value: string) =>
		value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

	const getImageFileIdsFromHtml = (html: string) => {
		const container = document.createElement("div");
		container.innerHTML = html;
		return new Set(
			Array.from(container.querySelectorAll<HTMLImageElement>("img[data-file-id]"))
				.map(image => image.dataset.fileId || "")
				.filter(Boolean)
		);
	};

	const cleanupUploadedImages = async (keepIds = new Set<string>()) => {
		const ids = Array.from(uploadedImageIdsRef.current).filter(fileId => !keepIds.has(fileId));
		if (ids.length === 0) return;

		await Promise.allSettled(ids.map(fileId => NoteService.deleteImageFile(fileId)));
		ids.forEach(fileId => uploadedImageIdsRef.current.delete(fileId));
	};

	const markUploadedImagesAsSaved = (savedImageIds: Set<string>) => {
		savedImageIds.forEach(fileId => uploadedImageIdsRef.current.delete(fileId));
	};

	const revokeEditorImageUrls = () => {
		objectUrlsRef.current.forEach(url => window.URL.revokeObjectURL(url));
		objectUrlsRef.current = [];
	};

	// 笔记内容只保存文件ID，打开时再通过授权下载接口生成临时预览地址。
	const hydrateEditorImages = async () => {
		await hydrateImages(editorRef.current);
	};

	const hydratePreviewImages = async () => {
		await hydrateImages(previewRef.current);
	};

	const hydrateImages = async (container: HTMLElement | null) => {
		if (!container) return;
		revokeEditorImageUrls();
		const images = Array.from(container.querySelectorAll<HTMLImageElement>("img[data-file-id]"));
		for (const image of images) {
			const fileId = image.dataset.fileId;
			if (!fileId) continue;
			try {
				const objectUrl = await getFileObjectUrl(fileId);
				objectUrlsRef.current.push(objectUrl);
				image.src = objectUrl;
			} catch {
				image.alt = image.alt || "图片加载失败";
			}
		}
	};

	// 避免把本次浏览器会话里的 blob 地址保存到数据库。
	const getContentHtmlForSave = () => {
		const editor = editorRef.current;
		if (!editor) return "";
		const clone = editor.cloneNode(true) as HTMLDivElement;
		clone.querySelectorAll<HTMLImageElement>("img[data-file-id]").forEach(image => {
			image.setAttribute("src", "");
		});
		clone.querySelectorAll<HTMLImageElement>("img:not([data-file-id])").forEach(image => {
			image.remove();
		});
		return clone.innerHTML;
	};

	const isSelectionInList = () => {
		const selection = window.getSelection();
		const node = selection?.anchorNode;
		if (!node || !editorRef.current?.contains(node)) return false;
		let element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
		while (element && element !== editorRef.current) {
			if (["LI", "UL", "OL"].includes(element.tagName)) return true;
			element = element.parentElement;
		}
		return false;
	};

	// Tab 在列表中用于缩进，在普通段落中插入一个可见缩进。
	const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab") return;
		event.preventDefault();
		if (event.shiftKey) {
			exec("outdent");
			return;
		}
		if (isSelectionInList()) {
			exec("indent");
			return;
		}
		insertHtml("&emsp;");
	};

	const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		try {
			const result = await uploadFile(file, FileStoreType.LocalFile, "笔记图片", FileBizType.NoteImage);
			const fileId = result.data?.id;
			if (!fileId) {
				message.error("图片上传成功但未返回文件ID");
				return;
			}
			const src = window.URL.createObjectURL(file);
			objectUrlsRef.current.push(src);
			uploadedImageIdsRef.current.add(String(fileId));
			const image = document.createElement("img");
			image.src = src;
			image.dataset.fileId = String(fileId);
			image.alt = file.name;
			insertNodeAtSelection(image);
			message.success("图片已插入");
		} finally {
			event.target.value = "";
		}
	};

	const save = async () => {
		if (readonly) return;
		const values = await form.validateFields();
		const contentHtml = getContentHtmlForSave();
		const savedImageIds = getImageFileIdsFromHtml(contentHtml);
		const data: NoteUpdateDto = {
			id: noteId || undefined,
			title: values.title,
			categoryId: values.categoryId,
			contentHtml,
			isTop: !!values.isTop,
			isProtected: !!values.isProtected,
			tags: values.tags || []
		};
		setSaving(true);
		try {
			if (noteId) {
				await NoteService.update(data);
				message.success("笔记已保存");
			} else {
				await NoteService.add(data);
				message.success("笔记已创建");
			}
			markUploadedImagesAsSaved(savedImageIds);
			await cleanupUploadedImages();
			savedRef.current = true;
			onSaved?.();
		} finally {
			setSaving(false);
		}
	};

	const exportNote = async (exportType: "html" | "doc") => {
		if (!noteId) {
			message.warning("请先保存笔记再导出");
			return;
		}
		const response = await NoteService.export(noteId, exportType, unlockToken);
		const disposition = response.headers["content-disposition"] || "";
		const match = disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="?(.+?)"?(;|$)/i);
		const fileName = match?.[1]
			? decodeURIComponent(match[1].replace(/"/g, ""))
			: `${note?.title || "我的笔记"}.${exportType === "doc" ? "doc" : "html"}`;
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	return (
		<div className={`note-page note-detail-panel${isDark ? " note-dark" : ""}`}>
			<div className="note-detail-header">
				<Space>
					<Button icon={<ArrowLeftOutlined />} onClick={() => void backToList()}>
						返回
					</Button>
					<strong>{readonly ? "查看笔记" : noteId ? "编辑笔记" : "新建笔记"}</strong>
				</Space>
				<Space>
					<Button icon={<DownloadOutlined />} onClick={() => exportNote("html")}>
						HTML
					</Button>
					<Button icon={<DownloadOutlined />} onClick={() => exportNote("doc")}>
						Word
					</Button>
					{readonly && onEdit && (
						<Button icon={<EditOutlined />} onClick={onEdit}>
							编辑
						</Button>
					)}
					{!readonly && (
						<Button type="primary" icon={<SaveOutlined />} loading={saving || loading} onClick={save}>
							保存
						</Button>
					)}
				</Space>
			</div>

			<Form form={form} layout="vertical">
				<Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入笔记标题" }]}>
					<Input maxLength={200} disabled={readonly} placeholder="例如：今日复盘、健康记录、生活日记" />
				</Form.Item>
				<Space style={{ width: "100%" }} align="start">
					<Form.Item name="categoryId" label="分类" rules={[{ required: true, message: "请选择分类" }]}>
						<Select disabled={readonly} style={{ width: 180 }}>
							{categories.map(category => (
								<Select.Option key={category.id} value={String(category.id)}>
									{category.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name="tags" label="标签">
						<Select
							disabled={readonly}
							mode="tags"
							style={{ width: 320 }}
							tokenSeparators={[",", "，"]}
							placeholder="输入后回车添加标签"
						/>
					</Form.Item>
					<Form.Item name="isTop" label="置顶" valuePropName="checked">
						<Switch disabled={readonly} />
					</Form.Item>
					<Form.Item name="isProtected" label="需要密码打开" valuePropName="checked">
						<Switch disabled={readonly} />
					</Form.Item>
				</Space>
			</Form>

			{!readonly && (
				<>
					<div className="note-editor-toolbar" onMouseDown={event => event.preventDefault()}>
						<Tooltip title="撤销">
							<Button icon={<UndoOutlined />} onClick={() => exec("undo")} />
						</Tooltip>
						<Tooltip title="重做">
							<Button icon={<RedoOutlined />} onClick={() => exec("redo")} />
						</Tooltip>
						<Tooltip title="加粗">
							<Button icon={<BoldOutlined />} onClick={() => exec("bold")} />
						</Tooltip>
						<Tooltip title="斜体">
							<Button icon={<ItalicOutlined />} onClick={() => exec("italic")} />
						</Tooltip>
						<Tooltip title="下划线">
							<Button icon={<UnderlineOutlined />} onClick={() => exec("underline")} />
						</Tooltip>
						<Tooltip title="删除线">
							<Button icon={<StrikethroughOutlined />} onClick={() => exec("strikeThrough")} />
						</Tooltip>
						<Select
							allowClear
							className="note-font-size-select"
							options={fontSizeOptions}
							placeholder="字号"
							onChange={applyFontSize}
						/>
						<Tooltip title="正文">
							<Button onClick={() => exec("formatBlock", "<p>")}>正文</Button>
						</Tooltip>
						<Tooltip title="二级标题">
							<Button onClick={() => exec("formatBlock", "<h2>")}>二级标题</Button>
						</Tooltip>
						<Tooltip title="三级标题">
							<Button onClick={() => exec("formatBlock", "<h3>")}>三级标题</Button>
						</Tooltip>
						<Tooltip title="无序列表">
							<Button icon={<UnorderedListOutlined />} onClick={() => exec("insertUnorderedList")} />
						</Tooltip>
						<Tooltip title="有序列表">
							<Button icon={<OrderedListOutlined />} onClick={() => exec("insertOrderedList")} />
						</Tooltip>
						<Tooltip title="减少缩进">
							<Button onClick={() => exec("outdent")}>减少缩进</Button>
						</Tooltip>
						<Tooltip title="增加缩进">
							<Button onClick={() => exec("indent")}>增加缩进</Button>
						</Tooltip>
						<Tooltip title="左对齐">
							<Button icon={<AlignLeftOutlined />} onClick={() => exec("justifyLeft")} />
						</Tooltip>
						<Tooltip title="居中对齐">
							<Button icon={<AlignCenterOutlined />} onClick={() => exec("justifyCenter")} />
						</Tooltip>
						<Tooltip title="右对齐">
							<Button icon={<AlignRightOutlined />} onClick={() => exec("justifyRight")} />
						</Tooltip>
						<Tooltip title="插入链接">
							<Button icon={<LinkOutlined />} onClick={openLinkModal} />
						</Tooltip>
						<Tooltip title="插入分割线">
							<Button icon={<MinusOutlined />} onClick={() => exec("insertHorizontalRule")} />
						</Tooltip>
						<Tooltip title="清除格式">
							<Button icon={<ClearOutlined />} onClick={clearFormat} />
						</Tooltip>
						<Tooltip title="插入图片">
							<Button icon={<FileImageOutlined />} onClick={() => imageInputRef.current?.click()}>
								图片
							</Button>
						</Tooltip>
						<input ref={imageInputRef} hidden type="file" accept="image/*" onChange={handleImageChange} />
					</div>
					<div ref={editorShellRef} className="note-editor-shell">
						<div
							ref={editorRef}
							className="note-editor"
							contentEditable
							suppressContentEditableWarning
							onBlur={saveSelection}
							onClick={handleEditorClick}
							onInput={saveSelection}
							onKeyUp={saveSelection}
							onMouseUp={event => {
								saveSelection();
								if ((event.target as HTMLElement).tagName === "IMG") updateSelectedImageRect();
							}}
							onKeyDown={handleEditorKeyDown}
							onScroll={updateSelectedImageRect}
						/>
						{selectedImageRect && (
							<div
								className="note-image-selection"
								style={{
									top: selectedImageRect.top,
									left: selectedImageRect.left,
									width: selectedImageRect.width,
									height: selectedImageRect.height
								}}
							>
								<span className="note-image-resize note-image-resize-nw" onMouseDown={startImageResize} />
								<span className="note-image-resize note-image-resize-ne" onMouseDown={startImageResize} />
								<span className="note-image-resize note-image-resize-sw" onMouseDown={startImageResize} />
								<span className="note-image-resize note-image-resize-se" onMouseDown={startImageResize} />
								<div className="note-image-tools" onMouseDown={event => event.preventDefault()}>
									<Button size="small" onClick={resetSelectedImageSize}>
										原始尺寸
									</Button>
									<Button danger size="small" icon={<DeleteOutlined />} onClick={deleteSelectedImage}>
										删除
									</Button>
								</div>
							</div>
						)}
					</div>
				</>
			)}
			{readonly && (
				<div ref={previewRef} className="note-preview" dangerouslySetInnerHTML={{ __html: note?.contentHtml || "" }} />
			)}
			<Modal
				title="插入链接"
				open={linkModalOpen}
				onCancel={() => setLinkModalOpen(false)}
				onOk={() => void confirmLink()}
				destroyOnHidden
			>
				<Form form={linkForm} layout="vertical">
					<Form.Item
						name="href"
						label="链接地址"
						rules={[
							{ required: true, message: "请输入链接地址" },
							{ type: "url", warningOnly: true, message: "建议输入完整链接，例如：https://example.com" }
						]}
					>
						<Input placeholder="https://example.com" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default NoteDetail;
