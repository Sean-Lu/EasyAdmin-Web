# 待办事项功能说明

## 功能列表

### 1. 待办事项的增删改查

- **新增**：在顶部输入框中输入待办事项内容，选择优先级，按回车键创建
- **删除**：点击待办事项右侧的"删除"按钮，会弹出二次确认弹窗，确认后删除
- **修改**：点击待办事项内容进入编辑模式，修改后按 Enter 保存，按 Esc 取消
- **查询**：页面加载时自动获取所有待办事项，并按优先级和排序顺序显示

### 2. 优先级的调整

- 支持三个优先级等级：低、中、高
- 高优先级：红色加粗显示
- 中优先级：橙色加粗显示
- 低优先级：默认灰色显示
- 可以通过下拉菜单调整待办事项的优先级

### 3. 待办事项内容的编辑

- 点击待办事项内容进入编辑模式
- 编辑模式下可以修改待办事项内容
- 按 Enter 键保存修改
- 按 Esc 键取消编辑
- 编辑过程中点击"取消"按钮也可以取消编辑

### 4. 二次确认弹窗

- **删除确认**：删除待办事项时会弹出确认弹窗，防止误操作
- **清除已完成任务确认**：清除所有已完成任务时会弹出确认弹窗，防止误操作

### 5. 列表折叠和展开功能

- 待处理列表和已完成列表都支持折叠和展开
- 点击列表标题右侧的"收起"/"展开"按钮可以切换状态
- 折叠状态下不显示列表内容，只显示列表标题和计数

### 6. 拖拽排序功能

- 支持同一优先级和同一完成状态的项目之间拖拽排序
- 拖拽结束后会自动更新排序顺序并保存到数据库
- 拖拽过程中会显示半透明效果，提升用户体验

### 7. 分类管理功能

- 支持用户自定义分类（如：工作、生活、学习等）
- 后端内置默认分类
- 切换分类后会显示对应分类下的待办事项
- 新增分类：点击"新增分类"按钮，输入分类名称和排序顺序即可创建
- 编辑分类：点击分类右侧的"编辑"按钮，修改分类名称和排序顺序
- 删除分类：点击分类右侧的"删除"按钮，会弹出确认弹窗，确认后删除分类及其下的所有待办事项
- 分类拖拽排序：支持直接拖拽分类调整排序顺序，拖拽结束后会自动更新排序并保存到数据库
- 每个分类下的待办事项相互独立，包含待处理和已完成列表

### 8. 样式优化

- 与纯前端版本风格一致
- 响应式设计，适配不同屏幕尺寸
- 清晰的视觉层次，突出重要信息
- 流畅的动画效果，提升用户体验

### 9. 多租户支持

- 后端实现了多租户隔离
- 每个租户只能访问和管理自己的待办事项
- 基于 TenantId 进行数据隔离

### 10. 数据持久化

- 所有待办事项数据存储到数据库
- 支持数据的持久化保存和读取
- 确保数据不会丢失

## 技术实现

### 前端

- React 18
- Ant Design 6.3.6
- React DnD (拖拽功能)
- Axios (API 调用)

### 后端

- .NET 8.0
- Entity Framework Core
- Repository Pattern
- Service Layer
- RESTful API
- Multi-tenancy (TenantEntityBase inheritance)

## 文件结构

```
EasyAdmin-Web/src/views/tool/todoListWithPriority/
├── Heaher/           # 顶部输入栏组件
│   ├── index.jsx     # 顶部输入栏组件
│   └── CategorySelector.jsx  # 分类选择组件【目前没有使用，用CategoryManager替代】
├── Item/             # 待办事项项组件
│   ├── DraggableTodoItem.jsx  # 可拖拽的待办事项项
│   ├── index.jsx     # 待办事项项组件
│   └── index.css     # 样式文件
├── Footer/           # 底部组件
├── CategoryManager.jsx  # 分类管理组件
├── index.jsx         # 主组件
└── README.md         # 功能说明文档
```

## API 接口

### 前端 API 调用

#### 待办事项相关

- `getTodoList(categoryId?)`：获取待办事项列表（可选按分类 ID 筛选）
- `addTodoItem(data)`：添加待办事项
- `updateTodoStatus(data)`：更新待办事项状态
- `batchUpdateTodoStatus(data)`：批量更新待办事项状态
- `updateTodoPriority(data)`：更新待办事项优先级
- `updateTodoName(data)`：更新待办事项内容
- `updateTodoSortOrder(data)`：更新待办事项排序顺序
- `deleteTodoItem(id)`：删除待办事项
- `clearCompleted(categoryId?)`：清除已完成的待办事项（可选按分类 ID 筛选）

#### 分类相关

- `getCategoryList()`：获取分类列表
- `addCategory(data)`：添加分类
- `deleteCategory(id)`：删除分类
- `updateCategory(data)`：更新分类

### 后端 API 端点

#### 待办事项相关

- `GET /TodoItem/List?categoryId={id}`：获取待办事项列表
- `POST /TodoItem/Add`：添加待办事项
- `POST /TodoItem/UpdateStatus`：更新待办事项状态
- `POST /TodoItem/BatchUpdateStatus`：批量更新待办事项状态
- `POST /TodoItem/UpdatePriority`：更新待办事项优先级
- `POST /TodoItem/UpdateName`：更新待办事项内容
- `POST /TodoItem/UpdateSortOrder`：更新待办事项排序顺序
- `POST /TodoItem/Delete`：删除待办事项
- `POST /TodoItem/ClearCompleted?categoryId={id}`：清除已完成的待办事项

#### 分类相关

- `GET /TodoCategory/List`：获取分类列表
- `POST /TodoCategory/Add`：添加分类
- `POST /TodoCategory/Update`：更新分类
- `POST /TodoCategory/Delete`：删除分类

## 数据库设计

### TodoItemEntity

- `Id`：主键
- `TenantId`：租户 ID（多租户隔离）
- `UserId`：用户 ID
- `CategoryId`：分类 ID
- `Name`：待办事项内容
- `Done`：是否完成
- `Priority`：优先级（1: 低, 2: 中, 3: 高）
- `SortOrder`：排序顺序
- `CreateTime`：创建时间
- `UpdateTime`：更新时间

### TodoCategoryEntity

- `Id`：主键
- `TenantId`：租户 ID（多租户隔离）
- `UserId`：用户 ID（用户隔离）
- `Name`：分类名称
- `SortOrder`：排序顺序
- `CreateTime`：创建时间
- `UpdateTime`：更新时间

## 使用说明

1. 打开应用，进入待办事项页面
2. 左侧为分类管理区域，右侧为待办事项列表
3. **分类管理操作**：
   - 点击"新增分类"按钮创建新分类，输入分类名称和排序顺序
   - 点击分类右侧的"编辑"按钮修改分类信息
   - 点击分类右侧的"删除"按钮删除分类及其下的所有待办事项
   - 直接拖拽分类调整排序顺序
   - 点击分类名称切换到对应分类的待办事项
4. **待办事项操作**：
   - 在顶部输入框中输入待办事项内容
   - 选择优先级（低、中、高）
   - 按回车键创建待办事项
   - 点击待办事项左侧的复选框标记为已完成/未完成
   - 点击待办事项内容进入编辑模式，修改后按 Enter 保存
   - 点击待办事项右侧的下拉菜单调整优先级
   - 点击待办事项右侧的"删除"按钮删除待办事项
   - 拖拽待办事项调整同一优先级内的排序顺序
   - 点击列表标题右侧的"收起"/"展开"按钮折叠/展开列表
   - 点击底部的"清除已完成任务"按钮清除当前分类下的所有已完成待办事项

## 注意事项

1. 拖拽排序只支持同一优先级和同一完成状态的项目之间
2. 优先级调整后会自动更新排序顺序
3. 所有操作都会实时保存到数据库
4. 多租户环境下，每个租户只能访问自己的待办事项
5. 删除分类会删除该分类下的所有待办事项，请谨慎操作
6. 清除已完成任务只会清除当前分类下的已完成事项
7. 分类排序会影响分类列表的显示顺序，拖拽分类后会自动更新排序
