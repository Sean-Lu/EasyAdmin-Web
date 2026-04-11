# StandardTable 通用标准表格组件

## 功能特性

- 支持分页查询和不分页查询
- 支持搜索表单（带防抖处理（300ms））
- 支持新增、编辑、删除、查看详情操作
- 支持批量删除
- 支持状态切换
- 支持自定义操作按钮
- 支持自定义模态框
- 支持加载状态显示
- 支持统一的错误处理

## 技术优势

1. **减少代码开发量**：通过配置化的方式快速实现业务功能
2. **交互风格统一**：提供标准化的操作界面
3. **灵活性强**：支持自定义表单、模态框和操作按钮
4. **易于维护**：代码结构清晰，注释完善
5. **性能优化**：使用防抖处理和公共 API 请求方法提高性能
6. **用户体验友好**：添加加载状态和错误提示
7. **代码健壮性**：完善的错误处理和边界情况处理

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
			onSearchFormReset={() => {
				// 搜索表单重置后的回调
				console.log("搜索表单已重置");
			}}
		/>
	);
};

export default MyComponent;
```

### 高级使用示例

#### 1. 带排序功能的表格

```jsx
const columns = [
	{
		title: "ID",
		dataIndex: "id",
		key: "id",
		sorter: (a, b) => a.id - b.id,
		sortDirections: ["ascend", "descend", "default"]
	},
	{
		title: "名称",
		dataIndex: "name",
		key: "name",
		sorter: (a, b) => a.name.localeCompare(b.name),
		sortDirections: ["ascend", "descend", "default"]
	},
	{ title: "描述", dataIndex: "description", key: "description" }
];
```

#### 2. 带自定义行样式的表格

```jsx
// 在 Table 组件中添加 rowClassName 属性
// 注意：需要在 StandardTable 组件中添加对 rowClassName 的支持
<Table
	// ... 其他属性
	rowClassName={record => (record.status === "error" ? "error-row" : "")}
/>
```

#### 3. 带空状态的表格

````jsx
// 在 Table 组件中添加 locale 属性
// 注意：需要在 StandardTable 组件中添加对 locale 的支持
<Table
	// ... 其他属性
	locale={{
		nodata: '暂无数据'
	}}
/>

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
| `rowKey`                  | `FunctionString` | 行数据的 Key        | 否                   |
| `rowClassName`            | `FunctionString` | 行样式类名          | 否                   |
| `locale`                  | `Object`          | 表格国际化配置      | 否                   |

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

1. **API 地址配置**：确保提供正确的 API 地址，组件会根据传入的 API 地址执行相应的操作
2. **搜索表单**：搜索表单需要使用`Form`组件，并通过`searchFormRef`引用
3. **模态框实现**：模态框需要自行实现，组件会提供相应的状态和回调函数
4. **表格列配置**：表格列配置需要符合 Ant Design 的`columns`配置格式
5. **API 优先级**：当同时提供`apiPage`和`apiList`时，优先使用`apiPage`
6. **API 返回格式**：
   - 通用接口返回格式：`{ success: boolean, data: any, message?: string }`
   - 分页接口返回格式：`{ success: true, data: { list: array, total: number } }`
   - 状态更新接口返回格式：`{ success: true, data: boolean }`
   - 删除接口支持：单个删除（`{ id: number }`）和批量删除（`{ ids: array }`）
7. **性能优化**：搜索操作已添加防抖处理（300ms），避免频繁请求接口

## 常见问题

### Q: 为什么表格没有数据？

A: 请检查以下几点：

- `apiPage`或`apiList`是否正确配置
- API 返回的数据格式是否符合要求
- 网络连接是否正常
- 控制台是否有错误信息

### Q: 为什么新增/编辑/删除操作没有反应？

A: 请检查以下几点：

- 相应的 API 地址是否正确配置
- API 返回的数据格式是否符合要求
- 控制台是否有错误信息
- 权限是否足够

### Q: 如何自定义操作按钮？

A: 通过以下属性可以自定义操作按钮：

- `renderRecordOperate`：自定义行操作按钮
- `renderCustomTableButton`：自定义表格顶部按钮

### Q: 如何处理表单值？

A: 通过以下属性可以处理表单值：

- `handleSearchValues`：处理搜索表单值
- `handleAddValues`：处理新增表单值
- `handleUpdateValues`：处理编辑表单值

### Q: 如何添加排序功能？

A: 在`columns`配置中添加`sorter`属性，例如：

```jsx
const columns = [
	{
		title: "ID",
		dataIndex: "id",
		key: "id",
		sorter: (a, b) => a.id - b.id
	}
];
```

### Q: 如何自定义行样式？

A: 需要在 StandardTable 组件中添加对`rowClassName`的支持，然后在使用时传入该属性。

### Q: 如何修改空状态提示？

A: 需要在 StandardTable 组件中添加对`locale`的支持，然后在使用时传入该属性。

## 版本更新日志

### v1.0.0

- 初始版本
- 支持分页查询和不分页查询
- 支持搜索表单
- 支持新增、编辑、删除、查看详情操作
- 支持批量删除
- 支持状态切换
- 支持自定义操作按钮
- 支持自定义模态框

### v1.1.0

- 添加加载状态显示
- 添加统一的错误处理
- 添加搜索防抖处理（300ms）
- 提取公共 API 请求方法
- 优化代码结构和性能
- 完善 README.md 文档
````
