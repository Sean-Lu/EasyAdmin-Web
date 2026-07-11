import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import { getAvatarObjectUrl, getUserInfo } from "@/api/modules/login";
import {
	hydrateLock,
	lockScreen,
	recordActivity,
	resetLockRuntime,
	setLockPreference,
	synchronizeLockRuntime
} from "@/redux/modules/lock/action";
import { LockRuntime, LockState } from "@/redux/interface";
import useIdleLock from "@/hooks/useIdleLock";
import { LOCK_RUNTIME_KEY, clearLockRuntime, readLockPreference, readLockRuntime, writeLockRuntime } from "@/utils/lockStorage";
import {
	acceptNewerRuntime,
	applyPreloadedLockAvatar,
	clearRuntimeForEmptyToken,
	completeLockHydrationAfterUserInfoFailure,
	loadLockAvatar,
	refreshLockAvatar,
	releaseLockAvatar
} from "./lockCoordinatorUtils";
import { isLockHydratedForToken, setLockedContentAccessibility, shouldAcceptProfileUpdate } from "./lockCoordinatorUtils";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { applyRemoteLogout, handleLogoutStorageEvent } from "@/utils/sessionSync";
import { subscribeUserProfileUpdate } from "@/utils/userProfileSync";
import LockScreen from "./LockScreen";
import { getLockAvatar } from "@/utils/lockAvatar";
import type { UserInfo } from "@/api/modules/login";

interface Props {
	children: ReactNode;
	token: string;
	lock: LockState;
	hydrateLock: typeof hydrateLock;
	setLockPreference: typeof setLockPreference;
	recordActivity: typeof recordActivity;
	lockScreen: typeof lockScreen;
	resetLockRuntime: typeof resetLockRuntime;
	setToken: typeof setToken;
	setTabsList: typeof setTabsList;
	synchronizeLockRuntime: typeof synchronizeLockRuntime;
}

const LockCoordinator = (props: Props) => {
	const [userInfo, setUserInfo] = useState<UserInfo>();
	const [avatarSrc, setAvatarSrc] = useState("");
	const avatarSrcRef = useRef("");
	const [hydratedToken, setHydratedToken] = useState("");
	const routedContentRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const versionRef = useRef(props.lock.version);
	const userIdRef = useRef("");
	const avatarRequestVersionRef = useRef(0);
	versionRef.current = props.lock.version;

	const replaceAvatarSrc = (nextAvatarSrc: string) => {
		if (avatarSrcRef.current !== nextAvatarSrc) releaseLockAvatar(avatarSrcRef.current, URL.revokeObjectURL);
		avatarSrcRef.current = nextAvatarSrc;
		setAvatarSrc(nextAvatarSrc);
	};

	useEffect(
		() => () => {
			releaseLockAvatar(avatarSrcRef.current, URL.revokeObjectURL);
			avatarSrcRef.current = "";
		},
		[]
	);

	useEffect(() => {
		let active = true;
		if (!props.token) {
			setHydratedToken("");
			userIdRef.current = "";
			setUserInfo(undefined);
			replaceAvatarSrc("");
			clearRuntimeForEmptyToken(props.token, clearLockRuntime, props.resetLockRuntime);
			return () => {
				active = false;
			};
		}

		getUserInfo(true)
			.then(async ({ data }) => {
				if (!active) return;
				const userId = String(data.id);
				userIdRef.current = userId;
				setUserInfo(data);
				const avatarRequestVersion = ++avatarRequestVersionRef.current;
				const nextAvatarSrc = await loadLockAvatar(data.avatarFileId, avatarFileId => getAvatarObjectUrl(avatarFileId, true));
				if (!active || avatarRequestVersion !== avatarRequestVersionRef.current) {
					releaseLockAvatar(nextAvatarSrc, URL.revokeObjectURL);
					return;
				}
				const runtime = readLockRuntime(userId);
				const applied = applyPreloadedLockAvatar(active, nextAvatarSrc, {
					replace: replaceAvatarSrc,
					hydrate: props.hydrateLock,
					record: props.recordActivity,
					revoke: URL.revokeObjectURL,
					runtime,
					at: Date.now()
				});
				if (!applied) return;
				props.setLockPreference(readLockPreference(userId));
				setHydratedToken(props.token);
			})
			.catch(() => {
				if (!active) return;
				userIdRef.current = "";
				completeLockHydrationAfterUserInfoFailure(props.hydrateLock, props.recordActivity, Date.now());
				setHydratedToken(props.token);
			});
		return () => {
			active = false;
		};
	}, [props.token]);

	useEffect(() => {
		let active = true;
		const unsubscribe = subscribeUserProfileUpdate(({ userInfo, avatarSrc }) => {
			if (!active || !shouldAcceptProfileUpdate(userIdRef.current, String(userInfo.id))) return;
			userIdRef.current = String(userInfo.id);
			setUserInfo(userInfo);
			if (avatarSrc !== undefined) {
				replaceAvatarSrc(avatarSrc);
				return;
			}
			const avatarRequestVersion = ++avatarRequestVersionRef.current;
			void refreshLockAvatar(true, userInfo.avatarFileId, avatarFileId => getAvatarObjectUrl(avatarFileId, true), {
				replace: avatarSrc => {
					if (!active || avatarRequestVersion !== avatarRequestVersionRef.current) {
						releaseLockAvatar(avatarSrc, URL.revokeObjectURL);
						return;
					}
					replaceAvatarSrc(avatarSrc);
				},
				revoke: URL.revokeObjectURL
			});
		});
		return () => {
			active = false;
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		setLockedContentAccessibility(routedContentRef.current, props.lock.locked);
		if (props.lock.locked) {
			const currentAvatarSrc = getLockAvatar();
			if (currentAvatarSrc) replaceAvatarSrc(currentAvatarSrc);
		}
		return () => setLockedContentAccessibility(routedContentRef.current, false);
	}, [props.lock.locked]);

	useEffect(() => {
		const synchronize = (event: StorageEvent) => {
			if (event.key === LOCK_RUNTIME_KEY && userIdRef.current) {
				acceptNewerRuntime(event.newValue, userIdRef.current, versionRef.current, props.synchronizeLockRuntime);
			}
			handleLogoutStorageEvent(event.key, event.newValue, () => {
				applyRemoteLogout({
					setToken: props.setToken,
					setTabsList: props.setTabsList,
					resetRuntime: props.resetLockRuntime,
					clearRuntime: clearLockRuntime,
					removeStorage: key => localStorage.removeItem(key),
					navigateLogin: () => navigate("/login", { replace: true })
				});
			});
		};
		window.addEventListener("storage", synchronize);
		return () => window.removeEventListener("storage", synchronize);
	}, [props.resetLockRuntime, props.setTabsList, props.setToken, props.synchronizeLockRuntime, navigate]);

	useEffect(() => {
		if (!props.token || !userIdRef.current || !props.lock.hydrated || props.lock.version === 0) return;
		const runtime: LockRuntime = {
			locked: props.lock.locked,
			lockedAt: props.lock.lockedAt,
			lastActiveAt: props.lock.lastActiveAt,
			version: props.lock.version
		};
		writeLockRuntime(userIdRef.current, runtime);
	}, [props.token, props.lock.hydrated, props.lock.locked, props.lock.lockedAt, props.lock.lastActiveAt, props.lock.version]);

	const onActivity = useCallback((at: number) => props.recordActivity(at), [props.recordActivity]);
	const onIdle = useCallback((at: number) => props.lockScreen(at), [props.lockScreen]);
	useIdleLock({
		enabled: props.lock.hydrated && props.lock.autoLockEnabled,
		locked: props.lock.locked,
		lastActiveAt: props.lock.lastActiveAt,
		idleTimeoutMinutes: props.lock.idleTimeoutMinutes,
		onActivity,
		onIdle
	});

	return props.lock.hydrated && isLockHydratedForToken(props.token, hydratedToken) ? (
		<>
			<div ref={routedContentRef} style={{ display: "contents" }}>
				{props.children}
			</div>
			{props.lock.locked && <LockScreen userInfo={userInfo} avatarSrc={avatarSrc} lockedAt={props.lock.lockedAt} />}
		</>
	) : (
		<Loading />
	);
};

const mapStateToProps = (state: { global: { token: string }; lock: LockState }) => ({
	token: state.global.token,
	lock: state.lock
});
const mapDispatchToProps = {
	hydrateLock,
	setLockPreference,
	recordActivity,
	lockScreen,
	resetLockRuntime,
	setToken,
	setTabsList,
	synchronizeLockRuntime
};
export default connect(mapStateToProps, mapDispatchToProps)(LockCoordinator);
