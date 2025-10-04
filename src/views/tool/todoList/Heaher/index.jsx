import { Component } from "react";
import { Input } from "antd";
import { nanoid } from "nanoid";
import PropTypes from "prop-types";

export default class TodoHeader extends Component {
	// 使用 PropTypes 进行类型检查
	static propTypes = {
		addTodo: PropTypes.func.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			inputValue: ""
		};
	}

	handleChange = e => {
		this.setState({ inputValue: e.target.value });
	};

	handleEnter = () => {
		const { inputValue } = this.state;
		if (inputValue === "") {
			return;
		}
		const todoObj = {
			id: nanoid(),
			name: inputValue,
			done: false
		};
		this.props.addTodo(todoObj);
		this.setState({ inputValue: "" });
	};

	render() {
		return (
			<div className="todo-header">
				<Input
					placeholder="按回车创建待办任务"
					value={this.state.inputValue}
					onChange={this.handleChange}
					onPressEnter={this.handleEnter}
					allowClear
				/>
			</div>
		);
	}
}
