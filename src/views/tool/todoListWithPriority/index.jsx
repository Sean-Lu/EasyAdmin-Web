import React, { Component } from "react";
import { Card, List, Typography, message, Modal, Button, Row, Col } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import TodoHeader from "./Heaher";
//import CategorySelector from "./Heaher/CategorySelector";
import CategoryManager from "./CategoryManager";
import TodoItem from "./Item";
import DraggableTodoItem from "./Item/DraggableTodoItem";
import TodoFooter from "./Footer";
import { TodoItemService } from "@/services/tool/todoItemService";
import { TodoCategoryService } from "@/services/tool/todoCategoryService";

const { Title } = Typography;

// 待办事项列表组件（带优先级）
export default class TodoListWithPriority extends Component {
	state = {
		todoList: [],
		categories: [],
		// 模态框状态
		deleteModalVisible: false,
		clearModalVisible: false,
		// 待删除的任务ID
		deletingId: null,
		// 列表展开状态
		pendingExpanded: true,
		completedExpanded: true,
		// 当前选中的分类ID
		currentCategoryId: null
	};

	// CategoryManager组件引用
	categoryManagerRef = React.createRef();

	// 组件挂载时不获取数据，等待CategoryManager传递
	componentDidMount() {}

	// 处理分类列表更新
	handleCategoriesChange = categories => {
		this.setState({ categories });
	};

	// 刷新分类列表（通过ref调用CategoryManager的方法）
	refreshCategories = async () => {
		if (this.categoryManagerRef.current) {
			await this.categoryManagerRef.current.fetchCategoryList();
		}
	};

	// 获取待办事项列表
	fetchTodoList = async categoryId => {
		try {
			const response = await TodoItemService.getTodoList(categoryId);
			if (response.success) {
				const sortedList = response.data; // 直接使用后端返回的排序结果
				this.setState({ todoList: sortedList, currentCategoryId: categoryId });
			}
		} catch (error) {
			message.error("获取待办事项列表失败");
			console.error("获取待办事项列表失败:", error);
		}
	};

	// 处理分类切换
	handleCategoryChange = categoryId => {
		this.fetchTodoList(categoryId);
	};

	// 添加todo
	addTodo = async todoObj => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.addTodoItem({
				name: todoObj.name,
				done: todoObj.done,
				priority: todoObj.priority || 1,
				categoryId: currentCategoryId
			});
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				await this.refreshCategories();
				message.success("添加待办事项成功");
			}
		} catch (error) {
			message.error("添加待办事项失败");
			console.error("添加待办事项失败:", error);
		}
	};

	// 更新todo
	updateTodo = async (id, done) => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.updateTodoStatus({ id, done });
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				await this.refreshCategories();
			}
		} catch (error) {
			message.error("更新待办事项状态失败");
			console.error("更新待办事项状态失败:", error);
		}
	};

	// 更新优先级
	updatePriority = async (id, priority) => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.updateTodoPriority({ id, priority });
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				message.success("更新优先级成功");
			}
		} catch (error) {
			message.error("更新优先级失败");
			console.error("更新优先级失败:", error);
		}
	};

	// 更新待办事项内容
	updateName = async (id, name) => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.updateTodoName({ id, name });
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				message.success("更新待办事项内容成功");
			}
		} catch (error) {
			message.error("更新待办事项内容失败");
			console.error("更新待办事项内容失败:", error);
		}
	};

	// 显示删除确认弹窗
	showDeleteConfirm = id => {
		this.setState({
			deletingId: id,
			deleteModalVisible: true
		});
	};

	// 处理删除确认
	handleDeleteConfirm = async () => {
		const { deletingId, currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.deleteTodoItem(deletingId);
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				await this.refreshCategories();
				message.success("删除待办事项成功");
			}
		} catch (error) {
			message.error("删除待办事项失败");
			console.error("删除待办事项失败:", error);
		} finally {
			this.setState({
				deleteModalVisible: false,
				deletingId: null
			});
		}
	};

	// 处理删除取消
	handleDeleteCancel = () => {
		this.setState({
			deleteModalVisible: false,
			deletingId: null
		});
	};

	// 全选/全不选
	allChecked = async done => {
		const { currentCategoryId } = this.state;
		try {
			const { todoList } = this.state;
			const ids = todoList.map(item => item.id);
			const response = await TodoItemService.batchUpdateTodoStatus({ ids, done });
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				await this.refreshCategories();
			}
		} catch (error) {
			message.error("更新待办事项状态失败");
			console.error("更新待办事项状态失败:", error);
		}
	};

	// 显示清除已完成任务确认弹窗
	showClearConfirm = () => {
		this.setState({
			clearModalVisible: true
		});
	};

	// 处理清除已完成任务确认
	handleClearConfirm = async () => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.clearCompleted(currentCategoryId);
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				// await this.refreshCategories(); // 这里不需要刷新分类列表，因为分类列表只显示待处理数量，清除已完成后待处理数量不会改变
				message.success("清除已完成待办事项成功");
			}
		} catch (error) {
			message.error("清除已完成待办事项失败");
			console.error("清除已完成待办事项失败:", error);
		} finally {
			this.setState({
				clearModalVisible: false
			});
		}
	};

	// 处理清除已完成任务取消
	handleClearCancel = () => {
		this.setState({
			clearModalVisible: false
		});
	};

	// 切换待处理列表展开状态
	togglePendingExpand = () => {
		this.setState(prevState => ({
			pendingExpanded: !prevState.pendingExpanded
		}));
	};

	// 切换已完成列表展开状态
	toggleCompletedExpand = () => {
		this.setState(prevState => ({
			completedExpanded: !prevState.completedExpanded
		}));
	};

	// 移动待办事项
	moveTodo = async (dragId, hoverId, priority, done) => {
		const { todoList, currentCategoryId } = this.state;

		// 过滤出同一优先级和同一完成状态的项目，并按sortOrder排序
		const samePriorityTodos = todoList
			.filter(todo => todo.priority === priority && todo.done === done)
			.sort((a, b) => a.sortOrder - b.sortOrder);

		// 找到拖拽项目和目标位置项目
		const dragItem = samePriorityTodos.find(todo => todo.id === dragId);
		const hoverItem = samePriorityTodos.find(todo => todo.id === hoverId);

		// 检查拖拽的项目是否在同一优先级和同一完成状态的列表中
		if (!dragItem || !hoverItem) {
			return;
		}

		// 找到拖拽项目和目标位置项目在同一优先级列表中的索引
		const dragIndex = samePriorityTodos.indexOf(dragItem);
		const hoverIndex = samePriorityTodos.indexOf(hoverItem);

		// 如果索引相同，不需要更新
		if (dragIndex === hoverIndex) {
			return;
		}

		// 创建新的同一优先级列表
		const newSamePriorityTodos = [...samePriorityTodos];
		// 交换项目
		newSamePriorityTodos.splice(dragIndex, 1);
		newSamePriorityTodos.splice(hoverIndex, 0, dragItem);

		// 收集需要更新的项目
		const itemsToUpdate = [];
		for (let i = 0; i < newSamePriorityTodos.length; i++) {
			const todo = newSamePriorityTodos[i];
			// 只收集sortOrder发生变化的项目
			if (todo.sortOrder !== i) {
				itemsToUpdate.push({ id: todo.id, sortOrder: i });
			}
		}

		// 批量更新排序顺序
		for (const item of itemsToUpdate) {
			await TodoItemService.updateTodoSortOrder(item);
		}

		// 重新获取列表，确保排序顺序正确
		await this.fetchTodoList(currentCategoryId);
	};

	// 移动待办事项到另一个分类
	moveToCategory = async (todoId, categoryId) => {
		const { currentCategoryId } = this.state;
		try {
			const response = await TodoItemService.updateTodoCategory({ id: todoId, categoryId });
			if (response.success && response.data) {
				await this.fetchTodoList(currentCategoryId);
				await this.refreshCategories();
				message.success("移动待办事项成功");
			}
		} catch (error) {
			message.error("移动待办事项失败");
			console.error("移动待办事项失败:", error);
		}
	};

	render() {
		const { todoList, deleteModalVisible, clearModalVisible, pendingExpanded, completedExpanded, categories } = this.state;
		const pendingTodos = todoList.filter(c => !c.done);
		const completedTodos = todoList.filter(c => c.done);

		return (
			<DndProvider backend={HTML5Backend}>
				<div className="todo-container" style={{ padding: "5px", margin: "0" }}>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<CategoryManager
								ref={this.categoryManagerRef}
								onCategorySelect={this.handleCategoryChange}
								onCategoriesChange={this.handleCategoriesChange}
							/>
						</Col>
						<Col xs={24} md={16}>
							<Card
								style={{
									width: "100%",
									minHeight: "auto"
								}}
								styles={{ body: { padding: "16px", margin: "0" } }}
							>
								<Title level={3} style={{ marginBottom: 10 }}>
									TodoList -{" "}
									{this.state.currentCategoryId
										? this.state.categories.find(c => c.id === this.state.currentCategoryId)?.name
										: "待办事项"}
								</Title>
								{/* 分类选择组件【用CategoryManager替代，功能更完善】 */}
								{/* <CategorySelector onCategoryChange={this.handleCategoryChange} /> */}
								<TodoHeader addTodo={this.addTodo} />
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginTop: 10,
										marginBottom: 10
									}}
								>
									<Title level={5} style={{ margin: 0 }}>
										待处理({pendingTodos.length})
									</Title>
									<Button
										type="text"
										size="small"
										onClick={this.togglePendingExpand}
										style={{
											color: "#1890ff",
											borderRadius: "4px",
											padding: "4px 8px",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										}}
									>
										{pendingExpanded ? "收起" : "展开"}
										{pendingExpanded ? <UpOutlined /> : <DownOutlined />}
									</Button>
								</div>
								{pendingExpanded && (
									<List
										size="small"
										header={null}
										footer={null}
										bordered
										dataSource={pendingTodos.sort(
											(a, b) =>
												b.Priority - a.Priority || a.SortOrder - b.SortOrder || new Date(b.CreateTime) - new Date(a.CreateTime)
										)}
										locale={{ emptyText: "没有数据" }}
										renderItem={(item, index) => {
											return (
												<List.Item className="todo-list-item">
													<DraggableTodoItem
														item={item}
														moveTodo={this.moveTodo}
														updateTodo={this.updateTodo}
														delTodo={this.showDeleteConfirm}
														updatePriority={this.updatePriority}
														updateName={this.updateName}
														categories={categories}
														moveToCategory={this.moveToCategory}
													/>
												</List.Item>
											);
										}}
									/>
								)}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginTop: 10,
										marginBottom: 10
									}}
								>
									<Title level={5} style={{ margin: 0 }}>
										已完成({completedTodos.length})
									</Title>
									<Button
										type="text"
										size="small"
										onClick={this.toggleCompletedExpand}
										style={{
											color: "#1890ff",
											borderRadius: "4px",
											padding: "4px 8px",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										}}
									>
										{completedExpanded ? "收起" : "展开"}
										{completedExpanded ? <UpOutlined /> : <DownOutlined />}
									</Button>
								</div>
								{completedExpanded && (
									<List
										size="small"
										header={null}
										footer={null}
										bordered
										dataSource={completedTodos.sort(
											(a, b) =>
												b.Priority - a.Priority || a.SortOrder - b.SortOrder || new Date(b.CreateTime) - new Date(a.CreateTime)
										)}
										locale={{ emptyText: "没有数据" }}
										renderItem={(item, index) => {
											return (
												<List.Item className="todo-list-item">
													<DraggableTodoItem
														item={item}
														moveTodo={this.moveTodo}
														updateTodo={this.updateTodo}
														delTodo={this.showDeleteConfirm}
														updatePriority={this.updatePriority}
														updateName={this.updateName}
														categories={categories}
														moveToCategory={this.moveToCategory}
													/>
												</List.Item>
											);
										}}
									/>
								)}
								<TodoFooter todoList={todoList} allChecked={this.allChecked} clearAllDone={this.showClearConfirm} />
							</Card>
						</Col>
					</Row>

					{/* 删除确认模态框 */}
					<Modal
						title="确认删除"
						open={deleteModalVisible}
						onOk={this.handleDeleteConfirm}
						onCancel={this.handleDeleteCancel}
						okText="确认"
						cancelText="取消"
					>
						<p>确定要删除这个待办事项吗？</p>
					</Modal>

					{/* 清除已完成任务确认模态框 */}
					<Modal
						title="确认清除"
						open={clearModalVisible}
						onOk={this.handleClearConfirm}
						onCancel={this.handleClearCancel}
						okText="确认"
						cancelText="取消"
					>
						<p>确定要清除所有已完成的待办事项吗？</p>
					</Modal>
				</div>
			</DndProvider>
		);
	}
}
