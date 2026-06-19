import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Table, Tag, Tooltip, message } from "antd";
import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	LockOutlined,
	PlusOutlined,
	SearchOutlined,
	StarFilled,
	StarOutlined,
	UnlockOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
	NoteCategoryDto,
	NoteCategoryService,
	NoteDto,
	NotePageReqDto,
	NotePasswordService,
	NoteService,
	NoteTagDto,
	NoteTagService
} from "@/services/tool/noteService";
import NoteDetail from "./NoteDetail";
import NotePassword from "./NotePassword";
import "./note.less";

const { confirm } = Modal;
type NoteView = "list" | "detail" | "password";

// 笔记列表页
const NoteList: React.FC = () => {
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
	const [activeView, setActiveView] = useState<NoteView>("list");
	const [editingNoteId, setEditingNoteId] = useState<string>("");
	const [editingUnlockToken, setEditingUnlockToken] = useState<string>("");
	const [detailReadonly, setDetailReadonly] = useState(false);
	const [pendingReadonly, setPendingReadonly] = useState(false);

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
		setPagination(prev => ({ ...prev, current: 1 }));
	};

	const openDetail = (noteId = "", unlockToken = "", readonly = false) => {
		setEditingNoteId(noteId);
		setEditingUnlockToken(unlockToken);
		setDetailReadonly(readonly);
		setActiveView("detail");
	};

	const backToList = () => {
		setEditingNoteId("");
		setEditingUnlockToken("");
		setDetailReadonly(false);
		setPendingReadonly(false);
		setPendingNote(null);
		setActiveView("list");
	};

	const refreshList = async () => {
		backToList();
		await fetchNotes();
		await fetchCategories();
		await fetchTags();
	};

	const fetchTags = async () => {
		setTags(await NoteTagService.list());
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

	const verifyPassword = async () => {
		const values = await passwordForm.validateFields();
		const result = await NotePasswordService.verify(values.password);
		setPasswordModalOpen(false);
		if (pendingNote) {
			openDetail(String(pendingNote.id), result.unlockToken, pendingReadonly);
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
				await fetchNotes();
				await fetchCategories();
				await fetchTags();
			}
		});
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
			render: (value: string) => <div className="note-summary">{value || "暂无内容"}</div>
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
			dataIndex: "lastEditTime",
			width: 170,
			render: (value: string) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-")
		},
		{
			title: "操作",
			width: 220,
			render: (_: any, record: NoteDto) => (
				<Space>
					<Tooltip title="查看">
						<Button icon={<EyeOutlined />} onClick={() => openNote(record, true)} />
					</Tooltip>
					<Tooltip title="编辑">
						<Button icon={<EditOutlined />} onClick={() => openNote(record)} />
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
		<div className="note-page note-list-layout">
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
			</div>

			<div className="note-main-panel">
				<div className="note-toolbar">
					<Form form={searchForm} layout="inline" className="note-search" onFinish={() => fetchNotes({ pageNumber: 1 })}>
						<Form.Item name="keyword">
							<Input allowClear prefix={<SearchOutlined />} placeholder="搜索标题或正文" />
						</Form.Item>
						<Form.Item name="tagIds">
							<Select mode="multiple" allowClear placeholder="标签" style={{ minWidth: 180 }}>
								{tags.map(tag => (
									<Select.Option key={tag.id} value={tag.id}>
										{tag.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
							搜索
						</Button>
					</Form>
					<Space>
						<Button icon={<UnlockOutlined />} onClick={() => setActiveView("password")}>
							笔记密码
						</Button>
						<Button type="primary" icon={<PlusOutlined />} onClick={() => openDetail()}>
							新建笔记
						</Button>
					</Space>
				</div>

				<Table
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={notes}
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

			<Modal title="打开受保护笔记" open={passwordModalOpen} onOk={verifyPassword} onCancel={() => setPasswordModalOpen(false)}>
				<Form form={passwordForm} layout="vertical">
					<Form.Item name="password" label="笔记密码" rules={[{ required: true, message: "请输入笔记密码" }]}>
						<Input.Password onPressEnter={() => void verifyPassword()} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default NoteList;
