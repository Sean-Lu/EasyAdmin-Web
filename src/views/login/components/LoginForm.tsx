import md5 from "js-md5";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Login } from "@/api/interface";
import { getCaptchaApi, getLoginConfigApi, getMenuList, loginApi, registerApi } from "@/api/modules/login";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setToken } from "@/redux/modules/global/action";
import { useTranslation } from "react-i18next";
import { setTabsList } from "@/redux/modules/tabs/action";
import { setMenuList } from "@/redux/modules/menu/action";
import { setAuthButtons, setAuthRouter } from "@/redux/modules/auth/action";
import { setBreadcrumbList } from "@/redux/modules/breadcrumb/action";
import { findAllBreadcrumb, handleRouter } from "@/utils/util";
import { consumeAuthorizedLoginRedirect, finishExplicitLogout } from "@/utils/authRedirect";
import {
	CloseCircleOutlined,
	LockOutlined,
	MailOutlined,
	PhoneOutlined,
	ReloadOutlined,
	SafetyCertificateOutlined,
	ShopOutlined,
	UserOutlined
} from "@ant-design/icons";

// 简单账号格式判断：用于前端决定 LoginType 与输入框前缀图标
const isPhoneNumber = (value: string | undefined): boolean => !!value && /^1\d{10}$/.test(value.trim());
const isEmail = (value: string | undefined): boolean => !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const LoginForm = (props: any) => {
	const { t } = useTranslation();
	const { setToken, setTabsList, setMenuList, setAuthButtons, setAuthRouter, setBreadcrumbList } = props;
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [captcha, setCaptcha] = useState<Login.CaptchaRes | null>(null);
	const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
	const [captchaError, setCaptchaError] = useState<boolean>(false);
	const [loginConfig, setLoginConfig] = useState<Login.LoginConfigRes | null>(null);
	const [configLoading, setConfigLoading] = useState<boolean>(true);
	const [configError, setConfigError] = useState<boolean>(false);
	const [registering, setRegistering] = useState<boolean>(false);
	const [registrationResult, setRegistrationResult] = useState<Login.RegisterRes | null>(null);
	const account = Form.useWatch("account", form);
	const captchaRequestId = useRef<number>(0);

	const loadCaptcha = useCallback(async () => {
		const requestId = ++captchaRequestId.current;
		setCaptchaLoading(true);
		setCaptchaError(false);
		try {
			const { data } = await getCaptchaApi();
			if (requestId === captchaRequestId.current) {
				setCaptcha(data);
				form.setFieldValue("captchaCode", undefined);
			}
		} catch {
			if (requestId === captchaRequestId.current) {
				setCaptcha(null);
				setCaptchaError(true);
			}
		} finally {
			if (requestId === captchaRequestId.current) {
				setCaptchaLoading(false);
			}
		}
	}, [form]);

	const loadLoginConfig = useCallback(async () => {
		setConfigLoading(true);
		setConfigError(false);
		try {
			const { data } = await getLoginConfigApi();
			setLoginConfig(data);
		} catch {
			setLoginConfig(null);
			setConfigError(true);
		} finally {
			setConfigLoading(false);
		}
	}, []);

	useEffect(() => {
		finishExplicitLogout();
		void loadCaptcha();
		void loadLoginConfig();
	}, [loadCaptcha, loadLoginConfig]);

	// 获取本地存储的租户编码
	const getSavedTenantCode = () => localStorage.getItem("tenantCode") || "";

	// 登录成功后将租户编码保存到本地
	const saveTenantCode = (tenantCode: string) => {
		if (tenantCode) {
			localStorage.setItem("tenantCode", tenantCode);
		}
	};

	// 当登录配置加载完成后，如果启用多租户则设置保存的租户编码
	useEffect(() => {
		if (loginConfig && !configLoading && loginConfig.tenantEnabled) {
			const savedTenantCode = getSavedTenantCode();
			if (savedTenantCode) {
				form.setFieldsValue({ tenantCode: savedTenantCode });
			}
		}
	}, [loginConfig, configLoading, form]);

	// 登录
	const onLoginFinish = async (loginForm: Login.LoginReq) => {
		try {
			setLoading(true);
			const { data } = await loginApi({
				...loginForm,
				loginType: Login.LoginType.Password,
				password: md5(loginForm.password),
				captchaKey: captcha?.enabled ? captcha.captchaKey || undefined : undefined
			});
			setToken(data?.accessToken);

			if (data?.refreshToken) {
				localStorage.setItem("refreshToken", data.refreshToken);
			} else {
				localStorage.removeItem("refreshToken");
			}

			setTabsList([]);
			setAuthButtons({});

			let authorizedPaths: string[] = [];
			let permissionsLoaded = false;
			try {
				const { data: menuList = [] } = await getMenuList();
				authorizedPaths = handleRouter(menuList, []);
				permissionsLoaded = true;
				setMenuList(menuList);
				setAuthRouter(authorizedPaths);
				setBreadcrumbList(findAllBreadcrumb(menuList));
			} catch {
				setMenuList([]);
				setAuthRouter([]);
				setBreadcrumbList({});
			}
			message.success("登录成功！");

			// 保存租户编码到本地
			saveTenantCode(loginForm.tenantCode || "");

			// 登录成功后，仅恢复当前账号有权限访问的重定向地址
			navigate(consumeAuthorizedLoginRedirect(authorizedPaths, HOME_URL, permissionsLoaded ? "/403" : HOME_URL));
		} catch {
			if (captcha?.enabled) {
				await loadCaptcha();
			}
		} finally {
			setLoading(false);
		}
	};

	const onRegisterFinish = async (registerForm: Login.RegisterReq & { confirmPassword: string }) => {
		try {
			setLoading(true);
			const { data } = await registerApi({
				...registerForm,
				password: md5(registerForm.password),
				captchaKey: captcha?.enabled ? captcha.captchaKey || undefined : undefined
			});
			if (data.requiresApproval) {
				setRegistrationResult(data);
				setRegistering(false);
			} else {
				message.success("注册成功，请登录");
				setRegistering(false);
				form.setFieldsValue({ account: registerForm.userName, tenantCode: registerForm.tenantCode, password: undefined });
			}
			if (captcha?.enabled) await loadCaptcha();
		} catch {
			if (captcha?.enabled) await loadCaptcha();
		} finally {
			setLoading(false);
		}
	};

	const onFinish = (formValues: any) => (registering ? onRegisterFinish(formValues) : onLoginFinish(formValues));

	const onFinishFailed = (errorInfo: any) => {
		console.log("Login failed:", errorInfo);
	};

	const accountPrefix = isEmail(account) ? <MailOutlined /> : isPhoneNumber(account) ? <PhoneOutlined /> : <UserOutlined />;
	const accountPlaceholder = "用户名 / 手机号 / 邮箱";

	if (registrationResult) {
		return (
			<div className="registration-result">
				<h3>注册申请已提交</h3>
				<p>请联系管理员审核，并提供以下注册信息：</p>
				<div className="registration-result-info">
					<div>
						<span>用户名</span>
						<strong>{registrationResult.userName}</strong>
					</div>
					{registrationResult.phoneNumber && (
						<div>
							<span>手机号</span>
							<strong>{registrationResult.phoneNumber}</strong>
						</div>
					)}
					{registrationResult.email && (
						<div>
							<span>邮箱</span>
							<strong>{registrationResult.email}</strong>
						</div>
					)}
					{loginConfig?.tenantEnabled && registrationResult.tenantCode && (
						<div>
							<span>租户编码</span>
							<strong>{registrationResult.tenantCode}</strong>
						</div>
					)}
				</div>
				<Button
					type="primary"
					block
					onClick={() => {
						setRegistrationResult(null);
						form.resetFields();
						form.setFieldsValue({
							account: registrationResult.userName,
							tenantCode: loginConfig?.tenantEnabled ? registrationResult.tenantCode : undefined
						});
					}}
				>
					返回登录
				</Button>
			</div>
		);
	}

	return (
		<Form
			form={form}
			name="basic"
			labelCol={{ span: 0 }}
			wrapperCol={{ span: 24 }}
			initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			size="large"
			autoComplete="off"
		>
			{loginConfig?.tenantEnabled && (
				<Form.Item
					name="tenantCode"
					rules={[
						{ required: true, whitespace: true, message: "请输入租户编码" },
						{ max: 50, message: "租户编码不能超过50个字符" }
					]}
				>
					<Input placeholder="租户编码" prefix={<ShopOutlined />} maxLength={50} />
				</Form.Item>
			)}
			{registering ? (
				<Form.Item name="userName" rules={[{ required: true, whitespace: true, message: "请输入用户名" }]}>
					<Input placeholder="用户名" prefix={<UserOutlined />} maxLength={50} />
				</Form.Item>
			) : (
				<Form.Item name="account" rules={[{ required: true, message: "请输入用户名 / 手机号 / 邮箱" }]}>
					<Input placeholder={accountPlaceholder} prefix={accountPrefix} maxLength={50} />
				</Form.Item>
			)}
			<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
				<Input.Password autoComplete="new-password" placeholder="密码" prefix={<LockOutlined />} />
			</Form.Item>
			{registering && (
				<>
					<Form.Item
						name="confirmPassword"
						dependencies={["password"]}
						rules={[
							{ required: true, message: "请输入确认密码" },
							({ getFieldValue }) => ({
								validator(_: unknown, value: string) {
									return !value || getFieldValue("password") === value
										? Promise.resolve()
										: Promise.reject(new Error("两次密码不一致"));
								}
							})
						]}
					>
						<Input.Password autoComplete="new-password" placeholder="确认密码" prefix={<LockOutlined />} />
					</Form.Item>
					<Form.Item name="phoneNumber" rules={[{ pattern: /^1\d{10}$/, message: "手机号码格式不正确" }]}>
						<Input placeholder="手机号（可选）" prefix={<PhoneOutlined />} maxLength={11} />
					</Form.Item>
					<Form.Item name="email" rules={[{ type: "email", message: "邮箱格式不正确" }]}>
						<Input placeholder="邮箱（可选）" prefix={<MailOutlined />} maxLength={50} />
					</Form.Item>
				</>
			)}
			{captcha?.enabled && (
				<div className="captcha-row">
					<Form.Item name="captchaCode" rules={[{ required: true, message: "请输入验证码" }]}>
						<Input autoComplete="off" maxLength={8} placeholder="验证码" prefix={<SafetyCertificateOutlined />} />
					</Form.Item>
					<button
						type="button"
						className="captcha-image-button"
						onClick={() => void loadCaptcha()}
						disabled={captchaLoading}
						aria-label="刷新验证码"
					>
						{captcha.image && <img src={captcha.image} alt="验证码，点击刷新" />}
					</button>
				</div>
			)}
			{captchaError && (
				<div className="captcha-error">
					<span>验证码加载失败</span>
					<Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => void loadCaptcha()} loading={captchaLoading}>
						重新加载
					</Button>
				</div>
			)}
			{configError && (
				<div className="captcha-error">
					<span>登录配置加载失败</span>
					<Button
						type="link"
						size="small"
						icon={<ReloadOutlined />}
						onClick={() => void loadLoginConfig()}
						loading={configLoading}
					>
						重新加载
					</Button>
				</div>
			)}
			<Form.Item className="login-btn">
				<div className="login-actions">
					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						disabled={captchaLoading || captchaError || captcha === null || configLoading || configError || loginConfig === null}
						icon={<UserOutlined />}
					>
						{registering ? "注册" : t("login.confirm")}
					</Button>
					<Button
						onClick={() => {
							form.resetFields();
							if (captcha?.enabled) {
								void loadCaptcha();
							}
						}}
						icon={<CloseCircleOutlined />}
					>
						{t("login.reset")}
					</Button>
				</div>
				{loginConfig?.registerEnabled && (
					<div className="login-register-entry">
						<Button
							type="link"
							onClick={() => {
								setRegistering(value => !value);
								form.resetFields();
							}}
						>
							{registering ? "返回登录" : "注册账号"}
						</Button>
					</div>
				)}
			</Form.Item>
		</Form>
	);
};

const mapDispatchToProps = { setToken, setTabsList, setMenuList, setAuthButtons, setAuthRouter, setBreadcrumbList };
export default connect(null, mapDispatchToProps)(LoginForm);
