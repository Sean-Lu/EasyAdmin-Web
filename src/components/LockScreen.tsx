import { Alert, Button, Form, Input, Typography, theme } from "antd";
import { UnlockOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { verifyPasswordApi, logoutApi, type UserInfo } from "@/api/modules/login";
import { unlockScreen, resetLockRuntime } from "@/redux/modules/lock/action";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { clearLockRuntime } from "@/utils/lockStorage";
import { broadcastLogout } from "@/utils/sessionSync";
import { runUnlock, switchAccountCleanup, unlockErrorTranslationKey, type UnlockError } from "./lockScreenLogic";
import UserAvatar from "./UserAvatar";
import "./LockScreen.less";

interface Props {
	userInfo?: UserInfo;
	avatarSrc: string;
	lockedAt: number | null;
	unlockScreen: typeof unlockScreen;
	resetLockRuntime: typeof resetLockRuntime;
	setToken: typeof setToken;
	setTabsList: typeof setTabsList;
}

const LockScreen = (props: Props) => {
	const [form] = Form.useForm<{ password: string }>();
	const [submitting, setSubmitting] = useState(false);
	const [unlockError, setUnlockError] = useState<UnlockError | null>(null);
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { token } = theme.useToken();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();
	}, []);

	const containFocus = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab") return;
		const focusable = Array.from(
			dialogRef.current?.querySelectorAll<HTMLElement>("input, button, [tabindex]:not([tabindex='-1'])") || []
		).filter(element => !element.hasAttribute("disabled"));
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	const submit = async ({ password }: { password: string }) => {
		setSubmitting(true);
		await runUnlock(password, {
			verify: async hash => (await verifyPasswordApi(hash)).data === true,
			now: Date.now,
			unlock: props.unlockScreen,
			resetFields: form.resetFields,
			setError: setUnlockError
		});
		setSubmitting(false);
	};

	const switchAccount = () =>
		switchAccountCleanup({
			logout: logoutApi,
			clearToken: props.setToken,
			clearTabs: props.setTabsList,
			resetRuntime: props.resetLockRuntime,
			removeStorage: key => localStorage.removeItem(key),
			clearRuntime: clearLockRuntime,
			broadcastLogout,
			navigateLogin: () => navigate("/login", { replace: true })
		});
	const unlockErrorText = unlockErrorTranslationKey(unlockError);

	return (
		<div
			ref={dialogRef}
			className="lock-screen"
			role="dialog"
			aria-modal="true"
			aria-labelledby="lock-screen-title"
			onKeyDown={containFocus}
			style={{ background: token.colorBgBase }}
		>
			<div className="lock-screen-card" style={{ color: token.colorText, background: token.colorBgContainer }}>
				<UserAvatar size={72} src={props.avatarSrc}>
					{props.userInfo?.nickName?.slice(0, 1) || props.userInfo?.userName?.slice(0, 1) || "-"}
				</UserAvatar>
				<Typography.Title id="lock-screen-title" level={3}>
					{t("lockScreen.lock")}
				</Typography.Title>
				<Typography.Text>{props.userInfo?.nickName || props.userInfo?.userName}</Typography.Text>
				{props.lockedAt && (
					<Typography.Text type="secondary">
						{t("lockScreen.lockedTime")}: {new Date(props.lockedAt).toLocaleString()}
					</Typography.Text>
				)}
				{unlockErrorText && (
					<Alert
						className="lock-screen-error"
						type="error"
						showIcon
						title={typeof unlockError === "object" ? unlockErrorText : t(unlockErrorText)}
					/>
				)}
				<Form form={form} onFinish={submit} autoComplete="off">
					<Form.Item name="password" rules={[{ required: true, message: t("lockScreen.passwordPlaceholder") }]}>
						<Input.Password
							aria-label={t("lockScreen.passwordPlaceholder")}
							placeholder={t("lockScreen.passwordPlaceholder")}
							autoFocus
						/>
					</Form.Item>
					<Button block type="primary" htmlType="submit" icon={<UnlockOutlined />} loading={submitting}>
						{t("lockScreen.unlock")}
					</Button>
				</Form>
				<Button type="link" icon={<UserSwitchOutlined />} onClick={switchAccount}>
					{t("lockScreen.switchAccount")}
				</Button>
			</div>
		</div>
	);
};

export default connect(null, { unlockScreen, resetLockRuntime, setToken, setTabsList })(LockScreen);
