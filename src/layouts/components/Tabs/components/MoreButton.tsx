import { Button, Dropdown, MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HOME_URL } from "@/config/config";

const MoreButton = (props: any) => {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const navigate = useNavigate();

	// close multipleTab
	const closeMultipleTab = (tabPath?: string) => {
		if (tabPath) {
			const handleTabsList = props.tabsList.filter((item: Menu.MenuOptions) => {
				return item.path === tabPath;
			});
			props.setTabsList(handleTabsList.length > 0 ? handleTabsList : []);
		} else {
			props.setTabsList([]);
			navigate("/empty");
		}
	};

	// close left tabs
	const closeLeftTabs = () => {
		const currentIndex = props.tabsList.findIndex((item: Menu.MenuOptions) => item.path === pathname);
		const handleTabsList = props.tabsList.filter((_item: Menu.MenuOptions, index: number) => index >= currentIndex);
		props.setTabsList(handleTabsList.length > 0 ? handleTabsList : []);
	};

	// close right tabs
	const closeRightTabs = () => {
		const currentIndex = props.tabsList.findIndex((item: Menu.MenuOptions) => item.path === pathname);
		const handleTabsList = props.tabsList.filter((_item: Menu.MenuOptions, index: number) => index <= currentIndex);
		props.setTabsList(handleTabsList.length > 0 ? handleTabsList : []);
	};

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: <span>{t("tabs.closeCurrent")}</span>,
			onClick: () => props.delTabs(pathname)
		},
		{
			key: "2",
			label: <span>{t("tabs.closeLeft")}</span>,
			onClick: closeLeftTabs
		},
		{
			key: "3",
			label: <span>{t("tabs.closeRight")}</span>,
			onClick: closeRightTabs
		},
		{
			key: "4",
			label: <span>{t("tabs.closeOther")}</span>,
			onClick: () => closeMultipleTab(pathname)
		},
		{
			key: "5",
			label: <span>{t("tabs.closeAll")}</span>,
			onClick: () => closeMultipleTab()
		}
	];
	return (
		<Dropdown menu={{ items }} placement="bottom" arrow={{ pointAtCenter: true }} trigger={["click"]}>
			<Button className="more-button" type="primary" size="small">
				{t("tabs.more")} <DownOutlined />
			</Button>
		</Dropdown>
	);
};
export default MoreButton;
