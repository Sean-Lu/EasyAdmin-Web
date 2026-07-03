import { Drawer, Divider, Input, Segmented, Switch } from "antd";
import { useState } from "react";
import { connect } from "react-redux";
import { FireOutlined, SettingOutlined } from "@ant-design/icons";
import { setThemeConfig } from "@/redux/modules/global/action";
import { updateCollapse } from "@/redux/modules/menu/action";
import SwitchDark from "@/components/SwitchDark";
import { DEFAULT_WATERMARK_MODE, DEFAULT_WATERMARK_TEXT, WatermarkMode } from "@/config/watermark";

const Theme = (props: any) => {
	const [open, setOpen] = useState<boolean>(false);
	const { setThemeConfig, updateCollapse } = props;
	const { isCollapse } = props.menu;
	const { themeConfig } = props.global;
	const { weakOrGray, layout, breadcrumb, tabs, footer } = themeConfig;
	const watermark = themeConfig.watermark ?? false;
	const watermarkMode: WatermarkMode = themeConfig.watermarkMode === "user" ? "user" : DEFAULT_WATERMARK_MODE;
	const watermarkText = themeConfig.watermarkText ?? DEFAULT_WATERMARK_TEXT;

	const setWeakOrGray = (checked: boolean, theme: string) => {
		if (checked) return setThemeConfig({ ...themeConfig, weakOrGray: theme });
		setThemeConfig({ ...themeConfig, weakOrGray: "" });
	};

	const onChange = (checked: boolean, keyName: string) => {
		return setThemeConfig({ ...themeConfig, [keyName]: !checked });
	};

	return (
		<>
			<i
				className="icon-style iconfont icon-zhuti"
				onClick={() => {
					setOpen(true);
				}}
			></i>
			<Drawer
				title="布局设置"
				closable={false}
				onClose={() => {
					setOpen(false);
				}}
				open={open}
				size={320}
			>
				{/* 全局主题 */}
				<Divider className="divider">
					<FireOutlined />
					全局主题
				</Divider>
				<div className="theme-item">
					<span>暗黑模式</span>
					<SwitchDark />
				</div>
				<div className="theme-item">
					<span>灰色模式</span>
					<Switch
						checked={weakOrGray === "gray"}
						onChange={e => {
							setWeakOrGray(e, "gray");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>色弱模式</span>
					<Switch
						checked={weakOrGray === "weak"}
						onChange={e => {
							setWeakOrGray(e, "weak");
						}}
					/>
				</div>
				<br />
				{/* 界面设置 */}
				<Divider className="divider">
					<SettingOutlined />
					界面设置
				</Divider>
				<div className="theme-item">
					<span>菜单布局</span>
					<Segmented
						value={layout || "side"}
						options={[
							{ label: "左侧", value: "side" },
							{ label: "顶部", value: "top" }
						]}
						onChange={value => {
							setThemeConfig({ ...themeConfig, layout: value as "side" | "top" });
						}}
					/>
				</div>
				<div className="theme-item">
					<span>折叠菜单</span>
					<Switch
						disabled={(layout || "side") === "top"}
						checked={isCollapse}
						onChange={e => {
							updateCollapse(e);
						}}
					/>
				</div>
				<div className="theme-item">
					<span>面包屑导航</span>
					<Switch
						disabled={(layout || "side") === "top"}
						checked={!breadcrumb}
						onChange={e => {
							onChange(e, "breadcrumb");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>标签栏</span>
					<Switch
						checked={!tabs}
						onChange={e => {
							onChange(e, "tabs");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>页脚</span>
					<Switch
						checked={!footer}
						onChange={e => {
							onChange(e, "footer");
						}}
					/>
				</div>
				<div className="theme-item">
					<span>页面水印</span>
					<Switch
						aria-label="页面水印"
						checked={watermark}
						onChange={checked => {
							setThemeConfig({ ...themeConfig, watermark: checked });
						}}
					/>
				</div>
				{watermark && (
					<>
						<div className="theme-item">
							<span>水印模式</span>
							<Segmented
								aria-label="水印方式"
								value={watermarkMode}
								options={[
									{ label: "自定义文字", value: "custom" },
									{ label: "用户昵称", value: "user" }
								]}
								onChange={value => {
									setThemeConfig({ ...themeConfig, watermarkMode: value as WatermarkMode });
								}}
							/>
						</div>
						{watermarkMode === "custom" && (
							<div className="theme-item">
								<span>水印文字</span>
								<Input
									aria-label="水印文字"
									value={watermarkText}
									onChange={event => {
										setThemeConfig({ ...themeConfig, watermarkText: event.target.value });
									}}
									onBlur={event => {
										setThemeConfig({
											...themeConfig,
											watermarkText: event.target.value.trim() || DEFAULT_WATERMARK_TEXT
										});
									}}
								/>
							</div>
						)}
					</>
				)}
			</Drawer>
		</>
	);
};

const mapStateToProps = (state: any) => state;
const mapDispatchToProps = { setThemeConfig, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(Theme);
