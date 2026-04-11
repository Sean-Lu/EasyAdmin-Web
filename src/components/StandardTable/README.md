# StandardTable 通用标准表格组件

## 功能特性

- 支持分页查询和不分页查询
- 支持搜索表单
- 支持新增、编辑、删除、查看详情操作
- 支持批量删除
- 支持状态切换
- 支持自定义操作按钮
- 支持自定义模态框

## 技术优势

1. **减少代码开发量**：通过配置化的方式快速实现业务功能
2. **交互风格统一**：提供标准化的操作界面
3. **灵活性强**：支持自定义表单、模态框和操作按钮
4. **易于维护**：代码结构清晰，注释完善
5. **性能优化**：使用 React Hooks 和缓存策略提高性能

## 安装和使用

### 导入组件

```jsx
import StandardTable from "@/components/StandardTable";
```

### 基本使用示例

```jsx
import React, { useRef } from "react";
import StandardTable from "@/components/StandardTable";
import { Form, Input, Button, Modal } from "antd";

const MyComponent = () => {
	const searchFormRef = useRef(null);

	// 渲染搜索表单
	const renderSearchForm = handleReset => (
		<Form layout="inline">
			<Form.Item label="名称" name="name">
				<Input placeholder="请输入名称" />
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					搜索
				</Button>
			</Form.Item>
			<Form.Item>
				<Button onClick={handleReset}>重置</Button>
			</Form.Item>
		</Form>
	);

	// 渲染模态框
	const renderModal = (
		record,
		addVisible,
		hideAdd,
		handleAdd,
		updateVisible,
		hideUpdate,
		handleUpdate,
		detailVisible,
		hideDetail
	) => (
		<>
			{/* 新增模态框 */}
			<Modal
				title="新增"
				open={addVisible}
				onCancel={hideAdd}
				footer={[
					<Button key="cancel" onClick={hideAdd}>
						取消
					</Button>,
					<Button key="submit" type="primary" htmlType="submit" form="addForm">
						确定
					</Button>
				]}
			>
				<Form id="addForm" layout="vertical" onFinish={handleAdd}>
					<Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
						<Input placeholder="请输入名称" />
					</Form.Item>
					<Form.Item label="描述" name="description">
						<Input.TextArea placeholder="请输入描述" />
					</Form.Item>
				</Form>
			</Modal>

			{/* 编辑模态框 */}
			<Modal
				title="编辑"
				open={updateVisible}
				onCancel={hideUpdate}
				footer={[
					<Button key="cancel" onClick={hideUpdate}>
						取消
					</Button>,
					<Button key="submit" type="primary" htmlType="submit" form="updateForm">
						确定
					</Button>
				]}
			>
				<Form id="updateForm" layout="vertical" initialValues={record} onFinish={handleUpdate}>
					<Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
						<Input placeholder="请输入名称" />
					</Form.Item>
					<Form.Item label="描述" name="description">
						<Input.TextArea placeholder="请输入描述" />
					</Form.Item>
				</Form>
			</Modal>

			{/* 查看详情模态框 */}
			<Modal
				title="查看详情"
				open={detailVisible}
				onCancel={hideDetail}
				footer={[
					<Button key="ok" onClick={hideDetail}>
						确定
					</Button>
				]}
			>
				<div style={{ padding: 16 }}>
					<p>
						<strong>ID:</strong> {record.id}
					</p>
					<p>
						<strong>名称:</strong> {record.name}
					</p>
					<p>
						<strong>描述:</strong> {record.description}
					</p>
					<p>
						<strong>创建时间:</strong> {record.createTime}
					</p>
					<p>
						<strong>更新时间:</strong> {record.updateTime}
					</p>
				</div>
			</Modal>
		</>
	);

	// 自定义行操作按钮
	const renderRecordOperate = record => (
		<>
			<span style={{ marginLeft: 8 }} onClick={() => handleCustomAction(record)}>
				自定义操作
			</span>
		</>
	);

	// 自定义表格顶部按钮
	const renderCustomTableButton = ({ pageNumber, pageSize, total, getSearchInfo }) => (
		<Button onClick={() => handleExport(getSearchInfo())}>导出数据</Button>
	);

	// 处理自定义操作
	const handleCustomAction = record => {
		console.log("自定义操作", record);
		// 实现自定义操作逻辑
	};

	// 处理导出
	const handleExport = searchInfo => {
		console.log("导出数据", searchInfo);
		// 实现导出逻辑
	};

	// 表格列配置
	const columns = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{ title: "名称", dataIndex: "name", key: "name" },
		{ title: "描述", dataIndex: "description", key: "description" }
		// 其他列...
	];

	return (
		<StandardTable
			// 搜索表单相关
			searchFormRef={searchFormRef}
			renderSearchForm={renderSearchForm}
			handleSearchValues={values => {
				// 处理搜索表单值
				return values;
			}}
			// 模态框相关
			renderModal={renderModal}
			// 表格相关
			columns={columns}
			recordOperateColWidth={180} // 操作列宽度
			renderRecordOperate={renderRecordOperate}
			renderCustomTableButton={renderCustomTableButton}
			// API相关
			apiPage="/api/list" // 分页查询API
			apiAdd="/api/add" // 新增API
			apiUpdate="/api/update" // 更新API
			apiDelete="/api/delete" // 删除API
			apiDetail="/api/detail" // 详情API
			apiUpdateState="/api/updateState" // 状态更新API
			// 其他配置
			disablePageSearch={false} // 是否禁用分页
			handleAddValues={values => {
				// 处理新增表单值
				return values;
			}}
			handleUpdateValues={values => {
				// 处理编辑表单值
				return values;
			}}
		/>
	);
};

export default MyComponent;
```

## API 文档

### Props

| 属性                      | 类型              | 说明                | 是否必填             |
| ------------------------- | ----------------- | ------------------- | -------------------- |
| `searchFormRef`           | `React.RefObject` | 搜索表单的 ref 引用 | 是                   |
| `renderSearchForm`        | `Function`        | 渲染搜索表单的函数  | 是                   |
| `renderModal`             | `Function`        | 渲染模态框的函数    | 是                   |
| `columns`                 | `Array`           | 表格列配置          | 是                   |
| `apiPage`                 | `String`          | 分页查询 API 地址   | 二选一（与 apiList） |
| `apiList`                 | `String`          | 不分页查询 API 地址 | 二选一（与 apiPage） |
| `apiAdd`                  | `String`          | 新增 API 地址       | 否                   |
| `apiUpdate`               | `String`          | 更新 API 地址       | 否                   |
| `apiDelete`               | `String`          | 删除 API 地址       | 否                   |
| `apiDetail`               | `String`          | 详情 API 地址       | 否                   |
| `apiUpdateState`          | `String`          | 状态更新 API 地址   | 否                   |
| `disablePageSearch`       | `Boolean`         | 是否禁用分页        | 否                   |
| `recordOperateColWidth`   | `Number`          | 操作列宽度          | 否                   |
| `renderRecordOperate`     | `Function`        | 自定义行操作按钮    | 否                   |
| `renderCustomTableButton` | `Function`        | 自定义表格顶部按钮  | 否                   |
| `handleSearchValues`      | `Function`        | 处理搜索表单值      | 否                   |
| `handleAddValues`         | `Function`        | 处理新增表单值      | 否                   |
| `handleUpdateValues`      | `Function`        | 处理编辑表单值      | 否                   |
| `onSearchFormReset`       | `Function`        | 搜索表单重置回调    | 否                   |

### renderSearchForm 函数

```jsx
const renderSearchForm = handleReset => {
	// 返回搜索表单JSX
};
```

### renderModal 函数

```jsx
const renderModal = (
	record,
	addVisible,
	hideAdd,
	handleAdd,
	updateVisible,
	hideUpdate,
	handleUpdate,
	detailVisible,
	hideDetail
) => {
	// 返回模态框JSX
};
```

### renderRecordOperate 函数

```jsx
const renderRecordOperate = record => {
	// 返回自定义操作按钮JSX
};
```

### renderCustomTableButton 函数

```jsx
const renderCustomTableButton = ({ pageNumber, pageSize, total, getSearchInfo }) => {
	// 返回自定义按钮JSX
};
```

## 注意事项

1. 确保提供正确的 API 地址，组件会根据传入的 API 地址执行相应的操作
2. 搜索表单需要使用`Form`组件，并通过`searchFormRef`引用
3. 模态框需要自行实现，组件会提供相应的状态和回调函数
4. 表格列配置需要符合 Ant Design 的`columns`配置格式
5. 当同时提供`apiPage`和`apiList`时，优先使用`apiPage`

## 常见问题

### Q: 为什么表格没有数据？

A: 请检查`apiPage`或`apiList`是否正确，以及 API 返回的数据格式是否符合要求。

### Q: 为什么新增/编辑/删除操作没有反应？

A: 请检查相应的 API 地址是否正确，以及 API 返回的数据格式是否符合要求。

### Q: 如何自定义操作按钮？

A: 通过`renderRecordOperate`属性可以自定义行操作按钮，通过`renderCustomTableButton`属性可以自定义表格顶部按钮。

### Q: 如何处理表单值？

A: 通过`handleSearchValues`、`handleAddValues`、`handleUpdateValues`属性可以分别处理搜索、新增、编辑的表单值。
