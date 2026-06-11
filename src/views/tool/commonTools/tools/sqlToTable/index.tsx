import React, { useMemo, useState } from "react";
import { Button, Card, Col, Input, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, DownloadOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import "./index.less";

type SqlValue = string | number | boolean | null;

interface ParsedSqlTable {
	tableName: string;
	columns: string[];
	rows: Record<string, SqlValue>[];
	statementType: "INSERT" | "REPLACE";
}

const sampleSql = `INSERT INTO users (id, name, role, enabled, remark) VALUES
(1, 'Sean', 'admin', 1, 'hello'),
(2, 'EasyAdmin', 'tool', 1, NULL),
(3, 'SQL Parser', 'tool', 0, 'support ''quote'' escape');`;

const removeSqlComments = (sql: string) => {
	let result = "";
	let quote: "'" | '"' | "`" | null = null;

	for (let i = 0; i < sql.length; i++) {
		const char = sql[i];
		const next = sql[i + 1];

		if (!quote && char === "-" && next === "-") {
			while (i < sql.length && sql[i] !== "\n") i++;
			result += "\n";
			continue;
		}

		if (!quote && char === "/" && next === "*") {
			i += 2;
			while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
			i++;
			continue;
		}

		result += char;

		if (!quote && (char === "'" || char === '"' || char === "`")) {
			quote = char;
			continue;
		}

		if (quote === char) {
			if (quote === "'" && next === "'") {
				result += next;
				i++;
			} else if (sql[i - 1] !== "\\") {
				quote = null;
			}
		}
	}

	return result;
};

const splitStatements = (sql: string) => {
	const statements: string[] = [];
	let current = "";
	let quote: "'" | '"' | "`" | null = null;

	for (let i = 0; i < sql.length; i++) {
		const char = sql[i];
		const next = sql[i + 1];
		current += char;

		if (!quote && (char === "'" || char === '"' || char === "`")) {
			quote = char;
			continue;
		}

		if (quote === char) {
			if (quote === "'" && next === "'") {
				current += next;
				i++;
			} else if (sql[i - 1] !== "\\") {
				quote = null;
			}
			continue;
		}

		if (!quote && char === ";") {
			const statement = current.replace(/;+\s*$/, "").trim();
			if (statement) statements.push(statement);
			current = "";
		}
	}

	if (current.trim()) statements.push(current.trim());
	return statements;
};

const findKeywordOutsideQuotes = (text: string, keyword: string, startIndex = 0) => {
	let quote: "'" | '"' | "`" | null = null;
	const upperText = text.toUpperCase();
	const upperKeyword = keyword.toUpperCase();

	for (let i = startIndex; i < text.length; i++) {
		const char = text[i];
		const next = text[i + 1];

		if (!quote && (char === "'" || char === '"' || char === "`")) {
			quote = char;
			continue;
		}

		if (quote === char) {
			if (quote === "'" && next === "'") {
				i++;
			} else if (text[i - 1] !== "\\") {
				quote = null;
			}
			continue;
		}

		if (!quote && upperText.slice(i, i + upperKeyword.length) === upperKeyword) {
			const before = i === 0 ? " " : upperText[i - 1];
			const after = upperText[i + upperKeyword.length] ?? " ";
			if (!/[A-Z0-9_]/.test(before) && !/[A-Z0-9_]/.test(after)) return i;
		}
	}

	return -1;
};

const readParenthesized = (text: string, openIndex: number) => {
	let quote: "'" | '"' | "`" | null = null;
	let depth = 0;

	for (let i = openIndex; i < text.length; i++) {
		const char = text[i];
		const next = text[i + 1];

		if (!quote && (char === "'" || char === '"' || char === "`")) {
			quote = char;
			continue;
		}

		if (quote === char) {
			if (quote === "'" && next === "'") {
				i++;
			} else if (text[i - 1] !== "\\") {
				quote = null;
			}
			continue;
		}

		if (!quote && char === "(") depth++;
		if (!quote && char === ")") {
			depth--;
			if (depth === 0) {
				return {
					content: text.slice(openIndex + 1, i),
					endIndex: i + 1
				};
			}
		}
	}

	throw new Error("括号不完整，请检查 SQL 语句");
};

const splitCommaOutsideQuotes = (text: string) => {
	const parts: string[] = [];
	let current = "";
	let quote: "'" | '"' | "`" | null = null;
	let depth = 0;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const next = text[i + 1];

		if (!quote && (char === "'" || char === '"' || char === "`")) {
			quote = char;
			current += char;
			continue;
		}

		if (quote === char) {
			current += char;
			if (quote === "'" && next === "'") {
				current += next;
				i++;
			} else if (text[i - 1] !== "\\") {
				quote = null;
			}
			continue;
		}

		if (!quote && char === "(") depth++;
		if (!quote && char === ")") depth--;

		if (!quote && depth === 0 && char === ",") {
			parts.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	if (current.trim() || text.endsWith(",")) parts.push(current.trim());
	return parts;
};

const normalizeIdentifier = (identifier: string) => {
	const trimmed = identifier.trim();
	if (trimmed.startsWith("`") && trimmed.endsWith("`")) return trimmed.slice(1, -1).replace(/``/g, "`");
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) return trimmed.slice(1, -1);
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1).replace(/""/g, '"');
	return trimmed;
};

const parseSqlValue = (rawValue: string): SqlValue => {
	const value = rawValue.trim();
	if (/^null$/i.test(value)) return null;
	if (/^true$/i.test(value)) return true;
	if (/^false$/i.test(value)) return false;

	const stringMatch = value.match(/^N?(['"])([\s\S]*)\1$/i);
	if (stringMatch) {
		const quote = stringMatch[1];
		const body = stringMatch[2];
		return quote === "'" ? body.replace(/''/g, "'").replace(/\\'/g, "'") : body.replace(/\\"/g, '"');
	}

	if (/^[+-]?\d+(\.\d+)?$/.test(value)) return Number(value);
	return value;
};

const parseTupleValues = (valuesText: string) => {
	const tuples: SqlValue[][] = [];
	let index = 0;

	while (index < valuesText.length) {
		while (index < valuesText.length && /[\s,]/.test(valuesText[index])) index++;
		if (index >= valuesText.length) break;
		if (valuesText[index] !== "(") throw new Error("VALUES 后仅支持形如 (...), (...) 的数据");

		const tuple = readParenthesized(valuesText, index);
		tuples.push(splitCommaOutsideQuotes(tuple.content).map(parseSqlValue));
		index = tuple.endIndex;
	}

	return tuples;
};

const parseOneStatement = (statement: string): ParsedSqlTable => {
	const headerMatch = statement.match(/^\s*(INSERT|REPLACE)\s+INTO\s+/i);
	if (!headerMatch) throw new Error("仅支持 INSERT INTO 或 REPLACE INTO 语句");

	const statementType = headerMatch[1].toUpperCase() as "INSERT" | "REPLACE";
	let cursor = headerMatch[0].length;
	while (/\s/.test(statement[cursor] ?? "")) cursor++;

	const tableStart = cursor;
	let quote: "`" | '"' | "[" | null = null;
	for (; cursor < statement.length; cursor++) {
		const char = statement[cursor];
		if (!quote && char === "`") quote = "`";
		else if (!quote && char === '"') quote = '"';
		else if (!quote && char === "[") quote = "[";
		else if ((quote === "`" && char === "`") || (quote === '"' && char === '"') || (quote === "[" && char === "]")) quote = null;
		else if (!quote && (/\s/.test(char) || char === "(")) break;
	}

	const tableName = normalizeIdentifier(statement.slice(tableStart, cursor));
	if (!tableName) throw new Error("未识别到表名");

	while (/\s/.test(statement[cursor] ?? "")) cursor++;

	let columns: string[] = [];
	if (statement[cursor] === "(") {
		const columnGroup = readParenthesized(statement, cursor);
		columns = splitCommaOutsideQuotes(columnGroup.content).map(normalizeIdentifier).filter(Boolean);
		cursor = columnGroup.endIndex;
	}

	const valuesIndex = findKeywordOutsideQuotes(statement, "VALUES", cursor);
	if (valuesIndex < 0) throw new Error("未识别到 VALUES 片段");

	const tuples = parseTupleValues(statement.slice(valuesIndex + "VALUES".length));
	if (tuples.length === 0) throw new Error("未识别到任何数据行");

	const maxColumnCount = Math.max(columns.length, ...tuples.map(tuple => tuple.length));
	if (columns.length === 0) {
		columns = Array.from({ length: maxColumnCount }, (_, index) => `column_${index + 1}`);
	}

	const finalColumns = [...columns];
	for (let i = finalColumns.length; i < maxColumnCount; i++) {
		finalColumns.push(`column_${i + 1}`);
	}

	return {
		tableName,
		columns: finalColumns,
		statementType,
		rows: tuples.map((tuple, rowIndex) => {
			const row: Record<string, SqlValue> = { key: rowIndex + 1 };
			finalColumns.forEach((column, columnIndex) => {
				row[column] = tuple[columnIndex] ?? null;
			});
			return row;
		})
	};
};

const mergeParsedTables = (tables: ParsedSqlTable[]) => {
	if (tables.length === 0) throw new Error("未识别到可解析的 SQL 语句");

	const [first] = tables;
	const sameTable = tables.every(table => table.tableName === first.tableName);
	const sameColumns = tables.every(table => table.columns.join("\u0001") === first.columns.join("\u0001"));

	if (!sameTable || !sameColumns) return first;
	return {
		...first,
		rows: tables.flatMap(table => table.rows).map((row, index) => ({ ...row, key: index + 1 }))
	};
};

const parseSql = (sql: string) => {
	const statements = splitStatements(removeSqlComments(sql));
	const supportedStatements = statements.filter(statement => /^\s*(INSERT|REPLACE)\s+INTO\s+/i.test(statement));
	return mergeParsedTables(supportedStatements.map(parseOneStatement));
};

const stringifyCell = (value: SqlValue) => {
	if (value === null) return "null";
	if (typeof value === "boolean") return value ? "true" : "false";
	return String(value);
};

const downloadText = (content: string, filename: string, type: string) => {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

interface SqlToTableProps {
	onBack?: () => void;
}

// SQL 转表格工具
const SqlToTable: React.FC<SqlToTableProps> = ({ onBack }) => {
	const [sqlText, setSqlText] = useState(sampleSql);
	const [parsedTable, setParsedTable] = useState<ParsedSqlTable | null>(null);
	const [tableVersion, setTableVersion] = useState(0);

	const handleParse = () => {
		if (!sqlText.trim()) {
			message.warning("请输入 SQL");
			return;
		}

		try {
			const result = parseSql(sqlText);
			setParsedTable(result);
			setTableVersion(version => version + 1);
			message.success(`解析成功，共 ${result.rows.length} 行`);
		} catch (error) {
			setParsedTable(null);
			setTableVersion(version => version + 1);
			message.error(error instanceof Error ? error.message : "SQL 解析失败");
		}
	};

	const tableColumns: ColumnsType<Record<string, SqlValue>> = useMemo(() => {
		if (!parsedTable) return [];

		const indexColumn: ColumnsType<Record<string, SqlValue>>[number] = {
			title: "序号",
			key: "index",
			width: 72,
			fixed: "left",
			align: "center",
			render: (_value, _record, index) => index + 1
		};

		const dataColumns = parsedTable.columns.map(column => {
			const filterValues = Array.from(new Set(parsedTable.rows.map(row => stringifyCell(row[column])))).sort();

			return {
				title: column,
				dataIndex: column,
				key: column,
				ellipsis: true,
				filters: filterValues.slice(0, 200).map(value => ({ text: value, value })),
				filterSearch: true,
				onFilter: (value: React.Key | boolean, record: Record<string, SqlValue>) =>
					stringifyCell(record[column]) === String(value),
				render: (value: SqlValue) => <span className={value === null ? "sql-null-value" : undefined}>{stringifyCell(value)}</span>
			};
		});

		return [indexColumn, ...dataColumns];
	}, [parsedTable]);

	const handleExportCsv = () => {
		if (!parsedTable) return;
		const escapeCsv = (value: SqlValue) => `"${stringifyCell(value).replace(/"/g, '""')}"`;
		const header = ["序号", ...parsedTable.columns].map(value => `"${value}"`).join(",");
		const rows = parsedTable.rows.map((row, index) =>
			[String(index + 1), ...parsedTable.columns.map(column => escapeCsv(row[column]))].join(",")
		);
		downloadText([header, ...rows].join("\n"), `${parsedTable.tableName}.csv`, "text/csv;charset=utf-8");
	};

	const handleExportJson = () => {
		if (!parsedTable) return;
		const rows = parsedTable.rows.map(row => {
			const { key, ...data } = row;
			return data;
		});
		downloadText(JSON.stringify(rows, null, 2), `${parsedTable.tableName}.json`, "application/json;charset=utf-8");
	};

	return (
		<div className="sql-to-table-page">
			<Card
				title="SQL 转表格工具"
				extra={
					<Space>
						{onBack && (
							<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
								返回百宝箱
							</Button>
						)}
						{parsedTable && (
							<Tag color={parsedTable.statementType === "INSERT" ? "blue" : "purple"}>{parsedTable.statementType}</Tag>
						)}
						{parsedTable && <Tag color="green">{parsedTable.rows.length} 行</Tag>}
					</Space>
				}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Typography.Text type="secondary">
							支持 INSERT INTO / REPLACE INTO 语句，可解析字段、数据行并生成可筛选表格。
						</Typography.Text>
					</Col>
					<Col span={24}>
						<Input.TextArea
							value={sqlText}
							onChange={event => setSqlText(event.target.value)}
							placeholder="请输入 INSERT INTO 或 REPLACE INTO SQL"
							rows={10}
							allowClear
							className="sql-input"
						/>
					</Col>
					<Col span={24}>
						<Space wrap>
							<Button type="primary" icon={<PlayCircleOutlined />} onClick={handleParse}>
								解析 SQL
							</Button>
							<Button icon={<ReloadOutlined />} onClick={() => setSqlText(sampleSql)}>
								填入示例
							</Button>
							<Button onClick={() => setSqlText("")}>清空</Button>
							<Button icon={<DownloadOutlined />} disabled={!parsedTable} onClick={handleExportCsv}>
								导出 CSV
							</Button>
							<Button icon={<DownloadOutlined />} disabled={!parsedTable} onClick={handleExportJson}>
								导出 JSON
							</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{parsedTable && (
				<Card className="sql-result-card" title={parsedTable.tableName}>
					<Table
						key={tableVersion}
						rowKey="key"
						columns={tableColumns}
						dataSource={parsedTable.rows}
						scroll={{ x: "max-content" }}
						size="middle"
						pagination={{ showSizeChanger: true, defaultPageSize: 20, showTotal: total => `共 ${total} 行` }}
					/>
				</Card>
			)}
		</div>
	);
};

export default SqlToTable;
