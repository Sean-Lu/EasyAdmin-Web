import React, { useRef } from "react";
import { DeleteOutlined, EditOutlined, MenuOutlined } from "@ant-design/icons";
import { Button, Space, Tag, Tooltip } from "antd";
import { useDrag, useDrop } from "react-dnd";
import { BackendIdInput } from "@/api/interface";
import { NoteCategoryDto } from "@/services/tool/noteService";

const NOTE_CATEGORY_DND_TYPE = "note-category";

interface NoteCategoryDragItem {
	id: BackendIdInput;
}

interface DraggableNoteCategoryItemProps {
	category: NoteCategoryDto;
	selected: boolean;
	disabled: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onDrop: (draggedId: BackendIdInput, targetId: BackendIdInput) => void;
}

const DraggableNoteCategoryItem = ({
	category,
	selected,
	disabled,
	onSelect,
	onEdit,
	onDelete,
	onDrop
}: DraggableNoteCategoryItemProps) => {
	const itemRef = useRef<HTMLDivElement>(null);
	const handleRef = useRef<HTMLSpanElement>(null);
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: NOTE_CATEGORY_DND_TYPE,
			item: { id: category.id },
			canDrag: !disabled,
			collect: monitor => ({ isDragging: monitor.isDragging() })
		}),
		[category.id, disabled]
	);
	const [{ isOver }, drop] = useDrop(
		() => ({
			accept: NOTE_CATEGORY_DND_TYPE,
			canDrop: (item: NoteCategoryDragItem) => !disabled && String(item.id) !== String(category.id),
			drop: (item: NoteCategoryDragItem) => onDrop(item.id, category.id),
			collect: monitor => ({ isOver: monitor.isOver() && monitor.canDrop() })
		}),
		[category.id, disabled, onDrop]
	);

	drop(itemRef);
	drag(handleRef);

	return (
		<div
			ref={itemRef}
			className={`note-category-item${selected ? " note-category-item-active" : ""}${
				isOver ? " note-category-item-drop-target" : ""
			}`}
			style={{ opacity: isDragging ? 0.45 : 1 }}
			onClick={onSelect}
		>
			<div className="note-category-label">
				<Tooltip title="拖拽排序">
					<span ref={handleRef} className={`note-category-drag-handle${disabled ? " disabled" : ""}`}>
						<MenuOutlined />
					</span>
				</Tooltip>
				<span className="note-category-name">{category.name}</span>
			</div>
			<Space size={4}>
				<Tag>{category.noteCount || 0}</Tag>
				<Button
					size="small"
					type="text"
					icon={<EditOutlined />}
					onClick={event => {
						event.stopPropagation();
						onEdit();
					}}
				/>
				<Button
					size="small"
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={event => {
						event.stopPropagation();
						onDelete();
					}}
				/>
			</Space>
		</div>
	);
};

export default DraggableNoteCategoryItem;
