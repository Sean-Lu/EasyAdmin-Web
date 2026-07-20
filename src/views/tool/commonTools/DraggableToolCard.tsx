import React, { useCallback, useEffect, useRef } from "react";
import { HolderOutlined } from "@ant-design/icons";
import { Button, Card, Col, Tag, Tooltip, Typography } from "antd";
import { useDrag, useDrop } from "react-dnd";
import FavoriteButton from "@/components/FavoriteButton";
import { BackendId, BackendIdInput } from "@/api/interface";
import { FavoriteTargetType } from "@/services/user/favoriteService";
import { ToolItem } from "./toolCatalog";

const TOOL_CARD_DND_TYPE = "toolbox-tool-card";

interface DragItem {
	id: BackendId;
	isFavorite: boolean;
}

interface DraggableToolCardProps {
	tool: ToolItem;
	isFavorite: boolean;
	favoriteId?: BackendIdInput;
	favoriteDisabled: boolean;
	dragDisabled: boolean;
	onFavoriteChange: (toolId: BackendId, favoriteId?: BackendIdInput) => void;
	onOpen: (tool: ToolItem) => void;
	onDrop: (draggedId: BackendId, targetId: BackendId) => void;
}

const DraggableToolCard = ({
	tool,
	isFavorite,
	favoriteId,
	favoriteDisabled,
	dragDisabled,
	onFavoriteChange,
	onOpen,
	onDrop
}: DraggableToolCardProps) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const handleRef = useRef<HTMLButtonElement>(null);
	const dragPointRef = useRef<{ x: number; y: number } | null>(null);
	const [{ isDragging }, drag, preview] = useDrag(
		() => ({
			type: TOOL_CARD_DND_TYPE,
			item: { id: tool.id, isFavorite },
			canDrag: !dragDisabled,
			collect: monitor => ({ isDragging: monitor.isDragging() })
		}),
		[dragDisabled, isFavorite, tool.id]
	);
	const [{ isOver }, drop] = useDrop(
		() => ({
			accept: TOOL_CARD_DND_TYPE,
			canDrop: (item: DragItem) => !dragDisabled && item.isFavorite === isFavorite && item.id !== tool.id,
			drop: (item: DragItem) => onDrop(item.id, tool.id),
			collect: monitor => ({ isOver: monitor.isOver() && monitor.canDrop() })
		}),
		[dragDisabled, isFavorite, onDrop, tool.id]
	);

	preview(drop(cardRef));
	drag(handleRef);
	const updateDragPoint = useCallback((clientX: number, clientY: number) => {
		if (clientX === 0 && clientY === 0) return;
		dragPointRef.current = { x: clientX, y: clientY };
	}, []);

	useEffect(() => {
		if (!isDragging) return;
		const scrollContainer = cardRef.current?.closest<HTMLElement>(".ant-layout-content");
		if (!scrollContainer) return;

		const edgeSize = 120;
		const minSpeed = 6;
		const maxSpeed = 22;
		let animationFrame = 0;
		const handleDragOver = (event: DragEvent) => {
			updateDragPoint(event.clientX, event.clientY);
		};
		const scrollAtEdge = () => {
			const point = dragPointRef.current;
			if (point) {
				const rect = scrollContainer.getBoundingClientRect();
				const top = Math.max(rect.top, 0);
				const bottom = Math.min(rect.bottom, window.innerHeight);
				let speed = 0;
				if (point.x >= rect.left && point.x <= rect.right) {
					if (point.y < top + edgeSize) {
						const ratio = Math.min(1, (top + edgeSize - point.y) / edgeSize);
						speed = -Math.max(minSpeed, Math.ceil(maxSpeed * ratio));
					} else if (point.y > bottom - edgeSize) {
						const ratio = Math.min(1, (point.y - bottom + edgeSize) / edgeSize);
						speed = Math.max(minSpeed, Math.ceil(maxSpeed * ratio));
					}
				}
				if (speed !== 0) scrollContainer.scrollTop += speed;
			}
			animationFrame = window.requestAnimationFrame(scrollAtEdge);
		};

		window.addEventListener("dragover", handleDragOver, true);
		animationFrame = window.requestAnimationFrame(scrollAtEdge);
		return () => {
			window.removeEventListener("dragover", handleDragOver, true);
			window.cancelAnimationFrame(animationFrame);
			dragPointRef.current = null;
		};
	}, [isDragging, updateDragPoint]);

	return (
		<Col xs={24} sm={12} lg={8} xl={6}>
			<div ref={cardRef} className={isOver ? "tool-card-drop-target" : undefined} style={{ opacity: isDragging ? 0.45 : 1 }}>
				<Card className="tool-card" hoverable onClick={() => onOpen(tool)}>
					<div className="tool-card-favorite">
						<FavoriteButton
							targetType={FavoriteTargetType.Tool}
							targetId={tool.id}
							favoriteId={favoriteId}
							type="text"
							disabled={favoriteDisabled}
							onChange={nextFavoriteId => onFavoriteChange(tool.id, nextFavoriteId)}
						/>
					</div>
					<div className="tool-card-icon">{tool.icon}</div>
					<Typography.Title level={4}>{tool.title}</Typography.Title>
					<Typography.Text type="secondary">{tool.description}</Typography.Text>
					<div className="tool-card-footer">
						<Tag>{tool.tag}</Tag>
						<Tooltip title={dragDisabled ? "清空搜索或等待保存完成后可调整排序" : "拖拽调整排序"}>
							<Button
								ref={handleRef}
								className="tool-card-drag-handle"
								type="text"
								disabled={dragDisabled}
								aria-label="拖拽调整排序"
								icon={<HolderOutlined />}
								onDrag={event => updateDragPoint(event.clientX, event.clientY)}
								onMouseDown={event => event.stopPropagation()}
								onClick={event => event.stopPropagation()}
							/>
						</Tooltip>
					</div>
				</Card>
			</div>
		</Col>
	);
};

export default DraggableToolCard;
