import { Component } from "react";
import { Card, List, Typography } from "antd";

import TodoHeader from "./Heaher";
import TodoItem from "./Item";
import TodoFooter from "./Footer";

const { Title } = Typography;

import "./index.css";

// TodoList：
// 1. 添加任务
// 2. 删除任务
// 3. 更新任务状态
// 4. 全选/全不选
// 5. 清除已完成的任务

// 参考链接：https://juejin.cn/post/7101490699178082341
// 参考视频：https://www.bilibili.com/video/BV1eS4y1t7w4?p=56

// 总结：

// 1. 拆分组件、实现静态组件，注意：className、style的写法

// 2. 动态初始化列表，如何确定将数据放在哪个组件的state中？
// - 某个组件使用：放在其自身的state中
// - 某些组件使用：放在他们共同的父组件state中（官方称此操作为：状态提升）

// 3.1 父子组件间如何通信？
// - 【父组件】给【子组件】传递数据：通过props传递
// - 【子组件】给【父组件】传递数据：通过props传递，要求父提前给子传递一个函数

// 3.2 兄弟组件如何通信？
// - 方式1：交给统一的父组件管理数据，通过props传递给下面的组件使用
// - 方式2：兄弟组件通信可以通过发布-订阅模式来实现

// 4. 注意defaultChecked 和 checked的区别，类似的还有：defaultValue 和 value

// 5. 状态在哪里，操作状态的方法就在哪里

// 待办事项列表组件
export default class TodoList extends Component {
	state = {
		todoList: [
			{ id: 1, name: "吃饭", done: true },
			{ id: 2, name: "睡觉", done: true },
			{ id: 3, name: "逛街", done: false },
			{ id: 4, name: "上班", done: false }
		]
	};

	// 添加todo
	addTodo = todoObj => {
		const { todoList } = this.state;
		const newTodoList = [todoObj, ...todoList];
		this.setState({
			todoList: newTodoList
		});
	};

	// 更新todo
	updateTodo = (id, done) => {
		const { todoList } = this.state;
		const newTodos = todoList.map(item => {
			if (item.id === id) {
				return { ...item, done: done };
			} else {
				return item;
			}
		});
		this.setState({ todoList: newTodos });
	};

	// 删除
	delTodo = id => {
		const { todoList } = this.state;
		const newTodos = todoList.filter(item => {
			return item.id !== id;
		});
		this.setState({ todoList: newTodos });
	};

	// 全选/全不选
	allChecked = done => {
		const { todoList } = this.state;
		const newTodos = todoList.map(item => {
			return { ...item, done: done };
		});
		this.setState({ todoList: newTodos });
	};

	// 清除所以已经完成的任务
	clearAllDone = () => {
		const { todoList } = this.state;
		const newTodos = todoList.filter(item => {
			return !item.done;
		});
		this.setState({ todoList: newTodos });
	};

	render() {
		const { todoList } = this.state;
		return (
			<div className="todo-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<Card
					style={{
						width: 650
					}}
				>
					<Title level={3}>TodoList</Title>
					<TodoHeader addTodo={this.addTodo} />
					<Title level={5} style={{ marginTop: 10 }}>
						待处理({todoList.filter(c => !c.done).length})
					</Title>
					<List
						size="small"
						header={null}
						footer={null}
						bordered
						dataSource={todoList.filter(c => !c.done)}
						locale={{ emptyText: "没有数据" }}
						renderItem={item => {
							return (
								<List.Item className="todo-list-item">
									<TodoItem {...item} key={item.id} updateTodo={this.updateTodo} delTodo={this.delTodo} />
								</List.Item>
							);
						}}
					/>
					<Title level={5} style={{ marginTop: 10 }}>
						已完成({todoList.filter(c => c.done).length})
					</Title>
					<List
						size="small"
						header={null}
						footer={null}
						bordered
						dataSource={todoList.filter(c => c.done)}
						locale={{ emptyText: "没有数据" }}
						renderItem={item => {
							return (
								<List.Item className="todo-list-item">
									<TodoItem {...item} key={item.id} updateTodo={this.updateTodo} delTodo={this.delTodo} />
								</List.Item>
							);
						}}
					/>
					<TodoFooter todoList={todoList} allChecked={this.allChecked} clearAllDone={this.clearAllDone} />
				</Card>
			</div>
		);
	}
}
