import type { UserInfo } from "@/api/modules/login";

export interface UserProfileUpdate {
	userInfo: UserInfo;
	avatarSrc?: string;
}

type UserProfileListener = (update: UserProfileUpdate) => void;

const listeners = new Set<UserProfileListener>();

export const publishUserProfileUpdate = (update: UserProfileUpdate): void => {
	listeners.forEach(listener => listener(update));
};

export const subscribeUserProfileUpdate = (listener: UserProfileListener): (() => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
