import { AnyAction } from "redux";
import produce from "immer";
import { LockState } from "@/redux/interface";
import * as types from "@/redux/mutation-types";

const initialLockState: LockState = {
	hydrated: false,
	locked: false,
	lockedAt: null,
	lastActiveAt: 0,
	version: 0,
	autoLockEnabled: false,
	idleTimeoutMinutes: 15
};

const lock = (state: LockState = initialLockState, action: AnyAction) =>
	produce(state, draftState => {
		switch (action.type) {
			case types.HYDRATE_LOCK:
				draftState.hydrated = true;
				if (action.runtime) {
					draftState.locked = action.runtime.locked;
					draftState.lockedAt = action.runtime.lockedAt;
					draftState.lastActiveAt = action.runtime.lastActiveAt;
					draftState.version = action.runtime.version;
				} else {
					draftState.locked = false;
					draftState.lockedAt = null;
					draftState.lastActiveAt = 0;
					draftState.version = 0;
				}
				break;
			case types.SYNCHRONIZE_LOCK_RUNTIME:
				if (action.runtime.version <= state.version) return;
				draftState.locked = action.runtime.locked;
				draftState.lockedAt = action.runtime.lockedAt;
				draftState.lastActiveAt = action.runtime.lastActiveAt;
				draftState.version = action.runtime.version;
				break;
			case types.LOCK_SCREEN:
				draftState.locked = true;
				draftState.lockedAt = action.at;
				draftState.version = action.at;
				break;
			case types.UNLOCK_SCREEN:
				draftState.locked = false;
				draftState.lockedAt = null;
				draftState.lastActiveAt = action.at;
				draftState.version = action.at;
				break;
			case types.RECORD_LOCK_ACTIVITY:
				draftState.lastActiveAt = action.at;
				draftState.version = action.at;
				break;
			case types.SET_LOCK_PREFERENCE:
				draftState.autoLockEnabled = action.preference.autoLockEnabled;
				draftState.idleTimeoutMinutes = action.preference.idleTimeoutMinutes;
				break;
			case types.RESET_LOCK_RUNTIME:
				draftState.hydrated = true;
				draftState.locked = false;
				draftState.lockedAt = null;
				draftState.lastActiveAt = 0;
				draftState.version = 0;
				break;
		}
	});

export default lock;
