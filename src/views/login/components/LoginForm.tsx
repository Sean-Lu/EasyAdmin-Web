import md5 from "js-md5";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Login } from "@/api/interface";
import { getCaptchaApi, getLoginConfigApi, loginApi } from "@/api/modules/login";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setToken } from "@/redux/modules/global/action";
import { useTranslation } from "react-i18next";
import { setTabsList } from "@/redux/modules/tabs/action";
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
	const { setToken, setTabsList } = props;
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [captcha, setCaptcha] = useState<Login.CaptchaRes | null>(null);
	const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
	const [captchaError, setCaptchaError] = useState<boolean>(false);
	const [loginConfig, setLoginConfig] = useState<Login.LoginConfigRes | null>(null);
	const [configLoading, setConfigLoading] = useState<boolean>(true);
	const [configError, setConfigError] = useState<boolean>(false);
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
	const onFinish = async (loginForm: Login.LoginReq) => {
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
			message.success("登录成功！");

			// 保存租户编码到本地
			saveTenantCode(loginForm.tenantCode || "");

			// 登录成功后，判断是否有重定向地址，如果有则跳转，没有则跳转到首页
			const redirectUrl = localStorage.getItem("redirectUrl");
			if (redirectUrl && redirectUrl !== "/login") {
				localStorage.removeItem("redirectUrl");
				navigate(redirectUrl);
			} else {
				navigate(HOME_URL);
			}
		} catch {
			if (captcha?.enabled) {
				await loadCaptcha();
			}
		} finally {
			setLoading(false);
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log("Login failed:", errorInfo);
	};

	const accountPrefix = isEmail(account) ? <MailOutlined /> : isPhoneNumber(account) ? <PhoneOutlined /> : <UserOutlined />;
	const accountPlaceholder = "用户名 / 手机号 / 邮箱";

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
			<Form.Item name="account" rules={[{ required: true, message: "请输入用户名 / 手机号 / 邮箱" }]}>
				<Input placeholder={accountPlaceholder} prefix={accountPrefix} maxLength={50} />
			</Form.Item>
			<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
				<Input.Password autoComplete="new-password" placeholder="密码" prefix={<LockOutlined />} />
			</Form.Item>
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
				<Button
					type="primary"
					htmlType="submit"
					loading={loading}
					disabled={captchaLoading || captchaError || captcha === null || configLoading || configError || loginConfig === null}
					icon={<UserOutlined />}
				>
					{t("login.confirm")}
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
			</Form.Item>
		</Form>
	);
};

const mapDispatchToProps = { setToken, setTabsList };
export default connect(null, mapDispatchToProps)(LoginForm);
