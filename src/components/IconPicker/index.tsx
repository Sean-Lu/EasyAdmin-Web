import React, { useState, useMemo } from "react";
import { Button, Input, Modal, Tag } from "antd";
import * as Icons from "@ant-design/icons";
import { iconCategories, IconCategory } from "../../data/icons";

interface IconPickerProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, placeholder = "请选择或输入图标" }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("全部");
	const [customInput, setCustomInput] = useState("");

	const categories = useMemo(() => {
		return [{ name: "全部", label: "全部" }, ...iconCategories.map(c => ({ name: c.name, label: c.label }))];
	}, []);

	const filteredIcons = useMemo(() => {
		let result: IconCategory[] = iconCategories;

		if (selectedCategory !== "全部") {
			result = iconCategories.filter(c => c.name === selectedCategory);
		}

		if (searchText.trim()) {
			const searchLower = searchText.toLowerCase();
			result = result
				.map(category => ({
					...category,
					icons: category.icons.filter(
						icon => icon.name.toLowerCase().includes(searchLower) || icon.label.toLowerCase().includes(searchLower)
					)
				}))
				.filter(category => category.icons.length > 0);
		}

		return result;
	}, [selectedCategory, searchText]);

	const handleIconClick = (iconName: string) => {
		onChange(iconName);
		setIsModalOpen(false);
		setSearchText("");
		setSelectedCategory("全部");
	};

	const handleCustomInputConfirm = () => {
		if (customInput.trim()) {
			onChange(customInput.trim());
			setIsModalOpen(false);
			setCustomInput("");
			setSearchText("");
			setSelectedCategory("全部");
		}
	};

	const renderIcon = (iconName: string) => {
		const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[iconName];
		if (!IconComponent) {
			return null;
		}
		return <IconComponent style={{ fontSize: 16, color: "#1890ff" }} />;
	};

	const currentIcon = useMemo(() => {
		if (!value) return null;
		return renderIcon(value);
	}, [value]);

	return (
		<>
			<Button type="default" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => setIsModalOpen(true)}>
				{currentIcon && <span style={{ marginRight: 8 }}>{currentIcon}</span>}
				{value || placeholder}
			</Button>

			<Modal
				title="选择图标"
				open={isModalOpen}
				onCancel={() => {
					setIsModalOpen(false);
					setSearchText("");
					setSelectedCategory("全部");
				}}
				footer={null}
				width={700}
				destroyOnClose
			>
				<div style={{ marginBottom: 16 }}>
					<Input.Search
						placeholder="搜索图标名称或标签"
						value={searchText}
						onChange={e => setSearchText(e.target.value)}
						style={{ width: "100%" }}
					/>
				</div>

				<div style={{ marginBottom: 16 }}>
					<select
						value={selectedCategory}
						onChange={e => setSelectedCategory(e.target.value)}
						style={{
							width: 200,
							height: 32,
							borderRadius: 4,
							border: "1px solid #d9d9d9",
							padding: "0 11px"
						}}
					>
						{categories.map(c => (
							<option key={c.name} value={c.name}>
								{c.label}
							</option>
						))}
					</select>
				</div>

				<div
					style={{
						maxHeight: 400,
						overflowY: "auto",
						display: "grid",
						gridTemplateColumns: "repeat(8, 1fr)",
						gap: "8px"
					}}
				>
					{filteredIcons.map(category => (
						<div key={category.name} style={{ gridColumn: "1 / -1", marginBottom: 8 }}>
							<Tag color="blue" style={{ marginBottom: 8, display: "block" }}>
								{category.label}
							</Tag>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(8, 1fr)",
									gap: "8px"
								}}
							>
								{category.icons.map(icon => (
									<button
										key={icon.name}
										onClick={() => handleIconClick(icon.name)}
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											padding: "8px",
											border: value === icon.name ? "2px solid #1890ff" : "1px solid #e8e8e8",
											borderRadius: "4px",
											background: value === icon.name ? "#e6f7ff" : "white",
											cursor: "pointer",
											transition: "all 0.2s"
										}}
										title={icon.name}
									>
										{renderIcon(icon.name)}
										<span
											style={{
												fontSize: 10,
												marginTop: 4,
												textAlign: "center",
												color: "#666"
											}}
										>
											{icon.label}
										</span>
									</button>
								))}
							</div>
						</div>
					))}

					{filteredIcons.length === 0 && (
						<div
							style={{
								gridColumn: "1 / -1",
								textAlign: "center",
								padding: "40px",
								color: "#999"
							}}
						>
							未找到匹配的图标
						</div>
					)}
				</div>

				<div
					style={{
						marginTop: 16,
						paddingTop: 16,
						borderTop: "1px solid #f0f0f0"
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<Input
							placeholder="或手动输入图标名称（如：DashboardOutlined）"
							value={customInput}
							onChange={e => setCustomInput(e.target.value)}
							onPressEnter={handleCustomInputConfirm}
							style={{ flex: 1 }}
						/>
						<Tag color="orange">手动输入</Tag>
					</div>
					<p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
						提示：图标名称需为 Ant Design Icons 图标库中的有效名称， 如：DashboardOutlined, UserOutlined 等
					</p>
				</div>
			</Modal>
		</>
	);
};

export default IconPicker;
