import { Component } from "react";
import { Button, Checkbox } from "antd";
import PropTypes from "prop-types";

// 待办事项底部组件
export default class TodoFooter extends Component {
	// 使用 PropTypes 进行类型检查
	static propTypes = {
		todoList: PropTypes.array.isRequired,
		allChecked: PropTypes.func.isRequired,
		clearAllDone: PropTypes.func.isRequired
	};

	// 处理全选复选框
	handleCheckAll = e => {
		this.props.allChecked(e.target.checked);
	};

	// 处理清除已完成任务
	handleClearAllDone = () => {
		this.props.clearAllDone();
	};

	render() {
		const { todoList } = this.props;
		const doneCount = todoList.filter(item => item.done).length;
		const totalCount = todoList.length;

		return (
			<div
				className="todo-footer"
				style={{
					height: "40px",
					padding: "0 16px",
					marginTop: "5px",
					lineHeight: "40px",
					borderTop: "1px solid #e8e8e8",
					backgroundColor: "#ffffff",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				}}
			>
				<Checkbox className="todo-checkAll" checked={totalCount > 0 && doneCount === totalCount} onChange={this.handleCheckAll}>
					已完成 {doneCount} / 全部 {totalCount}
				</Checkbox>
				<Button onClick={this.handleClearAllDone} danger type="primary" size="default">
					清除已完成任务
				</Button>
			</div>
		);
	}
}
