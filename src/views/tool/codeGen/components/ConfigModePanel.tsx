import React, { useState } from "react";
import { Card, Button, Form, Input, Table, message, Space, Divider, Tag, Select } from "antd";
import { PlusOutlined, DeleteOutlined, SettingOutlined, PlayCircleOutlined } from "@ant-design/icons";
import {
	generateCodeByConfig,
	CodeGenConfigReqDto,
	CodeGenColumnConfigDto,
	CodeGenResultDto
} from "@/services/tool/codeGenService";

interface ConfigModePanelProps {
	templateIds: number[];
	onCodeGenerated: (result: CodeGenResultDto) => void;
}

/**
 * 配置模式面板
 */
const ConfigModePanel: React.FC<ConfigModePanelProps> = ({ templateIds, onCodeGenerated }) => {
	const [className, setClassName] = useState("");
	const [instanceName, setInstanceName] = useState("");
	const [instanceAuto, setInstanceAuto] = useState(true);
	const [tableName, setTableName] = useState("");
	const [tableComment, setTableComment] = useState("");
	const [packageName, setPackageName] = useState("com.example");
	const [moduleName, setModuleName] = useState("system");
	const [author, setAuthor] = useState("Sean");
	const [columns, setColumns] = useState<CodeGenColumnConfigDto[]>([]);
	const [generating, setGenerating] = useState(false);

	const handleClassNameChange = (val: string) => {
		setClassName(val);
		if (instanceAuto) {
			setInstanceName(val ? val.charAt(0).toLowerCase() + val.slice(1) : "");
		}
	};

	const handleAddColumn = () => {
		setColumns(prev => [
			...prev,
			{
				propertyName: "",
				fieldName: "",
				cSharpType: "string",
				javaType: "String",
				columnComment: "",
				isNullable: false,
				isKey: false,
				isIdentity: false
			}
		]);
	};

	const handleRemoveColumn = (index: number) => {
		setColumns(prev => prev.filter((_, i) => i !== index));
	};

	const handleColumnChange = (index: number, field: string, value: any) => {
		setColumns(prev => {
			const currentCols = [...prev];
			const col = { ...currentCols[index] };

			(col as Record<string, any>)[field] = value;

			if (field === "propertyName") {
				const pn = value as string;
				col.fieldName = pn ? pn.charAt(0).toLowerCase() + pn.slice(1) : "";
			}

			currentCols[index] = col;
			return currentCols;
		});
	};

	const handleGenerate = async () => {
		if (!className.trim()) {
			message.warning("类名(ClassName)不能为空");
			return;
		}
		if (templateIds.length === 0) {
			message.warning("请选择代码模板");
			return;
		}
		setGenerating(true);
		try {
			const configReq: CodeGenConfigReqDto = {
				className: className.trim(),
				instanceName: instanceName.trim() || undefined,
				tableName: tableName.trim() || undefined,
				tableComment: tableComment.trim() || undefined,
				packageName: packageName.trim() || undefined,
				moduleName: moduleName.trim() || undefined,
				author: author.trim() || undefined,
				templateIds,
				columns: columns.length > 0 ? columns : undefined
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

	const columnTableColumns = [
		{
			title: "属性名",
			dataIndex: "propertyName",
			key: "propertyName",
			width: 120,
			render: (_: string, record: CodeGenColumnConfigDto, index: number) => (
				<Input
					size="small"
					value={record.propertyName}
					onChange={e => handleColumnChange(index, "propertyName", e.target.value)}
					placeholder="如 Name"
				/>
			)
		},
		{
			title: "字段名",
			dataIndex: "fieldName",
			key: "fieldName",
			width: 100,
			render: (_: string, record: CodeGenColumnConfigDto, index: number) => (
				<Input
					size="small"
					value={record.fieldName}
					onChange={e => handleColumnChange(index, "fieldName", e.target.value)}
					placeholder="如 name"
				/>
			)
		},
		{
			title: "C#类型",
			dataIndex: "cSharpType",
			key: "cSharpType",
			width: 110,
			render: (_: string, record: CodeGenColumnConfigDto, index: number) => (
				<Select
					size="small"
					value={record.cSharpType}
					onChange={val => handleColumnChange(index, "cSharpType", val)}
					style={{ width: "100%" }}
					options={[
						{ label: "string", value: "string" },
						{ label: "int", value: "int" },
						{ label: "int?", value: "int?" },
						{ label: "long", value: "long" },
						{ label: "long?", value: "long?" },
						{ label: "decimal", value: "decimal" },
						{ label: "decimal?", value: "decimal?" },
						{ label: "bool", value: "bool" },
						{ label: "bool?", value: "bool?" },
						{ label: "DateTime", value: "DateTime" },
						{ label: "DateTime?", value: "DateTime?" },
						{ label: "Guid", value: "Guid" },
						{ label: "Guid?", value: "Guid?" }
					]}
				/>
			)
		},
		{
			title: "Java类型",
			dataIndex: "javaType",
			key: "javaType",
			width: 110,
			render: (_: string, record: CodeGenColumnConfigDto, index: number) => (
				<Select
					size="small"
					value={record.javaType}
					onChange={val => handleColumnChange(index, "javaType", val)}
					style={{ width: "100%" }}
					options={[
						{ label: "String", value: "String" },
						{ label: "Integer", value: "Integer" },
						{ label: "Long", value: "Long" },
						{ label: "BigDecimal", value: "BigDecimal" },
						{ label: "Boolean", value: "Boolean" },
						{ label: "Date", value: "Date" }
					]}
				/>
			)
		},
		{
			title: "描述",
			dataIndex: "columnComment",
			key: "columnComment",
			width: 180,
			render: (_: string, record: CodeGenColumnConfigDto, index: number) => (
				<Input
					size="small"
					value={record.columnComment}
					onChange={e => handleColumnChange(index, "columnComment", e.target.value)}
					placeholder="列描述"
				/>
			)
		},
		{
			title: "主键",
			dataIndex: "isKey",
			key: "isKey",
			width: 60,
			render: (_: boolean, record: CodeGenColumnConfigDto, index: number) => (
				<Select
					size="small"
					value={record.isKey ? "yes" : "no"}
					onChange={val => handleColumnChange(index, "isKey", val === "yes")}
					style={{ width: "100%" }}
					options={[
						{ label: "是", value: "yes" },
						{ label: "否", value: "no" }
					]}
				/>
			)
		},
		{
			title: "操作",
			key: "action",
			width: 80,
			fixed: "right" as const,
			render: (_: any, __: any, index: number) => (
				<Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveColumn(index)} />
			)
		}
	];

	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<SettingOutlined style={{ fontSize: 16 }} />
					<span>配置模式</span>
					<Tag color="orange" style={{ marginLeft: 4 }}>
						手动配置模板变量
					</Tag>
				</div>
			}
			bordered
			style={{ borderRadius: 8 }}
		>
			<Form layout="vertical">
				<Form.Item label="类名 (ClassName)" required help="必填，如 User、Product、Order">
					<Input value={className} onChange={e => handleClassNameChange(e.target.value)} placeholder="请输入类名，如 User" />
				</Form.Item>

				<Form.Item
					label={
						<Space>
							<span>实例名 (InstanceName)</span>
							<a
								onClick={() => {
									const auto = !instanceAuto;
									setInstanceAuto(auto);
									if (auto && className) {
										setInstanceName(className.charAt(0).toLowerCase() + className.slice(1));
									}
								}}
								style={{ fontSize: 12 }}
							>
								{instanceAuto ? "手动设置" : "自动推导"}
							</a>
						</Space>
					}
				>
					<Input
						value={instanceName}
						onChange={e => {
							setInstanceName(e.target.value);
							setInstanceAuto(false);
						}}
						placeholder="自动推导为类名首字母小写"
						disabled={instanceAuto}
					/>
				</Form.Item>

				<Form.Item label="表名 (TableName)">
					<Input value={tableName} onChange={e => setTableName(e.target.value)} placeholder="默认使用类名" />
				</Form.Item>
				<Form.Item label="表注释 (TableComment)">
					<Input value={tableComment} onChange={e => setTableComment(e.target.value)} placeholder="默认使用类名" />
				</Form.Item>

				<Form.Item label="包名 (PackageName)">
					<Input value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="com.example" />
				</Form.Item>
				<Form.Item label="模块名 (ModuleName)">
					<Input value={moduleName} onChange={e => setModuleName(e.target.value)} placeholder="system" />
				</Form.Item>
				<Form.Item label="作者 (Author)">
					<Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="作者名" />
				</Form.Item>
			</Form>

			<Divider style={{ margin: "8px 0 16px 0" }} />

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 8
				}}
			>
				<span style={{ fontSize: 13, fontWeight: 500 }}>列配置（可选）</span>
				<Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddColumn}>
					添加列
				</Button>
			</div>
			{columns.length > 0 ? (
				<Table
					dataSource={columns.map((col, i) => ({ ...col, _key: i }))}
					columns={columnTableColumns}
					rowKey="_key"
					pagination={false}
					size="small"
					scroll={{ x: 800 }}
				/>
			) : (
				<div style={{ textAlign: "center", padding: "16px 0", color: "#999", fontSize: 12 }}>
					列配置为空 — 适用于只使用基础模板变量（ClassName等）的模板
				</div>
			)}

			<Divider style={{ margin: "12px 0" }} />

			<Button type="primary" block size="large" icon={<PlayCircleOutlined />} onClick={handleGenerate} loading={generating}>
				生成代码
			</Button>
		</Card>
	);
};

export default ConfigModePanel;
