import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import TodoItem from "./index";

// 可拖拽的待办事项项组件
const DraggableTodoItem = ({
	item,
	moveTodo,
	updateTodo,
	delTodo,
	updatePriority,
	updateName,
	disabled,
	categories,
	moveToCategory
}) => {
	const ref = React.useRef(null);
	const [editing, setEditing] = useState(false);

	const isDisabled = disabled || editing;

	const handleEditChange = (id, isEditing) => {
		if (id === item.id) {
			setEditing(isEditing);
		}
	};

	const [{ isDragging }, drag] = useDrag({
		type: "todo",
		item: { id: item.id, priority: item.priority, done: item.done },
		canDrag: !isDisabled,
		collect: monitor => ({
			isDragging: monitor.isDragging()
		}),
		end: (dragItem, monitor) => {
			const dropResult = monitor.getDropResult();
			if (dragItem && dropResult) {
				// 拖拽结束时，调用moveTodo方法
				moveTodo(dragItem.id, dropResult.id, dragItem.priority, dragItem.done);
			}
		}
	});

	const [, drop] = useDrop({
		accept: "todo",
		hover(dragItem, monitor) {
			if (!ref.current || isDisabled) return;

			// 只有同一优先级和同一完成状态的项目才能互相拖拽
			if (dragItem.priority !== item.priority || dragItem.done !== item.done) return;

			// 确定鼠标是否越过了项目的一半，以确定我们是向上还是向下移动
			const hoverBoundingRect = ref.current.getBoundingClientRect();
			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const clientOffset = monitor.getClientOffset();
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			// 这里不需要更新索引，因为我们使用id来标识项目
		},
		drop(dragItem, monitor) {
			if (isDisabled) {
				return null;
			}
			// 只有同一优先级和同一完成状态的项目才能互相拖拽
			if (dragItem.priority !== item.priority || dragItem.done !== item.done) {
				return null;
			}
			// 返回dropResult，供drag的end方法使用
			return { id: item.id };
		}
	});

	drag(drop(ref));

	return (
		<div ref={ref} style={{ opacity: isDragging ? 0.5 : 1, cursor: isDisabled ? "default" : "move", width: "100%" }}>
			<TodoItem
				key={item.id}
				{...item}
				updateTodo={updateTodo}
				delTodo={delTodo}
				updatePriority={updatePriority}
				updateName={updateName}
				onEditChange={handleEditChange}
				categories={categories}
				moveToCategory={moveToCategory}
			/>
		</div>
	);
};

export default DraggableTodoItem;
