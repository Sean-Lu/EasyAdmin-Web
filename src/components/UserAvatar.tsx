import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import type { ComponentProps } from "react";
import { forwardRef, useEffect, useState } from "react";

type UserAvatarProps = ComponentProps<typeof Avatar> & { src?: string };

const UserAvatar = forwardRef<HTMLSpanElement, UserAvatarProps>(({ src, children, onError, ...props }, ref) => {
	const [imageFailed, setImageFailed] = useState(false);
	const showDefaultAvatar = !src || imageFailed;

	useEffect(() => setImageFailed(false), [src]);

	return (
		<Avatar
			ref={ref}
			{...props}
			src={showDefaultAvatar ? undefined : src}
			icon={showDefaultAvatar ? <UserOutlined /> : undefined}
			onError={() => {
				setImageFailed(true);
				return onError?.() ?? false;
			}}
		>
			{showDefaultAvatar ? undefined : children}
		</Avatar>
	);
});

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
