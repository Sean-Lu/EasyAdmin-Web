import * as types from "@/redux/mutation-types";
import { LockPreference, LockRuntime } from "@/redux/interface";

export const hydrateLock = (runtime: LockRuntime | null) => ({
	type: types.HYDRATE_LOCK,
	runtime
});

export const synchronizeLockRuntime = (runtime: LockRuntime) => ({
	type: types.SYNCHRONIZE_LOCK_RUNTIME,
	runtime
});

export const lockScreen = (at: number) => ({ type: types.LOCK_SCREEN, at });

export const unlockScreen = (at: number) => ({ type: types.UNLOCK_SCREEN, at });

export const recordActivity = (at: number) => ({ type: types.RECORD_LOCK_ACTIVITY, at });

export const recordLockActivity = recordActivity;

export const resetLockRuntime = () => ({ type: types.RESET_LOCK_RUNTIME });

export const setLockPreference = (preference: LockPreference) => ({
	type: types.SET_LOCK_PREFERENCE,
	preference
});
