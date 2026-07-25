import { connect } from "react-redux";
import { APP_NAME } from "@/config/app";
import "./index.less";

const LayoutFooter = (props: any) => {
	const { themeConfig } = props;
	return (
		<>
			{!themeConfig.footer && (
				<div className="footer">
					<a href="https://github.com/Sean-Lu/EasyAdmin-Web" target="_blank" rel="noreferrer">
						{APP_NAME} © 2024-2026 Sean
					</a>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => state.global;
export default connect(mapStateToProps)(LayoutFooter);
