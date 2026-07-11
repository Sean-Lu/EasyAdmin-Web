let lockAvatarSrc = "";

export const setLockAvatar = (avatarSrc: string): void => {
	lockAvatarSrc = avatarSrc;
};

export const getLockAvatar = (): string => lockAvatarSrc;
