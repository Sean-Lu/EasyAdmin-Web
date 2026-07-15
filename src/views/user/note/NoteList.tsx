import React, { useEffect, useRef, useState } from "react";
import { Button, Dropdown, Form, Input, Modal, Select, Space, Table, Tag, Tooltip, message } from "antd";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	EyeOutlined,
	FolderOpenOutlined,
	LockOutlined,
	PlusOutlined,
	SearchOutlined,
	ShareAltOutlined,
	StarFilled,
	StarOutlined,
	UnlockOutlined,
	UploadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { BackendIdInput } from "@/api/interface";
import {
	NoteCategoryDto,
	NoteBatchExportType,
	NoteCategoryService,
	NoteContentType,
	NoteDto,
	NoteExportType,
	NotePageReqDto,
	NotePasswordService,
	NoteService,
	NoteTagDto,
	NoteTagService
} from "@/services/tool/noteService";
import NoteDetail, { NoteDraft } from "./NoteDetail";
import NotePassword from "./NotePassword";
import { downloadBatchNoteExport, downloadNoteExport } from "./noteExport";
import { downloadMarkdownExport } from "./noteExport";
import ShareDialog from "@/components/ShareDialog";
import { ShareTargetType } from "@/services/share/shareService";
import {
	getBatchNoteExportMenuItems,
	getNoteExportMenuItems,
	isMarkdownExportType,
	NoteListExportType
} from "./noteExportOptions";
import { readMarkdownFile } from "./markdownUtils";
import "./note.less";

const { confirm } = Modal;
type NoteView = "list" | "detail" | "password";

// 笔记列表页
const NoteList: React.FC = () => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [categories, setCategories] = useState<NoteCategoryDto[]>([]);
	const [tags, setTags] = useState<NoteTagDto[]>([]);
	const [notes, setNotes] = useState<NoteDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
	const [searchForm] = Form.useForm();
	const [categoryForm] = Form.useForm();
	const [categoryModalOpen, setCategoryModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<NoteCategoryDto | null>(null);
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [passwordForm] = Form.useForm();
	const [pendingNote, setPendingNote] = useState<NoteDto | null>(null);
	const [pendingExportType, setPendingExportType] = useState<NoteListExportType | null>(null);
	const [pendingBatchExport, setPendingBatchExport] = useState<{
		ids: BackendIdInput[];
		exportType: NoteBatchExportType;
	} | null>(null);
	const [verifyingPassword, setVerifyingPassword] = useState(false);
	const [activeView, setActiveView] = useState<NoteView>("list");
	const [editingNoteId, setEditingNoteId] = useState<string>("");
	const [editingUnlockToken, setEditingUnlockToken] = useState<string>("");
	const [detailReadonly, setDetailReadonly] = useState(false);
	const [pendingReadonly, setPendingReadonly] = useState(false);
	const [cleaningUnusedTags, setCleaningUnusedTags] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [batchMoveModalOpen, setBatchMoveModalOpen] = useState(false);
	const [batchMoveLoading, setBatchMoveLoading] = useState(false);
	const [batchExportLoading, setBatchExportLoading] = useState(false);
	const [batchMoveForm] = Form.useForm();
	const importInputRef = useRef<HTMLInputElement>(null);
	const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null);
	const [shareNoteId, setShareNoteId] = useState<BackendIdInput>();

	const getSelectedNoteIds = () => selectedRowKeys.map(key => (typeof key === "number" ? key : String(key)));

	const getSelectedNotes = () => notes.filter(note => selectedRowKeys.some(key => String(key) === String(note.id)));

	useEffect(() => {
		void fetchCategories();
		void fetchTags();
	}, []);

	useEffect(() => {
		void fetchNotes();
	}, [selectedCategoryId, pagination.current, pagination.pageSize]);

	const fetchCategories = async () => {
		const list = await NoteCategoryService.list();
		setCategories(list);
		if (!selectedCategoryId && list.length > 0) {
			setSelectedCategoryId(String(list[0].id));
		}
	};

	const selectCategory = (categoryId: string) => {
		setSelectedCategoryId(categoryId);
		setSelectedRowKeys([]);
		setPagination(prev => ({ ...prev, current: 1 }));
	};

	const openDetail = (noteId = "", unlockToken = "", readonly = false, draft: NoteDraft | null = null) => {
		setEditingNoteId(noteId);
		setEditingUnlockToken(unlockToken);
		setDetailReadonly(readonly);
		setNoteDraft(draft);
		setActiveView("detail");
	};

	const backToList = () => {
		setEditingNoteId("");
		setEditingUnlockToken("");
		setDetailReadonly(false);
		setPendingReadonly(false);
		setPendingNote(null);
		setPendingExportType(null);
		setPendingBatchExport(null);
		setNoteDraft(null);
		setActiveView("list");
	};

	const importMarkdown = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		try {
			const imported = file.name.toLowerCase().endsWith(".zip")
				? await NoteService.importMarkdownPackage(file)
				: await readMarkdownFile(file);
			openDetail("", "", false, {
				title: imported.title,
				contentMarkdown: imported.contentMarkdown,
				uploadedImageIds: Array.isArray((imported as any).uploadedImageIds) ? (imported as any).uploadedImageIds.map(String) : []
			});
		} catch (error: any) {
			message.error(error?.message || "Markdown导入失败");
		} finally {
			event.target.value = "";
		}
	};

	const refreshList = async () => {
		backToList();
		await fetchNotes();
		await fetchCategories();
		await fetchTags();
	};

	const fetchTags = async () => {
		const list = await NoteTagService.list();
		setTags(list);
		return list;
	};

	const fetchNotes = async (extra?: Partial<NotePageReqDto>) => {
		try {
			setLoading(true);
			const values = searchForm.getFieldsValue();
			const params: NotePageReqDto = {
				pageNumber: pagination.current,
				pageSize: pagination.pageSize,
				categoryId: selectedCategoryId || undefined,
				keyword: values.keyword,
				tagIds: values.tagIds,
				...extra
			};
			const result = await NoteService.page(params);
			setNotes(result.list || []);
			setSelectedRowKeys(prev => prev.filter(key => (result.list || []).some(note => String(note.id) === String(key))));
			setPagination(prev => ({ ...prev, total: result.total || 0 }));
		} finally {
			setLoading(false);
		}
	};

	const openCategoryModal = (category?: NoteCategoryDto) => {
		setEditingCategory(category || null);
		categoryForm.setFieldsValue(category ? { name: category.name, sortOrder: category.sortOrder } : { name: "", sortOrder: 0 });
		setCategoryModalOpen(true);
	};

	const saveCategory = async () => {
		const values = await categoryForm.validateFields();
		if (editingCategory) {
			await NoteCategoryService.update({ id: editingCategory.id, ...values });
			message.success("分类已更新");
		} else {
			await NoteCategoryService.add(values);
			message.success("分类已新增");
		}
		setCategoryModalOpen(false);
		await fetchCategories();
	};

	const deleteCategory = (category: NoteCategoryDto) => {
		confirm({
			title: "确认删除分类？",
			content: "删除分类不会删除笔记，分类下的笔记会移动到默认分类。",
			okText: "删除",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				await NoteCategoryService.delete(category.id);
				message.success("分类已删除");
				setSelectedCategoryId("");
				setPagination(prev => ({ ...prev, current: 1 }));
				await fetchCategories();
				await fetchNotes({ pageNumber: 1, categoryId: undefined });
			}
		});
	};

	const openNote = async (note: NoteDto, readonly = false) => {
		if (!note.isProtected) {
			openDetail(String(note.id), "", readonly);
			return;
		}
		setPendingNote(note);
		setPendingReadonly(readonly);
		passwordForm.resetFields();
		setPasswordModalOpen(true);
	};

	const downloadNoteByType = async (note: NoteDto, exportType: NoteListExportType, unlockToken?: string) => {
		if (isMarkdownExportType(exportType)) {
			await downloadMarkdownExport(note.id, note.title, exportType === "markdownPackage", unlockToken);
			return;
		}
		await downloadNoteExport(note.id, exportType, note.title, unlockToken);
	};

	const verifyPassword = async () => {
		const values = await passwordForm.validateFields();
		try {
			setVerifyingPassword(true);
			const result = await NotePasswordService.verify(values.password);
			setPasswordModalOpen(false);
			if (pendingBatchExport) {
				await downloadBatchNoteExport(pendingBatchExport.ids, pendingBatchExport.exportType, result.unlockToken);
			} else if (pendingNote && pendingExportType) {
				await downloadNoteByType(pendingNote, pendingExportType, result.unlockToken);
			} else if (pendingNote) {
				openDetail(String(pendingNote.id), result.unlockToken, pendingReadonly);
			}
			setPendingExportType(null);
			setPendingBatchExport(null);
			setPendingNote(null);
		} finally {
			setVerifyingPassword(false);
		}
	};

	const deleteNote = (note: NoteDto) => {
		confirm({
			title: "确认删除笔记？",
			okText: "删除",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				await NoteService.delete(note.id);
				message.success("笔记已删除");
				setSelectedRowKeys(prev => prev.filter(key => String(key) !== String(note.id)));
				await fetchNotes();
				await fetchCategories();
				await fetchTags();
			}
		});
	};

	const batchDeleteNotes = () => {
		if (selectedRowKeys.length === 0) {
			message.info("请选择笔记");
			return;
		}
		confirm({
			title: "确认批量删除笔记？",
			content: `将删除选中的 ${selectedRowKeys.length} 条笔记。`,
			okText: "删除",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				await NoteService.batchDelete(getSelectedNoteIds());
				message.success("笔记已删除");
				setSelectedRowKeys([]);
				await fetchNotes();
				await fetchCategories();
				await fetchTags();
			}
		});
	};

	const openBatchMoveModal = () => {
		if (selectedRowKeys.length === 0) {
			message.info("请选择笔记");
			return;
		}
		batchMoveForm.setFieldsValue({ categoryId: selectedCategoryId || undefined });
		setBatchMoveModalOpen(true);
	};

	const batchMoveNotes = async () => {
		const values = await batchMoveForm.validateFields();
		try {
			setBatchMoveLoading(true);
			await NoteService.batchMoveCategory(getSelectedNoteIds(), values.categoryId);
			message.success("笔记已移动");
			setSelectedRowKeys([]);
			setBatchMoveModalOpen(false);
			await fetchNotes();
			await fetchCategories();
		} finally {
			setBatchMoveLoading(false);
		}
	};

	const batchExportNotes = async (exportType: NoteBatchExportType) => {
		const ids = getSelectedNoteIds();
		if (ids.length === 0) {
			message.info("请选择笔记");
			return;
		}
		if (getSelectedNotes().some(note => note.isProtected)) {
			setPendingBatchExport({ ids, exportType });
			setPendingNote(null);
			setPendingExportType(null);
			passwordForm.resetFields();
			setPasswordModalOpen(true);
			return;
		}
		try {
			setBatchExportLoading(true);
			await downloadBatchNoteExport(ids, exportType);
		} finally {
			setBatchExportLoading(false);
		}
	};

	const deleteTag = (tag: NoteTagDto) => {
		confirm({
			title: "确认删除标签？",
			content: `删除标签「${tag.name}」后，关联的笔记将不再显示该标签。`,
			okText: "删除",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				const result = await NoteTagService.delete(tag.id);
				if (!result.data) {
					message.error("删除失败");
					return;
				}
				message.success("标签已删除");
				await fetchTags();
				await fetchNotes();
			}
		});
	};

	const deleteUnusedTags = () => {
		confirm({
			title: "确认清理未使用标签？",
			content: "将删除当前没有被任何笔记使用的标签，已使用的标签不会受影响。",
			okText: "清理",
			okType: "danger",
			cancelText: "取消",
			onOk: async () => {
				try {
					setCleaningUnusedTags(true);
					const result = await NoteTagService.deleteUnused();
					if (!result.data) {
						message.error("清理失败");
						return;
					}
					const nextTags = await fetchTags();
					const validTagIds = new Set(nextTags.map(tag => String(tag.id)));
					const selectedTagIds = (searchForm.getFieldValue("tagIds") || []).filter((id: string | number) =>
						validTagIds.has(String(id))
					);
					searchForm.setFieldsValue({ tagIds: selectedTagIds });
					setPagination(prev => ({ ...prev, current: 1 }));
					await fetchCategories();
					await fetchNotes({ pageNumber: 1, tagIds: selectedTagIds });
					message.success("未使用标签已清理");
				} finally {
					setCleaningUnusedTags(false);
				}
			}
		});
	};

	const exportNoteFromList = async (note: NoteDto, exportType: NoteListExportType) => {
		if (note.isProtected) {
			setPendingNote(note);
			setPendingReadonly(true);
			setPendingExportType(exportType);
			passwordForm.resetFields();
			setPasswordModalOpen(true);
			return;
		}
		await downloadNoteByType(note, exportType);
	};

	const columns = [
		{
			title: "标题",
			dataIndex: "title",
			render: (_: string, record: NoteDto) => (
				<Space>
					{record.isTop && <Tag color="gold">置顶</Tag>}
					{record.isProtected && <LockOutlined />}
					<Button type="link" onClick={() => openNote(record, true)}>
						{record.title}
					</Button>
				</Space>
			)
		},
		{
			title: "摘要",
			dataIndex: "summary",
			render: (_: string, record: NoteDto) => (
				<div className="note-summary">
					{record.isProtected ? <span className="note-summary-protected">***</span> : record.summary || "暂无内容"}
				</div>
			)
		},
		{
			title: "标签",
			dataIndex: "tags",
			width: 220,
			render: (value: NoteTagDto[]) => (
				<Space size={[4, 4]} wrap>
					{(value || []).map(tag => (
						<Tag key={tag.id}>{tag.name}</Tag>
					))}
				</Space>
			)
		},
		{
			title: "更新时间",
			dataIndex: "updateTime",
			width: 170,
			render: (value: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-")
		},
		{
			title: "操作",
			width: 270,
			render: (_: any, record: NoteDto) => (
				<Space>
					<Tooltip title="查看">
						<Button icon={<EyeOutlined />} onClick={() => openNote(record, true)} />
					</Tooltip>
					<Tooltip title="编辑">
						<Button icon={<EditOutlined />} onClick={() => openNote(record)} />
					</Tooltip>
					<Tooltip title="分享">
						<Button icon={<ShareAltOutlined />} onClick={() => setShareNoteId(record.id)} />
					</Tooltip>
					<Tooltip title={record.isTop ? "取消置顶" : "置顶"}>
						<Button
							icon={record.isTop ? <StarFilled /> : <StarOutlined />}
							onClick={async () => {
								await NoteService.updateTop(record.id, !record.isTop);
								await fetchNotes();
							}}
						/>
					</Tooltip>
					<Dropdown
						menu={{
							items: getNoteExportMenuItems(record.contentType),
							onClick: ({ key }) => void exportNoteFromList(record, key as NoteListExportType)
						}}
						trigger={["click"]}
					>
						<Tooltip title="导出">
							<Button icon={<DownloadOutlined />} onClick={event => event.preventDefault()} />
						</Tooltip>
					</Dropdown>
					<Tooltip title="删除">
						<Button danger icon={<DeleteOutlined />} onClick={() => deleteNote(record)} />
					</Tooltip>
				</Space>
			)
		}
	];

	if (activeView === "detail") {
		return (
			<NoteDetail
				noteId={editingNoteId}
				unlockToken={editingUnlockToken}
				readonly={detailReadonly}
				defaultCategoryId={selectedCategoryId}
				initialDraft={noteDraft}
				onBack={backToList}
				onEdit={editingNoteId ? () => setDetailReadonly(false) : undefined}
				onSaved={() => void refreshList()}
			/>
		);
	}

	if (activeView === "password") {
		return <NotePassword onBack={backToList} />;
	}

	return (
		<div className={`note-page note-list-layout${isDark ? " note-dark" : ""}`}>
			<div className="note-category-panel">
				<div className="note-category-header">
					<strong>笔记分类</strong>
					<Button type="text" icon={<PlusOutlined />} onClick={() => openCategoryModal()} />
				</div>
				<div className="note-category-list">
					<div
						className={`note-category-item${selectedCategoryId === "" ? " note-category-item-active" : ""}`}
						onClick={() => selectCategory("")}
					>
						<span className="note-category-name">全部笔记</span>
					</div>
					{categories.map(category => (
						<div
							key={category.id}
							className={`note-category-item${selectedCategoryId === String(category.id) ? " note-category-item-active" : ""}`}
							onClick={() => selectCategory(String(category.id))}
						>
							<span className="note-category-name">{category.name}</span>
							<Space size={4}>
								<Tag>{category.noteCount || 0}</Tag>
								<Button
									size="small"
									type="text"
									icon={<EditOutlined />}
									onClick={event => {
										event.stopPropagation();
										openCategoryModal(category);
									}}
								/>
								<Button
									size="small"
									type="text"
									danger
									icon={<DeleteOutlined />}
									onClick={event => {
										event.stopPropagation();
										deleteCategory(category);
									}}
								/>
							</Space>
						</div>
					))}
				</div>

				<div className="note-tag-section">
					<div className="note-tag-header">
						<strong>标签管理</strong>
						<Button size="small" type="text" danger loading={cleaningUnusedTags} onClick={deleteUnusedTags}>
							清理未使用
						</Button>
					</div>
					<div className="note-tag-list">
						{tags.map(tag => (
							<div key={tag.id} className="note-tag-item">
								<Tag>{tag.name}</Tag>
								<Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => deleteTag(tag)} />
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="note-main-panel">
				<div className="note-toolbar">
					<Form form={searchForm} layout="inline" className="note-search" onFinish={() => fetchNotes({ pageNumber: 1 })}>
						<Form.Item name="keyword">
							<Input allowClear prefix={<SearchOutlined />} placeholder="搜索标题或正文" />
						</Form.Item>
						<Form.Item name="tagIds">
							<Select
								mode="multiple"
								allowClear
								placeholder="标签"
								style={{ minWidth: 180 }}
								options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
							/>
						</Form.Item>
						<Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
							搜索
						</Button>
					</Form>
					<div className="note-actions">
						<input ref={importInputRef} hidden type="file" accept=".md,.zip" onChange={importMarkdown} />
						<Button type="primary" icon={<PlusOutlined />} onClick={() => openDetail()}>
							新建笔记
						</Button>
						<Button icon={<UnlockOutlined />} onClick={() => setActiveView("password")}>
							笔记密码
						</Button>
						<Button icon={<UploadOutlined />} onClick={() => importInputRef.current?.click()}>
							导入Markdown
						</Button>
						<Dropdown
							menu={{
								items: getBatchNoteExportMenuItems(getSelectedNotes().map(note => note.contentType)),
								onClick: ({ key }) => void batchExportNotes(key as NoteBatchExportType)
							}}
							trigger={["click"]}
						>
							<Button
								disabled={selectedRowKeys.length === 0}
								icon={<DownloadOutlined />}
								loading={batchExportLoading}
								onClick={event => event.preventDefault()}
							>
								批量导出{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}
							</Button>
						</Dropdown>
						<Button danger disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />} onClick={batchDeleteNotes}>
							批量删除{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}
						</Button>
						<Button disabled={selectedRowKeys.length === 0} icon={<FolderOpenOutlined />} onClick={openBatchMoveModal}>
							移动分类{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}
						</Button>
					</div>
				</div>

				<Table
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={notes}
					rowSelection={{
						selectedRowKeys,
						onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
					}}
					pagination={{
						current: pagination.current,
						pageSize: pagination.pageSize,
						total: pagination.total,
						showSizeChanger: true,
						showTotal: total => `共 ${total} 条`
					}}
					onChange={page => setPagination({ current: page.current || 1, pageSize: page.pageSize || 10, total: pagination.total })}
				/>
			</div>

			<Modal
				title={editingCategory ? "编辑分类" : "新增分类"}
				open={categoryModalOpen}
				onOk={saveCategory}
				onCancel={() => setCategoryModalOpen(false)}
			>
				<Form form={categoryForm} layout="vertical">
					<Form.Item name="name" label="分类名称" rules={[{ required: true, message: "请输入分类名称" }]}>
						<Input maxLength={50} />
					</Form.Item>
					<Form.Item name="sortOrder" label="排序">
						<Input type="number" />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="批量移动分类"
				open={batchMoveModalOpen}
				onOk={batchMoveNotes}
				onCancel={() => setBatchMoveModalOpen(false)}
				confirmLoading={batchMoveLoading}
			>
				<Form form={batchMoveForm} layout="vertical">
					<Form.Item
						name="categoryId"
						label={`目标分类（已选 ${selectedRowKeys.length} 条）`}
						rules={[{ required: true, message: "请选择目标分类" }]}
					>
						<Select
							placeholder="请选择分类"
							options={categories.map(category => ({ value: category.id, label: category.name }))}
						/>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={pendingBatchExport || pendingExportType ? "导出受保护笔记" : "打开受保护笔记"}
				open={passwordModalOpen}
				onOk={verifyPassword}
				onCancel={() => {
					setPasswordModalOpen(false);
					setPendingExportType(null);
					setPendingBatchExport(null);
				}}
				confirmLoading={verifyingPassword}
			>
				<Form form={passwordForm} layout="vertical">
					<Form.Item name="password" label="笔记密码" rules={[{ required: true, message: "请输入笔记密码" }]}>
						<Input.Password onPressEnter={() => void verifyPassword()} />
					</Form.Item>
				</Form>
			</Modal>
			{shareNoteId !== undefined && (
				<ShareDialog open targetType={ShareTargetType.Note} targetId={shareNoteId} onClose={() => setShareNoteId(undefined)} />
			)}
		</div>
	);
};

export default NoteList;
