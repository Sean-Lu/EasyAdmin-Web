import React, { useState } from "react";
import { Card, Button, Input, Select, Table, message, Space, Tag } from "antd";
import { CodeOutlined, PlayCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { BackendId } from "@/api/interface";
import {
	parseEntityCode,
	CodeFirstParseResultDto,
	CodeGenColumnConfigDto,
	CodeGenConfigReqDto,
	generateCodeByConfig,
	CodeGenResultDto
} from "@/services/tool/codeGenService";

const { TextArea } = Input;

interface EntitySourcePanelProps {
	templateIds: BackendId[];
	genParams: {
		packageName: string;
		moduleName: string;
		author: string;
	};
	onCodeGenerated: (result: CodeGenResultDto) => void;
}

/**
 * Entity源码面板
 */
const EntitySourcePanel: React.FC<EntitySourcePanelProps> = ({ templateIds, genParams, onCodeGenerated }) => {
	const [language, setLanguage] = useState<string>("csharp");
	const [sourceCode, setSourceCode] = useState<string>("");
	const [parsing, setParsing] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [parseResult, setParseResult] = useState<CodeFirstParseResultDto | null>(null);

	const handleParse = async () => {
		if (!sourceCode.trim()) {
			message.warning("请输入Entity源码");
			return;
		}
		setParsing(true);
		try {
			const result = await parseEntityCode({ sourceCode, language });
			setParseResult(result);
			message.success("解析成功");
		} catch (error: any) {
			message.error(error?.message || "解析失败");
			setParseResult(null);
		} finally {
			setParsing(false);
		}
	};

	const handleGenerate = async () => {
		if (!parseResult) {
			message.warning("请先解析Entity源码");
			return;
		}
		if (templateIds.length === 0) {
			message.warning("请选择代码模板");
			return;
		}
		setGenerating(true);
		try {
			const configReq: CodeGenConfigReqDto = {
				className: parseResult.className,
				tableName: parseResult.tableName,
				tableComment: parseResult.tableComment,
				packageName: genParams.packageName,
				moduleName: genParams.moduleName,
				author: genParams.author,
				templateIds,
				columns: parseResult.columns.map(col => ({
					propertyName: col.propertyName,
					fieldName: col.fieldName,
					columnName: col.columnName,
					columnComment: col.columnComment,
					cSharpType: col.cSharpType,
					javaType: col.javaType,
					isNullable: col.isNullable,
					isKey: col.isKey,
					isIdentity: col.isIdentity
				}))
			};
			const result = await generateCodeByConfig(configReq);
			onCodeGenerated(result);
			message.success("代码生成成功");
		} catch (error: any) {
			message.error(error?.message || "生成失败");
		} finally {
			setGenerating(false);
		}
	};

	const columns = [
		{ title: "属性名", dataIndex: "propertyName", key: "propertyName", width: 140 },
		{ title: "字段名", dataIndex: "fieldName", key: "fieldName", width: 100 },
		{
			title: "C#类型",
			dataIndex: "cSharpType",
			key: "cSharpType",
			width: 100,
			render: (t: string) => <Tag color="blue">{t}</Tag>
		},
		{
			title: "Java类型",
			dataIndex: "javaType",
			key: "javaType",
			width: 100,
			render: (t: string) => <Tag color="green">{t}</Tag>
		},
		{ title: "描述", dataIndex: "columnComment", key: "columnComment" },
		{
			title: "主键",
			dataIndex: "isKey",
			key: "isKey",
			width: 60,
			render: (v: boolean) => (v ? <Tag color="red">是</Tag> : <Tag>-</Tag>)
		}
	];

	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<CodeOutlined style={{ fontSize: 16 }} />
					<span>Entity源码</span>
				</div>
			}
			variant="outlined"
			style={{ borderRadius: 8 }}
		>
			<div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ fontSize: 13, whiteSpace: "nowrap" }}>语言:</span>
				<Select
					value={language}
					onChange={setLanguage}
					style={{ width: 120 }}
					options={[
						{ label: "C#", value: "csharp" },
						{ label: "Java", value: "java" }
					]}
				/>
				<span style={{ fontSize: 13, whiteSpace: "nowrap", marginLeft: 8 }}>或上传文件:</span>
				<input
					type="file"
					accept=".cs,.java"
					style={{ fontSize: 12 }}
					onChange={e => {
						const file = e.target.files?.[0];
						if (file) {
							const reader = new FileReader();
							reader.onload = ev => setSourceCode(ev.target?.result as string);
							reader.readAsText(file);
						}
					}}
				/>
			</div>

			<TextArea
				value={sourceCode}
				onChange={e => setSourceCode(e.target.value)}
				placeholder={
					language === "csharp"
						? '// 粘贴C# Entity类源码\npublic class UserEntity : EntityBase\n{\n    [Description("用户名")]\n    public string Name { get; set; }\n}'
						: "// 粘贴Java Entity类源码\n@Data\npublic class User {\n    private String name;\n}"
				}
				rows={10}
				style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 13, marginBottom: 12 }}
			/>

			<Space>
				<Button type="primary" icon={<PlayCircleOutlined />} onClick={handleParse} loading={parsing}>
					解析预览
				</Button>
			</Space>

			{parseResult && (
				<div style={{ marginTop: 16 }}>
					<Card
						type="inner"
						title={
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<FileTextOutlined />
								<span>解析结果</span>
								<Tag style={{ marginLeft: 8 }}>className: {parseResult.className}</Tag>
								<Tag>tableName: {parseResult.tableName}</Tag>
								{parseResult.namespace && <Tag color="purple">{parseResult.namespace}</Tag>}
								{parseResult.tableComment && <span style={{ fontSize: 12, color: "#666" }}>{parseResult.tableComment}</span>}
							</div>
						}
						size="small"
					>
						{parseResult.columns.length > 0 && (
							<Table
								dataSource={parseResult.columns}
								columns={columns}
								rowKey="propertyName"
								pagination={false}
								size="small"
								style={{ marginTop: 8 }}
							/>
						)}
					</Card>

					<Button
						type="primary"
						size="large"
						block
						icon={<PlayCircleOutlined />}
						onClick={handleGenerate}
						loading={generating}
						style={{ marginTop: 16 }}
					>
						生成代码
					</Button>
				</div>
			)}
		</Card>
	);
};

export default EntitySourcePanel;
