import { useEffect, useState } from "react";
import { BackendIdInput } from "@/api/interface";
import { getAvatarObjectUrl } from "@/api/modules/login";

interface AvatarLoadDependencies {
	load: (avatarFileId?: BackendIdInput) => Promise<string>;
	setAvatarSrc: (avatarSrc: string) => void;
	revoke: (avatarSrc: string) => void;
}

export const loadUserAvatar = (avatarFileId: BackendIdInput | undefined, dependencies: AvatarLoadDependencies) => {
	let activeObjectUrl = "";
	let disposed = false;
	dependencies.setAvatarSrc("");

	dependencies
		.load(avatarFileId)
		.then(avatarSrc => {
			if (disposed) {
				if (avatarSrc.startsWith("blob:")) dependencies.revoke(avatarSrc);
				return;
			}
			activeObjectUrl = avatarSrc.startsWith("blob:") ? avatarSrc : "";
			dependencies.setAvatarSrc(avatarSrc);
		})
		.catch(() => {
			if (!disposed) dependencies.setAvatarSrc("");
		});

	return () => {
		disposed = true;
		if (activeObjectUrl) {
			dependencies.revoke(activeObjectUrl);
			activeObjectUrl = "";
		}
	};
};

const useUserAvatar = (avatarFileId?: BackendIdInput) => {
	const [avatarSrc, setAvatarSrc] = useState("");

	useEffect(
		() =>
			loadUserAvatar(avatarFileId, {
				load: getAvatarObjectUrl,
				setAvatarSrc,
				revoke: avatarSrc => URL.revokeObjectURL(avatarSrc)
			}),
		[avatarFileId]
	);

	return avatarSrc;
};

export default useUserAvatar;
