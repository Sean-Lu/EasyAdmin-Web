import logo from "@/assets/images/logo.png";
import { APP_NAME } from "@/config/app";
import { connect } from "react-redux";

const Logo = (props: any) => {
	const { isCollapse, forceExpanded } = props;
	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{forceExpanded || !isCollapse ? <h2 className="logo-text">{APP_NAME}</h2> : null}
		</div>
	);
};

const mapStateToProps = (state: any) => state.menu;
export default connect<any, any, any>(mapStateToProps)(Logo);
