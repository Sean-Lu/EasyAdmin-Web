import { HomeFilled, FileOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { HOME_URL } from "@/config/config";
import "./index.less";

// 空状态页面：没有打开任何菜单时显示的页面
const EmptyPage = (props: any) => {
	const navigate = useNavigate();
	const { themeConfig } = props.global;

	return (
		<div className={`empty-page ${themeConfig.isDark ? "dark" : ""}`}>
			<div className="empty-content">
				<div className="empty-logo">
					<HomeFilled className="logo-icon" />
				</div>
				<h2>欢迎使用 EasyAdmin</h2>
				<p className="empty-desc">暂无打开的页面</p>
				<div className="empty-actions">
					<button className="action-btn" onClick={() => navigate(HOME_URL)}>
						<FileOutlined />
						<span>打开首页</span>
					</button>
					<button className="action-btn" onClick={() => navigate("/system/user")}>
						<SettingOutlined />
						<span>用户管理</span>
					</button>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => state;
export default connect(mapStateToProps)(EmptyPage);
