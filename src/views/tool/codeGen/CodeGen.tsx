import React, { useState, useEffect, useRef } from "react";
import { Card, Row, Col, message, Segmented } from "antd";
import { BackendId } from "@/api/interface";
import {
	getTemplates,
	getDbConfigs,
	getDbTables,
	generateCode,
	getCategoryTree,
	CodeGenTemplateDto,
	DbConnectionConfigDto,
	DbTableInfoDto,
	CodeGenResultDto,
	CodeGenCategoryDto
} from "@/services/tool/codeGenService";
import DbConfigPanel from "./components/DbConfigPanel";
import DbTablePanel from "./components/DbTablePanel";
import CategoryPanel from "./components/CategoryPanel";
import TemplatePanel from "./components/TemplatePanel";
import GenConfigPanel, { CodeGenMode } from "./components/GenConfigPanel";
import GenResultPanel from "./components/GenResultPanel";
import HelpPanel from "./components/HelpPanel";
import EntitySourcePanel from "./components/EntitySourcePanel";
import ConfigModePanel from "./components/ConfigModePanel";

/**
 * 代码生成器组件
 * 提供数据库配置管理、代码模板管理、代码生成和预览功能
 */
const CodeGen: React.FC = () => {
	const [mode, setMode] = useState<CodeGenMode>("dbFirst");

	/** 数据库配置列表 */
	const [dbConfigs, setDbConfigs] = useState<DbConnectionConfigDto[]>([]);
	/** 当前选中的数据库配置ID */
	const [selectedDbConfig, setSelectedDbConfig] = useState<BackendId | null>(null);
	/** 数据库表列表 */
	const [dbTables, setDbTables] = useState<DbTableInfoDto[]>([]);
	/** 选中的数据表列表 */
	const [selectedTables, setSelectedTables] = useState<string[]>([]);
	/** 数据表搜索关键词 */
	const [tableSearchText, setTableSearchText] = useState("");

	/** 分类列表 */
	const [categories, setCategories] = useState<CodeGenCategoryDto[]>([]);
	/** 当前选中的分类ID */
	const [selectedCategory, setSelectedCategory] = useState<BackendId | null>(null);
	/** 代码模板列表 */
	const [templates, setTemplates] = useState<CodeGenTemplateDto[]>([]);
	/** 选中的模板ID列表 */
	const [selectedTemplates, setSelectedTemplates] = useState<BackendId[]>([]);

	/** 代码生成参数配置 */
	const [genParams, setGenParams] = useState({
		packageName: "com.example",
		moduleName: "system",
		author: "Sean",
		tablePrefix: "t_"
	});

	/** 代码生成结果 */
	const [generatedResult, setGeneratedResult] = useState<CodeGenResultDto | null>(null);

	/** 模板加载状态（防并发） */
	const loadingTemplatesRef = useRef(false);
	/** 选中模板引用（用于闭包捕获最新值） */
	const selectedTemplatesRef = useRef(selectedTemplates);
	selectedTemplatesRef.current = selectedTemplates;

	/**
	 * 组件挂载时加载数据库配置和分类列表
	 */
	useEffect(() => {
		loadDbConfigs();
		loadCategories();
	}, []);

	useEffect(() => {
		setGeneratedResult(null);
		setSelectedTables([]);
		setSelectedTemplates([]);
	}, [mode]);

	/**
	 * 加载数据库配置列表
	 */
	const loadDbConfigs = async () => {
		try {
			const data = await getDbConfigs();
			setDbConfigs(data);
		} catch (error) {
			console.error("加载数据库配置失败:", error);
			message.error("加载数据库配置失败");
		}
	};

	/**
	 * 加载分类列表
	 */
	const loadCategories = async () => {
		try {
			const data = await getCategoryTree();
			setCategories(data);
		} catch (error) {
			console.error("加载分类失败:", error);
			message.error("加载分类失败");
		}
	};

	/**
	 * 加载代码模板列表（需要先选择分类）
	 */
	const loadTemplates = async (categoryId?: BackendId) => {
		if (!categoryId) {
			setTemplates([]);
			return;
		}
		if (loadingTemplatesRef.current) return;
		loadingTemplatesRef.current = true;
		try {
			const data = await getTemplates({ categoryId });
			setTemplates(data);
			if (data.length > 0 && selectedTemplatesRef.current.length === 0) {
				setSelectedTemplates(data.filter(t => t.isDefault).map(t => t.id));
			}
		} catch (error) {
			console.error("加载模板列表失败:", error);
			message.error("加载模板列表失败");
		} finally {
			loadingTemplatesRef.current = false;
		}
	};

	/**
	 * 选择数据库配置，加载该配置下的数据表列表
	 */
	const handleSelectDbConfig = async (id: BackendId) => {
		setSelectedDbConfig(id);
		try {
			const data = await getDbTables(id);
			setDbTables(data);
			setSelectedTables([]);
			setTableSearchText("");
		} catch (error) {
			console.error("加载数据库表失败:", error);
			message.error("加载数据库表失败");
		}
	};

	/**
	 * 选择分类，加载该分类下的模板列表
	 */
	const handleSelectCategory = (id: BackendId | null) => {
		setSelectedCategory(id);
		setSelectedTemplates([]);
		if (id) {
			loadTemplates(id);
		} else {
			setTemplates([]);
		}
	};

	/**
	 * 全选/取消全选数据表
	 */
	const handleSelectAllTables = () => {
		const filtered = tableSearchText
			? dbTables.filter(
					t =>
						t.tableName.toLowerCase().includes(tableSearchText.toLowerCase()) ||
						(t.tableComment && t.tableComment.toLowerCase().includes(tableSearchText.toLowerCase()))
			  )
			: dbTables;

		const allSelected = filtered.length > 0 && filtered.every(t => selectedTables.includes(t.tableName));
		if (allSelected) {
			setSelectedTables(prev => prev.filter(name => !filtered.find(t => t.tableName === name)));
		} else {
			setSelectedTables(prev => [...new Set([...prev, ...filtered.map(t => t.tableName)])]);
		}
	};

	/**
	 * 全选/取消全选代码模板
	 */
	const handleSelectAllTemplates = () => {
		if (templates.length === selectedTemplates.length) {
			setSelectedTemplates([]);
		} else {
			setSelectedTemplates(templates.map(t => t.id));
		}
	};

	/**
	 * 切换单个数据表的选中状态
	 */
	const handleSelectTable = (tableName: string, checked: boolean) => {
		if (checked) {
			setSelectedTables([...selectedTables, tableName]);
		} else {
			setSelectedTables(selectedTables.filter(name => name !== tableName));
		}
	};

	/**
	 * 切换单个代码模板的选中状态
	 */
	const handleSelectTemplate = (id: BackendId, checked: boolean) => {
		if (checked) {
			setSelectedTemplates([...selectedTemplates, id]);
		} else {
			setSelectedTemplates(selectedTemplates.filter(tid => tid !== id));
		}
	};

	/**
	 * 生成代码，校验必选项后调用后端接口
	 */
	const handleGenerateCode = async () => {
		if (!selectedDbConfig) {
			message.warning("请选择数据库配置");
			return;
		}
		if (selectedTables.length === 0) {
			message.warning("请选择要生成代码的表");
			return;
		}
		if (selectedTemplates.length === 0) {
			message.warning("请选择代码模板");
			return;
		}

		try {
			const data = await generateCode({
				dbConfigId: selectedDbConfig,
				tableNames: selectedTables,
				templateIds: selectedTemplates,
				...genParams
			});
			setGeneratedResult(data);
			message.success("代码生成成功");
		} catch (error) {
			message.error("代码生成失败");
		}
	};

	const handleCodeFirstGenerated = (result: CodeGenResultDto) => {
		setGeneratedResult(result);
	};

	const getModeLabel = () => {
		switch (mode) {
			case "dbFirst":
				return "数据库模式";
			case "codeFirst":
				return "代码解析模式";
			case "config":
				return "配置模式";
		}
	};

	return (
		<div className="code-gen-page" style={{ padding: 16 }}>
			<Card title="代码生成器" extra={<span style={{ fontSize: 12, color: "#666" }}>三种生成模式，灵活适配不同场景</span>}>
				<div style={{ marginBottom: 16 }}>
					<Segmented
						value={mode}
						onChange={val => setMode(val as CodeGenMode)}
						options={[
							{ label: "数据库模式", value: "dbFirst" },
							{ label: "代码解析模式", value: "codeFirst" },
							{ label: "配置模式", value: "config" }
						]}
					/>
				</div>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9}>
						<CategoryPanel
							categories={categories}
							selectedCategory={selectedCategory}
							onSelectCategory={handleSelectCategory}
							onRefresh={loadCategories}
							compact
						/>
					</Col>

					<Col xs={24} lg={15}>
						<TemplatePanel
							templates={templates}
							selectedTemplates={selectedTemplates}
							selectedCategory={selectedCategory}
							categories={categories}
							onSelectTemplate={handleSelectTemplate}
							onSelectAll={handleSelectAllTemplates}
							onRefresh={() => loadTemplates(selectedCategory ?? undefined)}
						/>
					</Col>

					{mode === "dbFirst" && (
						<>
							<Col xs={24} lg={9}>
								<DbConfigPanel
									dbConfigs={dbConfigs}
									selectedDbConfig={selectedDbConfig}
									onSelectDbConfig={handleSelectDbConfig}
									onRefresh={loadDbConfigs}
								/>
							</Col>

							<Col xs={24} lg={15}>
								<DbTablePanel
									dbTables={dbTables}
									selectedTables={selectedTables}
									selectedDbConfig={selectedDbConfig}
									tableSearchText={tableSearchText}
									onSearchChange={setTableSearchText}
									onSelectAll={handleSelectAllTables}
									onSelectTable={handleSelectTable}
								/>
							</Col>
						</>
					)}

					{mode === "codeFirst" && (
						<Col span={24}>
							<EntitySourcePanel
								templateIds={selectedTemplates}
								genParams={genParams}
								onCodeGenerated={handleCodeFirstGenerated}
							/>
						</Col>
					)}

					{mode === "config" && (
						<Col span={24}>
							<ConfigModePanel templateIds={selectedTemplates} onCodeGenerated={handleCodeFirstGenerated} />
						</Col>
					)}

					<Col span={24}>
						<GenConfigPanel
							mode={mode}
							genParams={genParams}
							onParamsChange={params => setGenParams(prev => ({ ...prev, ...params }))}
							onGenerate={handleGenerateCode}
						/>
					</Col>
				</Row>

				{generatedResult && <GenResultPanel result={generatedResult} />}
			</Card>

			<HelpPanel />
		</div>
	);
};

export default CodeGen;
