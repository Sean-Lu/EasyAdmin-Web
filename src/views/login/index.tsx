import LoginForm from "./components/LoginForm";
import SwitchDark from "@/components/SwitchDark";
import loginLeft from "@/assets/images/login_left.png";
import logo from "@/assets/images/logo.png";
import { APP_NAME } from "@/config/app";
import { useSelector } from "react-redux";
import "./index.less";

const Login = () => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);

	return (
		<div className={`login-container${isDark ? " dark" : ""}`}>
			<SwitchDark />
			<div className="login-box">
				<div className="login-left">
					<img src={loginLeft} alt="login" />
				</div>
				<div className="login-form-wrap">
					<div className="login-logo">
						<img className="login-icon" src={logo} alt="logo" />
						<span className="logo-text">{APP_NAME}</span>
					</div>
					<LoginForm />
				</div>
			</div>
		</div>
	);
};

export default Login;
