import React, { Component } from "react";
import { Checkbox, Button, Select, Input } from "antd";

import "./index.css";

const { Option } = Select;

class TodoItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editing: false,
			editValue: props.name
		};
		// 绑定键盘事件处理函数
		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	componentDidMount() {
		// 添加全局键盘事件监听
		document.addEventListener("keydown", this.handleKeyDown);
		const { onEditChange, id } = this.props;
		if (onEditChange) {
			onEditChange(id, false);
		}
	}

	componentWillUnmount() {
		// 移除全局键盘事件监听
		document.removeEventListener("keydown", this.handleKeyDown);
	}

	// 处理全局键盘事件
	handleKeyDown = e => {
		if (this.state.editing && e.key === "Escape") {
			this.handleCancelEdit();
		}
	};

	// 处理复选框点击
	handleCheck = e => {
		const { id, updateTodo } = this.props;
		updateTodo(id, e.target.checked);
	};

	// 处理删除按钮点击
	handleDelete = () => {
		const { id, delTodo } = this.props;
		delTodo(id);
	};

	// 处理优先级变更
	handlePriorityChange = value => {
		const { id, updatePriority } = this.props;
		updatePriority(id, value);
	};

	// 开始编辑
	handleEdit = () => {
		const { onEditChange, id } = this.props;
		if (onEditChange) {
			onEditChange(id, true);
		}
		this.setState({ editing: true, editValue: this.props.name });
	};

	// 取消编辑
	handleCancelEdit = () => {
		const { onEditChange, id } = this.props;
		if (onEditChange) {
			onEditChange(id, false);
		}
		this.setState({ editing: false, editValue: this.props.name });
	};

	// 保存编辑
	handleSaveEdit = async () => {
		const { id, updateName, onEditChange } = this.props;
		const { editValue } = this.state;
		if (editValue.trim()) {
			await updateName(id, editValue.trim());
			if (onEditChange) {
				onEditChange(id, false);
			}
			this.setState({ editing: false });
		}
	};

	// 处理编辑框输入变化
	handleEditChange = e => {
		this.setState({ editValue: e.target.value });
	};

	// 处理编辑框回车和Esc键
	handleEditKeyPress = e => {
		if (e.key === "Enter") {
			this.handleSaveEdit();
		} else if (e.key === "Escape") {
			this.handleCancelEdit();
		}
	};

	render() {
		const { id, name, done, priority } = this.props;
		const { editing, editValue } = this.state;

		// 根据优先级设置样式
		let priorityStyle = {};
		let priorityColor = "#999";

		switch (priority) {
			case 3:
				priorityStyle = { fontWeight: "bold", color: "#ff4d4f" };
				priorityColor = "#ff4d4f";
				break;
			case 2:
				priorityStyle = { fontWeight: "bold", color: "#fa8c16" };
				priorityColor = "#fa8c16";
				break;
			default:
				priorityStyle = {};
				priorityColor = "#999";
		}

		return (
			<div className="todo-item">
				{editing ? (
					<div className="todo-item-content">
						<Input
							className="todo-item-input"
							value={editValue}
							onChange={this.handleEditChange}
							onKeyPress={this.handleEditKeyPress}
							autoFocus
						/>
						<div className="todo-item-actions">
							<Select className="todo-item-priority" value={priority} onChange={this.handlePriorityChange} disabled>
								<Option value={1} style={{ color: "#999" }}>
									低
								</Option>
								<Option value={2} style={{ color: "#fa8c16", fontWeight: "bold" }}>
									中
								</Option>
								<Option value={3} style={{ color: "#ff4d4f", fontWeight: "bold" }}>
									高
								</Option>
							</Select>
							<div className="todo-item-buttons">
								<Button type="primary" size="small" onClick={this.handleSaveEdit} style={{ padding: "4px 12px", marginRight: 4 }}>
									保存
								</Button>
								<Button type="text" size="small" onClick={this.handleCancelEdit} style={{ padding: "4px 12px" }}>
									取消
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="todo-item-content">
						<Checkbox checked={done} onChange={this.handleCheck} />
						<span
							className="todo-item-text"
							onClick={this.handleEdit}
							style={{
								cursor: "pointer",
								textDecoration: done ? "line-through" : "none",
								color: done ? "#999" : priority === 3 ? "#ff4d4f" : priority === 2 ? "#fa8c16" : "#000",
								fontWeight: priority >= 2 ? "bold" : "normal"
							}}
						>
							{name}
						</span>
						<div className="todo-item-actions">
							<Select className="todo-item-priority" value={priority} onChange={this.handlePriorityChange} disabled={done}>
								<Option value={1} style={{ color: "#999" }}>
									低
								</Option>
								<Option value={2} style={{ color: "#fa8c16", fontWeight: "bold" }}>
									中
								</Option>
								<Option value={3} style={{ color: "#ff4d4f", fontWeight: "bold" }}>
									高
								</Option>
							</Select>
							<Button danger type="text" size="small" onClick={this.handleDelete}>
								删除
							</Button>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default TodoItem;
