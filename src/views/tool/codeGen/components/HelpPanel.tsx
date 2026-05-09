import React, { useState } from "react";
import { Card, Tabs, Collapse } from "antd";
import {
	QuestionCircleOutlined,
	DatabaseOutlined,
	TableOutlined,
	FolderOutlined,
	CodeOutlined,
	SettingOutlined
} from "@ant-design/icons";

const { Panel } = Collapse;

/**
 * 使用帮助面板
 */
const HelpPanel: React.FC = () => {
	const [activeTab, setActiveTab] = useState("template");
	const [expanded, setExpanded] = useState(false);

	const variables = [
		{ name: "{{ClassName}}", description: "类名（PascalCase格式，如：User、UserInfo）", example: "users → Users" },
		{ name: "{{InstanceName}}", description: "实例名（camelCase格式，用于变量命名）", example: "Users → users" },
		{ name: "{{TableName}}", description: "数据库表名", example: "users" },
		{ name: "{{TableComment}}", description: "表注释/描述", example: "用户信息表" },
		{ name: "{{PackageName}}", description: "包名", example: "com.example" },
		{ name: "{{ModuleName}}", description: "模块名", example: "system" },
		{ name: "{{Author}}", description: "作者名", example: "Sean" },
		{ name: "{{Date}}", description: "生成日期", example: "2024-01-15" }
	];

	const columnVariables = [
		{ name: "{{ColumnName}}", description: "数据库列名", example: "user_name" },
		{ name: "{{FieldName}}", description: "字段名（camelCase格式）", example: "userName" },
		{ name: "{{PropertyName}}", description: "属性名（PascalCase格式）", example: "UserName" },
		{ name: "{{ColumnComment}}", description: "列注释", example: "用户名" },
		{ name: "{{DbType}}", description: "数据库类型", example: "VARCHAR(100)" },
		{ name: "{{JavaType}}", description: "Java类型", example: "String" },
		{ name: "{{CSharpType}}", description: "C#类型", example: "string" },
		{ name: "{{IsNullable}}", description: "是否可空", example: "true/false" },
		{ name: "{{IsKey}}", description: "是否主键", example: "true/false" },
		{ name: "{{IsIdentity}}", description: "是否自增", example: "true/false" }
	];

	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
					<QuestionCircleOutlined style={{ fontSize: 16 }} />
					<span>使用帮助</span>
					<span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>{expanded ? "点击收起" : "点击展开"}</span>
				</div>
			}
			bordered
			style={{ borderRadius: 8, marginTop: 16 }}
		>
			{expanded && (
				<Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
					<Tabs.TabPane
						key="template"
						tab={
							<span>
								<CodeOutlined /> 模板配置
							</span>
						}
					>
						<Collapse defaultActiveKey={["1"]} bordered={false}>
							<Panel header="模板变量说明" key="1">
								<div style={{ marginBottom: 16 }}>
									<p style={{ marginBottom: 12, color: "#666" }}>模板内容支持 Handlebars 语法，以下是可用的变量：</p>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 2fr 1fr",
											gap: "8px 16px",
											borderBottom: "1px solid #eee"
										}}
									>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>变量名</div>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>说明</div>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>示例</div>
									</div>
									{variables.map((v, i) => (
										<div
											key={i}
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 2fr 1fr",
												gap: "8px 16px",
												borderBottom: "1px solid #f0f0f0"
											}}
										>
											<div style={{ padding: "8px", color: "#1890ff", fontFamily: "monospace" }}>{v.name}</div>
											<div style={{ padding: "8px", color: "#666" }}>{v.description}</div>
											<div style={{ padding: "8px", color: "#999", fontSize: 12 }}>{v.example}</div>
										</div>
									))}
								</div>
							</Panel>

							<Panel header="列变量说明（循环使用）" key="2">
								<div style={{ marginBottom: 16 }}>
									<p style={{ marginBottom: 12, color: "#666" }}>
										通过{" "}
										<code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											{"{{#each Columns}}...{{/each}}"}
										</code>{" "}
										遍历列信息：
									</p>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 2fr 1fr",
											gap: "8px 16px",
											borderBottom: "1px solid #eee"
										}}
									>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>变量名</div>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>说明</div>
										<div style={{ fontWeight: "bold", padding: "8px", backgroundColor: "#fafafa" }}>示例</div>
									</div>
									{columnVariables.map((v, i) => (
										<div
											key={i}
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 2fr 1fr",
												gap: "8px 16px",
												borderBottom: "1px solid #f0f0f0"
											}}
										>
											<div style={{ padding: "8px", color: "#1890ff", fontFamily: "monospace" }}>{v.name}</div>
											<div style={{ padding: "8px", color: "#666" }}>{v.description}</div>
											<div style={{ padding: "8px", color: "#999", fontSize: 12 }}>{v.example}</div>
										</div>
									))}
								</div>
							</Panel>

							<Panel header="常用 Handlebars 语法" key="3">
								<div style={{ padding: 8 }}>
									<div style={{ marginBottom: 12 }}>
										<code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											{"{{#each Columns}}...{{/each}}"}
										</code>
										<span style={{ marginLeft: 12, color: "#666" }}>遍历所有列</span>
									</div>
									<div style={{ marginBottom: 12 }}>
										<code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											{"{{#if IsKey}}...{{/if}}"}
										</code>
										<span style={{ marginLeft: 12, color: "#666" }}>条件判断（如果是主键）</span>
									</div>
									<div style={{ marginBottom: 12 }}>
										<code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
											{"{{#unless IsNullable}}...{{/unless}}"}
										</code>
										<span style={{ marginLeft: 12, color: "#666" }}>反向条件判断（如果不可空）</span>
									</div>
									<div>
										<code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>{"{{{{content}}}}"}</code>
										<span style={{ marginLeft: 12, color: "#666" }}>不转义输出 HTML</span>
									</div>
								</div>
							</Panel>

							<Panel header="模板示例" key="4">
								<div style={{ padding: 8 }}>
									<p style={{ marginBottom: 12, color: "#666" }}>以下是一个简单的 Java 实体类模板示例：</p>
									<pre
										style={{
											backgroundColor: "#1e1e1e",
											color: "#d4d4d4",
											padding: 16,
											borderRadius: 8,
											overflowX: "auto",
											fontSize: 12
										}}
									>{`package {{PackageName}}.{{ModuleName}}.entity;

import lombok.Data;

/**
 * {{TableComment}}
 * 
 * @author {{Author}}
 * @since {{Date}}
 */
@Data
public class {{ClassName}} {

{{#each Columns}}
    /**
     * {{ColumnComment}}
     */
    private {{JavaType}} {{FieldName}};

{{/each}}
}`}</pre>
								</div>
							</Panel>
						</Collapse>
					</Tabs.TabPane>

					<Tabs.TabPane
						key="filePath"
						tab={
							<span>
								<FolderOutlined /> 文件路径配置
							</span>
						}
					>
						<div style={{ padding: 8 }}>
							<p style={{ marginBottom: 12, color: "#666" }}>文件路径支持以下变量：</p>
							<ul style={{ color: "#666", marginBottom: 16 }}>
								<li>
									<code>{"{{ClassName}}"}</code> - 类名
								</li>
								<li>
									<code>{"{{PackageName}}"}</code> - 包名
								</li>
								<li>
									<code>{"{{ModuleName}}"}</code> - 模块名
								</li>
							</ul>
							<p style={{ marginBottom: 12, color: "#666" }}>路径示例：</p>
							<div style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8 }}>
								<div style={{ marginBottom: 8 }}>
									<code>{"entity/{{ClassName}}.java"}</code> → <span style={{ color: "#999" }}>entity/User.java</span>
								</div>
								<div style={{ marginBottom: 8 }}>
									<code>{"controller/{{ClassName}}Controller.java"}</code> →{" "}
									<span style={{ color: "#999" }}>controller/UserController.java</span>
								</div>
								<div style={{ marginBottom: 8 }}>
									<code>{"service/I{{ClassName}}Service.java"}</code> →{" "}
									<span style={{ color: "#999" }}>service/IUserService.java</span>
								</div>
								<div>
									<code>{"service/impl/{{ClassName}}ServiceImpl.java"}</code> →{" "}
									<span style={{ color: "#999" }}>service/impl/UserServiceImpl.java</span>
								</div>
							</div>
						</div>
					</Tabs.TabPane>

					<Tabs.TabPane
						key="quickstart"
						tab={
							<span>
								<SettingOutlined /> 使用指南
							</span>
						}
					>
						<div style={{ padding: 8 }}>
							<div style={{ marginBottom: 16 }}>
								<h4 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
									<DatabaseOutlined /> 第一步：配置数据库
								</h4>
								<p style={{ color: "#666", paddingLeft: 28 }}>
									点击{"'"}新增配置{"'"}按钮，填写数据库连接信息，点击{"'"}测试连接{"'"}验证配置是否正确。
								</p>
							</div>

							<div style={{ marginBottom: 16 }}>
								<h4 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
									<TableOutlined /> 第二步：选择数据表
								</h4>
								<p style={{ color: "#666", paddingLeft: 28 }}>
									选择数据库配置后，系统会自动加载该数据库中的所有数据表。勾选需要生成代码的数据表。
								</p>
							</div>

							<div style={{ marginBottom: 16 }}>
								<h4 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
									<FolderOutlined /> 第三步：选择模板分类
								</h4>
								<p style={{ color: "#666", paddingLeft: 28 }}>
									选择代码模板分类（如 Java项目模板、C#项目模板），不同分类包含不同的代码模板。
								</p>
							</div>

							<div style={{ marginBottom: 16 }}>
								<h4 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
									<CodeOutlined /> 第四步：选择代码模板
								</h4>
								<p style={{ color: "#666", paddingLeft: 28 }}>
									勾选需要的代码模板（如 Entity、Controller、Service 等），支持自定义模板。
								</p>
							</div>

							<div style={{ marginBottom: 16 }}>
								<h4 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
									<SettingOutlined /> 第五步：配置生成参数
								</h4>
								<p style={{ color: "#666", paddingLeft: 28 }}>
									填写包名、模块名、作者名等信息，点击{"'"}生成代码{"'"}按钮即可生成代码。
								</p>
							</div>
						</div>
					</Tabs.TabPane>
				</Tabs>
			)}
		</Card>
	);
};

export default HelpPanel;
