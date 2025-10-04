import { Component } from "react";
import { Button, Checkbox } from "antd";
import PropTypes from "prop-types";

import { DeleteOutlined } from "@ant-design/icons";

import "./index.css";

export default class TodoItem extends Component {
	// 使用 PropTypes 进行类型检查
	static propTypes = {
		id: PropTypes.any.isRequired,
		name: PropTypes.string.isRequired,
		done: PropTypes.bool.isRequired,
		updateTodo: PropTypes.func.isRequired,
		delTodo: PropTypes.func.isRequired
	};

	state = {
		mouse: false // 鼠标的移入\移出标记
	};

	// 鼠标移入\移出
	handleMouse = mouse => {
		return () => {
			this.setState({
				mouse: mouse
			});
		};
	};

	// 更新todo状态
	handleChecked = id => {
		return event => {
			this.props.updateTodo(id, event.target.checked);
		};
	};

	// 删除
	handleDel = id => {
		return () => {
			this.props.delTodo(id);
		};
	};

	render() {
		const { id, name, done } = this.props;
		const { mouse } = this.state;
		return (
			<div className="todo-item" onMouseLeave={this.handleMouse(false)} onMouseEnter={this.handleMouse(true)}>
				<Checkbox checked={done} onChange={this.handleChecked(id)}>
					<span style={{ textDecoration: done ? "line-through" : "none" }}>{name}</span>
				</Checkbox>
				<Button
					className="todo-btn-delete"
					style={{ display: mouse ? "block" : "none", float: "right" }}
					type="primary"
					danger
					icon={<DeleteOutlined />}
					onClick={this.handleDel(id)}
				>
					删除
				</Button>
			</div>
		);
	}
}
