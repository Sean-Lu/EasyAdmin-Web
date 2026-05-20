import http from "@/api/index";
import { PORT1 } from "@/api/config/servicePort";
import { DtoBase } from "@/api/interface";

/**代码生成数据库类型 */
export enum CodeGenDbType {
	MySql = 0, //MySQL数据库
	SqlServer = 1, //SQL Server数据库
	PostgreSql = 2 //PostgreSQL数据库
}

/**代码生成模板类型 */
export enum CodeGenTemplateType {
	BuiltIn = 0, //内置模板
	UserUpload = 1 //用户上传模板
}

/**代码生成模板DTO */
export interface CodeGenTemplateDto extends DtoBase {
	name: string; //模板名称
	code: string; //模板代码
	categoryId: number; //分类ID
	categoryName: string; //分类名称
	templateType: CodeGenTemplateType; //模板类型
	content: string; //模板内容
	description: string; //模板描述
	filePath: string; //文件路径模板（包含目录和文件名）
	isDefault: boolean; //是否默认模板
	sortOrder: number; //排序号
	state: number; //状态
}

/**数据库连接配置DTO */
export interface DbConnectionConfigDto extends DtoBase {
	name: string; //连接配置名称
	dbType: CodeGenDbType; //数据库类型
	host: string; //主机主机名
	port: number; //数据库端口
	database: string; //数据库名称
	username: string; //数据库用户名
	password: string; //数据库密码
	connectionString: string; //数据库连接字符串
	isDefault: boolean; //是否默认连接配置
	state: number; //状态
}

/**数据库列信息DTO */
export interface DbColumnInfoDto {
	columnName: string; //列名
	columnComment: string; //列注释
	dbType: string; //数据库类型
	cSharpType: string; //C#类型
	javaType: string; //Java类型
	isNullable: boolean; //是否可空
	isKey: boolean; //是否主键
	isIdentity: boolean; //是否自增
}

/**数据库表信息DTO */
export interface DbTableInfoDto {
	tableName: string; //表名
	tableComment: string; //表注释
	columns: DbColumnInfoDto[]; //列信息列表
}

/**代码生成文件DTO */
export interface CodeGenFileDto {
	fileName: string; //文件名
	filePath: string; //文件路径
	content: string; //文件内容
	fileExtension: string; //文件扩展名
}

/**代码生成结果DTO */
export interface CodeGenResultDto {
	taskId: string; //任务ID
	files: CodeGenFileDto[]; //文件列表
}

/**代码生成请求DTO */
export interface CodeGenReqDto {
	dbConfigId: number; //数据库连接配置ID
	tableNames: string[]; //表名列表
	templateIds: number[]; //模板ID列表
	packageName: string; //包名
	moduleName: string; //模块名
	author: string; //作者
	tablePrefix: string; //表前缀
}

/**代码生成列配置DTO（配置模式 / 代码解析模式共用） */
export interface CodeGenColumnConfigDto {
	propertyName: string; //属性名
	fieldName?: string; //字段名
	columnName?: string; //列名
	columnComment?: string; //列注释
	dbType?: string; //数据库类型
	cSharpType?: string; //C#类型
	javaType?: string; //Java类型
	isNullable: boolean; //是否可空
	isKey: boolean; //是否主键
	isIdentity: boolean; //是否自增
}

/**代码生成配置请求DTO（配置模式 / 代码解析模式共用） */
export interface CodeGenConfigReqDto {
	className: string; //类名（必填）
	instanceName?: string; //实例名
	tableName?: string; //表名
	tableComment?: string; //表注释
	packageName?: string; //包名
	moduleName?: string; //模块名
	author?: string; //作者
	templateIds: number[]; //模板ID列表
	columns?: CodeGenColumnConfigDto[]; //列配置
}

/**Entity源码解析请求DTO */
export interface CodeFirstParseReqDto {
	sourceCode: string; //Entity源码
	language: string; //语言: csharp / java
}

/**Entity源码解析结果DTO */
export interface CodeFirstParseResultDto {
	className: string; //类名
	tableName: string; //表名
	tableComment: string; //表注释
	namespace: string; //命名空间
	columns: CodeGenColumnConfigDto[]; //列配置
}

/**获取代码生成模板列表 */
export const getTemplates = async (params?: {
	name?: string; //模板名称
	templateType?: number; //模板类型
	state?: number; //状态
	categoryId?: number; //分类ID
}): Promise<CodeGenTemplateDto[]> => {
	const res = await http.get<CodeGenTemplateDto[]>(`${PORT1}/codeGen/GetTemplates`, params);
	return res.data;
};

/**获取代码生成模板 */
export const getTemplate = async (id: number): Promise<CodeGenTemplateDto> => {
	const res = await http.get<CodeGenTemplateDto>(`${PORT1}/codeGen/GetTemplate`, { id });
	return res.data;
};

/**添加代码生成模板 */
export const addTemplate = async (data: CodeGenTemplateDto): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/AddTemplate`, data);
	return res.data;
};

/**更新代码生成模板 */
export const updateTemplate = async (data: any): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/UpdateTemplate`, data);
	return res.data;
};

/**删除代码生成模板 */
export const deleteTemplate = async (id: number): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/DeleteTemplate`, { id });
	return res.data;
};

/**获取数据库连接配置列表 */
export const getDbConfigs = async (params?: {
	name?: string; //连接配置名称
	dbType?: number; //数据库类型
	state?: number; //状态
}): Promise<DbConnectionConfigDto[]> => {
	const res = await http.get<DbConnectionConfigDto[]>(`${PORT1}/codeGen/GetDbConfigs`, params);
	return res.data;
};

/**获取数据库连接配置 */
export const getDbConfig = async (id: number): Promise<DbConnectionConfigDto> => {
	const res = await http.get<DbConnectionConfigDto>(`${PORT1}/codeGen/GetDbConfig`, { id });
	return res.data;
};

/**添加数据库连接配置 */
export const addDbConfig = async (data: any): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/AddDbConfig`, data);
	return res.data;
};

/**更新数据库连接配置 */
export const updateDbConfig = async (data: any): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/UpdateDbConfig`, data);
	return res.data;
};

/**删除数据库连接配置 */
export const deleteDbConfig = async (id: number): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/DeleteDbConfig`, { id });
	return res.data;
};

/**测试数据库连接 */
export const testDbConnection = async (id: number): Promise<boolean> => {
	const res = await http.post<boolean>(`${PORT1}/codeGen/TestDbConnection?id=${id}`);
	return res.data;
};

/**获取数据库表信息列表 */
export const getDbTables = async (id: number): Promise<DbTableInfoDto[]> => {
	const res = await http.get<DbTableInfoDto[]>(`${PORT1}/codeGen/GetDbTables`, { id });
	return res.data;
};

/**生成代码（数据库模式） */
export const generateCode = async (data: CodeGenReqDto): Promise<CodeGenResultDto> => {
	const res = await http.post<CodeGenResultDto>(`${PORT1}/codeGen/GenerateCode`, data);
	return res.data;
};

/**生成代码（配置模式 / 代码解析模式） */
export const generateCodeByConfig = async (data: CodeGenConfigReqDto): Promise<CodeGenResultDto> => {
	const res = await http.post<CodeGenResultDto>(`${PORT1}/codeGen/GenerateCodeByConfig`, data);
	return res.data;
};

/**解析Entity源码 */
export const parseEntityCode = async (data: CodeFirstParseReqDto): Promise<CodeFirstParseResultDto> => {
	const res = await http.post<CodeFirstParseResultDto>(`${PORT1}/codeGen/ParseEntityCode`, data);
	return res.data;
};

/**下载单个代码文件 */
export const downloadFile = async (taskId: string, fileName: string): Promise<void> => {
	try {
		const response = await http.downloadGet(`${PORT1}/codeGen/DownloadFile`, { taskId, fileName });
		const contentDisposition = response.headers["content-disposition"];
		let downloadFileName = fileName;
		if (contentDisposition) {
			const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
			if (utf8FilenameMatch && utf8FilenameMatch[1]) {
				downloadFileName = decodeURIComponent(utf8FilenameMatch[1]);
			} else {
				const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
				if (filenameMatch && filenameMatch[1]) {
					downloadFileName = filenameMatch[1].replace(/"/g, "");
				}
			}
		}
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", downloadFileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error("下载文件失败:", error);
		throw error;
	}
};

/**下载代码生成包 */
export const downloadPackage = async (taskId: string): Promise<void> => {
	try {
		const response = await http.downloadGet(`${PORT1}/codeGen/DownloadPackage`, { taskId });
		const contentDisposition = response.headers["content-disposition"];
		let fileName = `codegen_${taskId.slice(0, 8)}.zip`;
		if (contentDisposition) {
			const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
			if (utf8FilenameMatch && utf8FilenameMatch[1]) {
				fileName = decodeURIComponent(utf8FilenameMatch[1]);
			} else {
				const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
				if (filenameMatch && filenameMatch[1]) {
					fileName = filenameMatch[1].replace(/"/g, "");
				}
			}
		}
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error("下载代码包失败:", error);
		throw error;
	}
};

/**代码生成分类DTO */
export interface CodeGenCategoryDto extends DtoBase {
	name: string; //分类名称
	code: string; //分类编码
	parentId: number; //父分类ID
	level: number; //层级
	sortOrder: number; //排序号
	description: string; //分类描述
	isBuiltIn: boolean; //是否内置分类
	state: number; //状态
}

/**获取分类列表 */
export const getCategoryTree = async (): Promise<CodeGenCategoryDto[]> => {
	const res = await http.get<CodeGenCategoryDto[]>(`${PORT1}/codeGenCategory/Tree`);
	return res.data;
};

/**获取分类列表 */
export const getCategories = async (): Promise<CodeGenCategoryDto[]> => {
	const res = await http.get<CodeGenCategoryDto[]>(`${PORT1}/codeGenCategory/List`);
	return res.data;
};

/**获取分类详情 */
export const getCategory = async (id: number): Promise<CodeGenCategoryDto> => {
	const res = await http.get<CodeGenCategoryDto>(`${PORT1}/codeGenCategory/Detail`, { id });
	return res.data;
};

/**添加分类 */
export const addCategory = async (data: {
	name: string;
	code: string;
	parentId?: number;
	sortOrder?: number;
	description?: string;
}): Promise<number> => {
	const res = await http.post<number>(`${PORT1}/codeGenCategory/Add`, data);
	return res.data;
};

/**更新分类 */
export const updateCategory = async (data: {
	id: number;
	name: string;
	code: string;
	parentId?: number;
	sortOrder: number;
	description?: string;
	state: number;
}): Promise<void> => {
	await http.post(`${PORT1}/codeGenCategory/Update`, data);
};

/**删除分类 */
export const deleteCategory = async (id: number): Promise<void> => {
	await http.post(`${PORT1}/codeGenCategory/Delete`, { id });
};

/**导出分类 */
export const exportCategories = () => {
	window.open(`${PORT1}/codeGenCategory/Export`, "_blank");
};

/**导入分类 */
export const importCategories = async (data: {
	categories: Array<{
		name: string;
		code: string;
		parentId?: number;
		sortOrder?: number;
		description?: string;
	}>;
}): Promise<void> => {
	await http.post(`${PORT1}/codeGenCategory/Import`, { categories: data.categories });
};
