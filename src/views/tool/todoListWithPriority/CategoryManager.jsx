import React, { Component } from "react";
import { Card, List, Button, Input, Modal, message, Badge } from "antd";
import { PlusOutlined, MenuOutlined } from "@ant-design/icons";
import { TodoCategoryService } from "@/services/tool/todoCategoryService";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// 可拖拽分类项组件
const DraggableCategoryItem = ({ category, index, moveCategory, onEdit, onDelete, isSelected, onSelect }) => {
	const ref = React.useRef(null);

	// 拖拽逻辑
	const [{ isDragging }, drag] = useDrag({
		type: "category",
		item: { index, id: category.id },
		collect: monitor => ({
			isDragging: monitor.isDragging()
		})
	});

	// 放置逻辑
	const [{ isOver }, drop] = useDrop({
		accept: "category",
		drop: item => moveCategory(item.index, index),
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	});

	// 同时设置拖拽和放置的ref
	drag(drop(ref));

	return (
		<List.Item
			ref={ref}
			actions={[
				<Button key="edit" size="small" onClick={() => onEdit(category)}>
					编辑
				</Button>,
				<Button key="delete" size="small" danger onClick={() => onDelete(category.id)}>
					删除
				</Button>
			]}
			style={{
				cursor: "pointer",
				opacity: isDragging ? 0.5 : 1,
				backgroundColor: isOver ? "#f0f0f0" : isSelected === category.id ? "#e6f7ff" : ""
			}}
			onClick={() => onSelect(category.id)}
		>
			<div style={{ display: "flex", alignItems: "center" }}>
				<MenuOutlined style={{ marginRight: 8, cursor: "grab" }} />
				<span>{category.name}</span>
				<Badge
					count={category.pendingCount}
					showZero={true}
					style={{
						backgroundColor: category.pendingCount > 0 ? "#ff4d4f" : "#f5f5f5",
						color: category.pendingCount > 0 ? "#fff" : "#999",
						marginLeft: 4
					}}
				/>
				<span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>- 排序: {category.sortOrder}</span>
			</div>
		</List.Item>
	);
};

// 分类管理组件
export default class CategoryManager extends Component {
	state = {
		categoryList: [],
		editingCategory: null,
		newCategoryName: "",
		newCategorySortOrder: 0,
		// 模态框状态
		editModalVisible: false,
		deleteModalVisible: false,
		// 待删除的分类ID
		deletingCategoryId: null,
		// 当前选中的分类ID
		selectedCategoryId: null
	};

	componentDidMount() {
		this.fetchCategoryList();
	}

	// 获取分类列表
	fetchCategoryList = async () => {
		try {
			const response = await TodoCategoryService.getCategoryList();
			if (response.code === 200) {
				const categories = response.data || [];
				this.setState({ categoryList: categories });
				// 如果有分类且没有选中分类，默认选择第一个
				if (categories.length > 0 && !this.state.selectedCategoryId) {
					this.setState({ selectedCategoryId: categories[0].id });
					if (this.props.onCategorySelect) {
						this.props.onCategorySelect(categories[0].id);
					}
				}
				// 通知父组件分类列表更新
				if (this.props.onCategoriesChange) {
					this.props.onCategoriesChange(categories);
				}
			}
		} catch (error) {
			console.error("获取分类列表失败:", error);
		}
	};

	// 显示添加分类模态框
	showAddModal = () => {
		this.setState({ editingCategory: null, newCategoryName: "", newCategorySortOrder: 0, editModalVisible: true });
	};

	// 显示编辑分类模态框
	showEditModal = category => {
		this.setState({
			editingCategory: category,
			newCategoryName: category.name,
			newCategorySortOrder: category.sortOrder || 0,
			editModalVisible: true
		});
	};

	// 显示删除分类模态框
	showDeleteModal = categoryId => {
		this.setState({ deletingCategoryId: categoryId, deleteModalVisible: true });
	};

	// 处理输入变化
	handleInputChange = e => {
		this.setState({ newCategoryName: e.target.value });
	};

	// 处理排序字段输入变化
	handleSortOrderChange = e => {
		const value = e.target.value;
		this.setState({ newCategorySortOrder: value ? parseInt(value) : 0 });
	};

	// 处理保存分类
	handleSaveCategory = async () => {
		const { newCategoryName, newCategorySortOrder, editingCategory } = this.state;
		if (!newCategoryName.trim()) {
			message.warning("分类名称不能为空");
			return;
		}

		try {
			let response;
			if (editingCategory) {
				// 更新分类
				response = await TodoCategoryService.updateCategory({
					id: editingCategory.id,
					name: newCategoryName.trim(),
					sortOrder: newCategorySortOrder
				});
				if (response.code === 200) {
					message.success("更新分类成功");
				}
			} else {
				// 添加分类
				response = await TodoCategoryService.addCategory({
					name: newCategoryName.trim(),
					sortOrder: newCategorySortOrder
				});
				if (response.code === 200) {
					message.success("添加分类成功");
				}
			}

			if (response.code === 200) {
				await this.fetchCategoryList();
				this.setState({ editModalVisible: false, newCategoryName: "", newCategorySortOrder: 0, editingCategory: null });
			}
		} catch (error) {
			message.error(editingCategory ? "更新分类失败" : "添加分类失败");
			console.error(editingCategory ? "更新分类失败:" : "添加分类失败:", error);
		}
	};

	// 处理删除分类
	handleDeleteCategory = async () => {
		const { deletingCategoryId, selectedCategoryId } = this.state;
		try {
			const response = await TodoCategoryService.deleteCategory(deletingCategoryId);
			if (response.code === 200) {
				message.success("删除分类成功");
				await this.fetchCategoryList();
			}
		} catch (error) {
			message.error("删除分类失败");
			console.error("删除分类失败:", error);
		} finally {
			this.setState({ deleteModalVisible: false, deletingCategoryId: null });
		}
	};

	// 处理分类拖拽排序
	moveCategory = async (dragIndex, hoverIndex) => {
		if (dragIndex === hoverIndex) return;

		const { categoryList } = this.state;
		const newCategoryList = [...categoryList];

		// 重新排列分类
		const [draggedCategory] = newCategoryList.splice(dragIndex, 1);
		newCategoryList.splice(hoverIndex, 0, draggedCategory);

		// 更新排序顺序
		const updatedCategories = newCategoryList.map((category, index) => ({
			...category,
			sortOrder: index
		}));

		// 保存到状态
		this.setState({ categoryList: updatedCategories });

		// 批量更新后端
		try {
			for (const category of updatedCategories) {
				await TodoCategoryService.updateCategory({
					id: category.id,
					name: category.name,
					sortOrder: category.sortOrder
				});
			}
			message.success("分类排序更新成功");
		} catch (error) {
			message.error("分类排序更新失败");
			console.error("分类排序更新失败:", error);
			// 失败后重新获取分类列表
			await this.fetchCategoryList();
		}
	};

	render() {
		const {
			categoryList,
			editModalVisible,
			deleteModalVisible,
			newCategoryName,
			newCategorySortOrder,
			editingCategory,
			selectedCategoryId
		} = this.state;

		return (
			<Card
				style={{
					width: "100%",
					marginBottom: 16
				}}
				title="分类管理"
				actions={[
					<Button key="add" type="primary" icon={<PlusOutlined />} onClick={this.showAddModal}>
						新增分类
					</Button>
				]}
			>
				<DndProvider backend={HTML5Backend}>
					<List
						size="small"
						header={<div>分类列表</div>}
						footer={null}
						bordered
						dataSource={categoryList}
						locale={{ emptyText: "没有分类" }}
						renderItem={(category, index) => (
							<DraggableCategoryItem
								category={category}
								index={index}
								moveCategory={this.moveCategory}
								onEdit={this.showEditModal}
								onDelete={this.showDeleteModal}
								isSelected={selectedCategoryId}
								onSelect={id => {
									this.setState({ selectedCategoryId: id });
									if (this.props.onCategorySelect) {
										this.props.onCategorySelect(id);
									}
								}}
							/>
						)}
					/>
				</DndProvider>

				{/* 编辑分类模态框 */}
				<Modal
					title={editingCategory ? "编辑分类" : "新增分类"}
					open={editModalVisible}
					onOk={this.handleSaveCategory}
					onCancel={() =>
						this.setState({ editModalVisible: false, newCategoryName: "", newCategorySortOrder: 0, editingCategory: null })
					}
					okText="保存"
					cancelText="取消"
				>
					<div style={{ marginBottom: 12 }}>
						<label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>分类名称</label>
						<Input placeholder="请输入分类名称" value={newCategoryName} onChange={this.handleInputChange} autoFocus />
					</div>
					<div>
						<label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>排序顺序</label>
						<Input
							type="number"
							placeholder="请输入排序顺序"
							value={newCategorySortOrder}
							onChange={this.handleSortOrderChange}
							min={0}
							style={{ width: "100%" }}
						/>
					</div>
				</Modal>

				{/* 删除分类模态框 */}
				<Modal
					title="确认删除"
					open={deleteModalVisible}
					onOk={this.handleDeleteCategory}
					onCancel={() => this.setState({ deleteModalVisible: false, deletingCategoryId: null })}
					okText="确认"
					cancelText="取消"
				>
					<p>确定要删除这个分类吗？删除后，该分类下的所有待办事项也会被删除。</p>
				</Modal>
			</Card>
		);
	}
}
