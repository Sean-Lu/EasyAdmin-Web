import { Breadcrumb } from "antd";
import { useLocation } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import { connect } from "react-redux";

const BreadcrumbNav = (props: any) => {
	const { pathname } = useLocation();
	const { themeConfig } = props.global;
	const breadcrumbList = props.breadcrumb.breadcrumbList[pathname] || [];

	if (pathname === "/empty") {
		return null;
	}

	const items = [
		{
			title: <a href={`#${HOME_URL}`}>首页</a>
		},
		...breadcrumbList
			.map((item: string, index: number) => {
				if (item === "首页") return null;
				return {
					title: item
				};
			})
			.filter(Boolean)
	];

	return <>{!themeConfig.breadcrumb && <Breadcrumb items={items} />}</>;
};

const mapStateToProps = (state: any) => ({ global: state.global, breadcrumb: state.breadcrumb });
export default connect(mapStateToProps)(BreadcrumbNav);
