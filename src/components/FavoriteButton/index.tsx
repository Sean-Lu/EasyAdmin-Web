import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Tooltip, message } from "antd";
import type { ButtonProps } from "antd";
import { BackendIdInput } from "@/api/interface";
import { FavoriteService, FavoriteTargetType } from "@/services/user/favoriteService";

interface FavoriteButtonProps {
	targetType: FavoriteTargetType;
	targetId: BackendIdInput;
	favoriteId?: BackendIdInput;
	onChange: (favoriteId?: BackendIdInput) => void;
	size?: ButtonProps["size"];
	type?: ButtonProps["type"];
}

const FavoriteButton = ({ targetType, targetId, favoriteId, onChange, size, type }: FavoriteButtonProps) => {
	const [loading, setLoading] = useState(false);
	const toggle = async (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		try {
			setLoading(true);
			const result = favoriteId ? await FavoriteService.remove(favoriteId) : await FavoriteService.add(targetType, targetId);
			onChange(result.favoriteId);
			message.success(result.isFavorite ? "收藏成功" : "已取消收藏");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Tooltip title={favoriteId ? "取消收藏" : "收藏"}>
			<Button
				aria-label={favoriteId ? "取消收藏" : "收藏"}
				type={type}
				size={size}
				loading={loading}
				icon={favoriteId ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
				onMouseDown={event => event.stopPropagation()}
				onClick={toggle}
			/>
		</Tooltip>
	);
};

export default FavoriteButton;
