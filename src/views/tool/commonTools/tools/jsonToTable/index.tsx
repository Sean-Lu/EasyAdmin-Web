import React, { useMemo, useState } from "react";
import { ArrowLeftOutlined, DownloadOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./index.less";

type JsonValue = string | number | boolean | null;
type TableRow = Record<string, JsonValue>;

interface JsonToTableProps {
	onBack?: () => void;
}

const sampleJson = `[
  {
    "id": 1,
    "name": "EasyAdmin",
    "category": "tool",
    "enabled": true
  },
  {
    "id": 2,
    "name": "百宝箱",
    "category": "tool",
    "enabled": true
  }
]`;

const stringifyCell = (value: JsonValue) => {
	if (value === null) return "null";
	if (typeof value === "boolean") return value ? "true" : "false";
	return String(value);
};

const toCellValue = (value: unknown): JsonValue => {
	if (value === null || value === undefined) return null;
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	return JSON.stringify(value);
};

const flattenObject = (value: unknown, prefix = "", result: TableRow = {}) => {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		result[prefix || "value"] = toCellValue(value);
		return result;
	}

	Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
		const columnKey = prefix ? `${prefix}.${key}` : key;
		if (item && typeof item === "object" && !Array.isArray(item)) {
			flattenObject(item, columnKey, result);
		} else {
			result[columnKey] = toCellValue(item);
		}
	});

	return result;
};

const extractRows = (data: unknown) => {
	if (Array.isArray(data)) return data;

	if (data && typeof data === "object") {
		const entries = Object.entries(data as Record<string, unknown>);
		const arrayEntry = entries.find(([, value]) => Array.isArray(value));
		if (arrayEntry) return arrayEntry[1] as unknown[];
		return [data];
	}

	return [{ value: data }];
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

// JSON 转表格工具
const JsonToTable: React.FC<JsonToTableProps> = ({ onBack }) => {
	const [jsonText, setJsonText] = useState(sampleJson);
	const [rows, setRows] = useState<TableRow[]>([]);
	const [columns, setColumns] = useState<string[]>([]);
	const [tableVersion, setTableVersion] = useState(0);

	const handleParse = () => {
		if (!jsonText.trim()) {
			message.warning("请输入 JSON");
			return;
		}

		try {
			const parsed = JSON.parse(jsonText);
			const nextRows = extractRows(parsed).map(item => flattenObject(item));
			const nextColumns = Array.from(new Set(nextRows.flatMap(row => Object.keys(row))));

			setRows(nextRows.map((row, index) => ({ ...row, key: index + 1 })));
			setColumns(nextColumns);
			setTableVersion(version => version + 1);
			message.success(`解析成功，共 ${nextRows.length} 行`);
		} catch (error) {
			setRows([]);
			setColumns([]);
			setTableVersion(version => version + 1);
			message.error("JSON 解析失败，请检查格式是否正确");
		}
	};

	const tableColumns: ColumnsType<TableRow> = useMemo(() => {
		const indexColumn: ColumnsType<TableRow>[number] = {
			title: "序号",
			key: "index",
			width: 72,
			fixed: "left",
			align: "center",
			render: (_value, _record, index) => index + 1
		};

		return [
			indexColumn,
			...columns.map(column => {
				const filterValues = Array.from(new Set(rows.map(row => stringifyCell(row[column])))).sort();

				return {
					title: column,
					dataIndex: column,
					key: column,
					ellipsis: true,
					filters: filterValues.slice(0, 200).map(value => ({ text: value, value })),
					filterSearch: true,
					onFilter: (value: React.Key | boolean, record: TableRow) => stringifyCell(record[column]) === String(value),
					render: (value: JsonValue) => (
						<span className={value === null ? "json-null-value" : undefined}>{stringifyCell(value)}</span>
					)
				};
			})
		];
	}, [columns, rows]);

	const handleExportCsv = () => {
		const escapeCsv = (value: JsonValue) => `"${stringifyCell(value).replace(/"/g, '""')}"`;
		const header = ["序号", ...columns].map(value => `"${value}"`).join(",");
		const csvRows = rows.map((row, index) => [String(index + 1), ...columns.map(column => escapeCsv(row[column]))].join(","));
		downloadText([header, ...csvRows].join("\n"), "json-table.csv", "text/csv;charset=utf-8");
	};

	return (
		<div className="json-to-table-page">
			<Card
				title="JSON 转表格"
				extra={
					<Space>
						{onBack && (
							<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
								返回百宝箱
							</Button>
						)}
						{rows.length > 0 && <Tag color="green">{rows.length} 行</Tag>}
					</Space>
				}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Typography.Text type="secondary">支持 JSON 数组、对象数组字段、单个对象，并自动展开嵌套对象字段。</Typography.Text>
					</Col>
					<Col span={24}>
						<Input.TextArea
							value={jsonText}
							onChange={event => setJsonText(event.target.value)}
							placeholder="请输入 JSON"
							rows={10}
							allowClear
							className="json-input"
						/>
					</Col>
					<Col span={24}>
						<Space wrap>
							<Button type="primary" icon={<PlayCircleOutlined />} onClick={handleParse}>
								解析 JSON
							</Button>
							<Button icon={<ReloadOutlined />} onClick={() => setJsonText(sampleJson)}>
								填入示例
							</Button>
							<Button onClick={() => setJsonText("")}>清空</Button>
							<Button icon={<DownloadOutlined />} disabled={rows.length === 0} onClick={handleExportCsv}>
								导出 CSV
							</Button>
						</Space>
					</Col>
				</Row>
			</Card>

			{rows.length > 0 && (
				<Card className="json-result-card" title="解析结果">
					<Table
						key={tableVersion}
						rowKey="key"
						columns={tableColumns}
						dataSource={rows}
						scroll={{ x: "max-content" }}
						size="middle"
						pagination={{ showSizeChanger: true, defaultPageSize: 20, showTotal: total => `共 ${total} 行` }}
					/>
				</Card>
			)}
		</div>
	);
};

export default JsonToTable;
