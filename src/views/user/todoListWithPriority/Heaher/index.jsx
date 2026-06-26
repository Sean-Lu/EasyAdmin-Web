import { Component } from "react";
import { Input, Select } from "antd";
import { nanoid } from "nanoid";
import PropTypes from "prop-types";

// 待办事项顶部输入栏组件
export default class TodoHeader extends Component {
	// 使用 PropTypes 进行类型检查
	static propTypes = {
		addTodo: PropTypes.func.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			inputValue: "",
			priority: 1
		};
	}

	handleChange = e => {
		this.setState({ inputValue: e.target.value });
	};

	handlePriorityChange = value => {
		this.setState({ priority: value });
	};

	handleEnter = () => {
		const { inputValue, priority } = this.state;
		if (inputValue === "") {
			return;
		}
		const todoObj = {
			id: nanoid(),
			name: inputValue,
			done: false,
			priority: priority
		};
		this.props.addTodo(todoObj);
		// this.setState({ inputValue: "", priority: 1 }); // 清空输入框，重置优先级为低
		this.setState({ inputValue: "" }); // 清空输入框，保持优先级不变
	};

	render() {
		return (
			<div className="todo-header" style={{ display: "flex", alignItems: "center" }}>
				<Input
					placeholder="按回车创建待办任务"
					value={this.state.inputValue}
					onChange={this.handleChange}
					onPressEnter={this.handleEnter}
					allowClear
					style={{ flex: 1, marginRight: 8 }}
				/>
				<Select
					style={{ width: 80, marginRight: 8 }}
					value={this.state.priority}
					onChange={this.handlePriorityChange}
					options={[
						{ value: 1, label: "低", style: { color: "#999" } },
						{ value: 2, label: "中", style: { color: "#fa8c16", fontWeight: "bold" } },
						{ value: 3, label: "高", style: { color: "#ff4d4f", fontWeight: "bold" } }
					]}
				/>
			</div>
		);
	}
}
