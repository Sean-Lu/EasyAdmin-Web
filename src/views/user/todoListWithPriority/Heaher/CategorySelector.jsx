import React, { Component } from "react";
import { Select, Button, Input, message } from "antd";
import { TodoCategoryService } from "@/services/tool/todoCategoryService";

const { Option } = Select;

// 待办事项分类选择器组件
export default class CategorySelector extends Component {
	state = {
		categoryList: [],
		selectedCategoryId: null,
		editing: false,
		newCategoryName: ""
	};

	componentDidMount() {
		this.fetchCategoryList();
	}

	fetchCategoryList = async () => {
		try {
			const response = await TodoCategoryService.getCategoryList();
			if (response.success) {
				this.setState({ categoryList: response.data || [] });
				// 如果没有选择分类且有分类列表，默认选择第一个
				if (!this.state.selectedCategoryId && response.data && response.data.length > 0) {
					this.setState({ selectedCategoryId: response.data[0].id });
					if (this.props.onCategoryChange) {
						this.props.onCategoryChange(response.data[0].id);
					}
				}
			}
		} catch (error) {
			console.error("获取分类列表失败:", error);
		}
	};

	handleCategoryChange = value => {
		this.setState({ selectedCategoryId: value });
		if (this.props.onCategoryChange) {
			this.props.onCategoryChange(value);
		}
	};

	handleAddCategory = () => {
		this.setState({ editing: true });
	};

	handleInputChange = e => {
		this.setState({ newCategoryName: e.target.value });
	};

	handleInputConfirm = async () => {
		const { newCategoryName } = this.state;
		if (!newCategoryName.trim()) {
			message.warning("分类名称不能为空");
			return;
		}
		try {
			const response = await TodoCategoryService.addCategory({ name: newCategoryName.trim() });
			if (response.success) {
				message.success("添加分类成功");
				this.setState({ editing: false, newCategoryName: "" });
				await this.fetchCategoryList();
			}
		} catch (error) {
			message.error("添加分类失败");
			console.error("添加分类失败:", error);
		}
	};

	handleCancelAdd = () => {
		this.setState({ editing: false, newCategoryName: "" });
	};

	render() {
		const { categoryList, selectedCategoryId, editing, newCategoryName } = this.state;

		return (
			<div className="category-selector" style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
				<Select
					style={{ width: 150, marginRight: 8 }}
					value={selectedCategoryId}
					onChange={this.handleCategoryChange}
					placeholder="选择分类"
				>
					{categoryList.map(category => (
						<Option key={category.id} value={category.id}>
							{category.name}
						</Option>
					))}
				</Select>
				{editing ? (
					<div style={{ display: "flex", alignItems: "center" }}>
						<Input
							placeholder="分类名称"
							value={newCategoryName}
							onChange={this.handleInputChange}
							onPressEnter={this.handleInputConfirm}
							style={{ width: 120, marginRight: 8 }}
							autoFocus
						/>
						<Button type="primary" size="small" onClick={this.handleInputConfirm} style={{ marginRight: 4 }}>
							确定
						</Button>
						<Button size="small" onClick={this.handleCancelAdd}>
							取消
						</Button>
					</div>
				) : (
					<Button type="dashed" size="small" onClick={this.handleAddCategory}>
						新增分类
					</Button>
				)}
			</div>
		);
	}
}
