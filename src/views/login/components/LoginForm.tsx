import md5 from "js-md5";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Login } from "@/api/interface";
import { getCaptchaApi, loginApi } from "@/api/modules/login";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";
import { setToken } from "@/redux/modules/global/action";
import { useTranslation } from "react-i18next";
import { setTabsList } from "@/redux/modules/tabs/action";
import { CloseCircleOutlined, LockOutlined, ReloadOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";

const LoginForm = (props: any) => {
	const { t } = useTranslation();
	const { setToken, setTabsList } = props;
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [captcha, setCaptcha] = useState<Login.CaptchaRes | null>(null);
	const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
	const [captchaError, setCaptchaError] = useState<boolean>(false);
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

	useEffect(() => {
		void loadCaptcha();
	}, [loadCaptcha]);

	// 登录
	const onFinish = async (loginForm: Login.LoginReq) => {
		try {
			setLoading(true);
			const { data } = await loginApi({
				...loginForm,
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
			<Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
				<Input placeholder="用户名" prefix={<UserOutlined />} />
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
			<Form.Item className="login-btn">
				<Button
					type="primary"
					htmlType="submit"
					loading={loading}
					disabled={captchaLoading || captchaError || captcha === null}
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
