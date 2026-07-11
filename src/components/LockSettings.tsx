import { Select, Switch } from "antd";
import { useTranslation } from "react-i18next";
import type { BackendId } from "@/api/interface";
import type { IdleTimeoutMinutes, LockPreference } from "@/redux/interface";
import { ALLOWED_IDLE_TIMEOUTS, writeLockPreference } from "@/utils/lockStorage";

type WritePreference = (userId: string, preference: LockPreference) => void;
type SetPreference = (preference: LockPreference) => void;

export const saveLockSettings = (
	userId: BackendId,
	preference: LockPreference,
	write: WritePreference = writeLockPreference,
	setPreference?: SetPreference
) => {
	write(String(userId), preference);
	setPreference?.(preference);
};

interface Props extends LockPreference {
	userId?: BackendId;
	setLockPreference: SetPreference;
}

const LockSettings = ({ userId, autoLockEnabled, idleTimeoutMinutes, setLockPreference }: Props) => {
	const { t } = useTranslation();
	const update = (preference: LockPreference) => {
		if (userId === undefined || userId === null) return;
		saveLockSettings(userId, preference, writeLockPreference, setLockPreference);
	};

	return (
		<>
			<div className="theme-item">
				<span>{t("lockScreen.automaticLock")}</span>
				<Switch
					aria-label={t("lockScreen.automaticLock")}
					checked={autoLockEnabled}
					onChange={checked => update({ autoLockEnabled: checked, idleTimeoutMinutes })}
				/>
			</div>
			<div className="theme-item">
				<span>{t("lockScreen.timeout")}</span>
				<Select
					aria-label={t("lockScreen.timeout")}
					value={idleTimeoutMinutes}
					options={ALLOWED_IDLE_TIMEOUTS.map(minutes => ({ label: `${minutes} min`, value: minutes }))}
					onChange={(minutes: IdleTimeoutMinutes) => update({ autoLockEnabled, idleTimeoutMinutes: minutes })}
				/>
			</div>
		</>
	);
};

export default LockSettings;
