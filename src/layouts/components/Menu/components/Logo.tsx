import logo from "@/assets/images/logo.png";
import { connect } from "react-redux";

const Logo = (props: any) => {
	const { isCollapse, forceExpanded } = props;
	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{forceExpanded || !isCollapse ? <h2 className="logo-text">EasyAdmin</h2> : null}
		</div>
	);
};

const mapStateToProps = (state: any) => state.menu;
export default connect<any, any, any>(mapStateToProps)(Logo);
