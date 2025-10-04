import { Component } from "react";
import { Button, Checkbox } from "antd";
import PropTypes from "prop-types";

import { DeleteOutlined } from "@ant-design/icons";

import "./index.css";

export default class TodoFooter extends Component {
	// 使用 PropTypes 进行类型检查
	static propTypes = {
		todoList: PropTypes.array.isRequired,
		allChecked: PropTypes.func.isRequired,
		clearAllDone: PropTypes.func.isRequired
	};

	// 全选/全不选
	handleChange = event => {
		this.props.allChecked(event.target.checked);
	};

	// 清除已完成任务
	handleClearDone = () => {
		this.props.clearAllDone();
	};

	render() {
		const { todoList } = this.props;
		const doneCount = todoList.reduce((pre, todo) => pre + (todo.done ? 1 : 0), 0);
		const allCount = todoList.length;
		return (
			<div className="todo-footer">
				<Checkbox
					className="todo-checkAll"
					checked={doneCount === allCount && allCount !== 0 ? true : false}
					onChange={this.handleChange}
				>
					已完成 {doneCount} / 全部 {allCount}
				</Checkbox>
				<Button type="primary" danger icon={<DeleteOutlined />} onClick={this.handleClearDone}>
					清除已完成任务
				</Button>
			</div>
		);
	}
}
