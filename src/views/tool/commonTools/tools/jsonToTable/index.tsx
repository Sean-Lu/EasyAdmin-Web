import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined, DownloadOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Popover, Row, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import "./index.less";

type TableRow = Record<string, unknown>;

interface JsonToTableProps {
	onBack?: () => void;
}

const TRANSFER_KEY = "__jsonParser_transfer__";

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

const isPrimitive = (value: unknown): value is string | number | boolean | null =>
	value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";

const isPrimitiveArray = (value: unknown): value is Array<string | number | boolean | null> =>
	Array.isArray(value) && value.length > 0 && value.every(item => isPrimitive(item));

const isObject = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === "object" && !Array.isArray(value);

const isObjectArray = (value: unknown): value is Array<Record<string, unknown>> =>
	Array.isArray(value) && value.length > 0 && value.every(item => isObject(item));

const stringifyCell = (value: unknown) => {
	if (value === null) return "null";
	if (value === undefined) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (isObjectArray(value)) return `${value.length} items`;
	if (isObject(value)) return "对象";
	return String(value);
};

const flattenObject = (value: unknown, prefix = "", result: TableRow = {}) => {
	if (isPrimitive(value)) {
		result[prefix || "value"] = value;
		return result;
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			result[prefix || "value"] = "[]";
		} else if (isPrimitiveArray(value)) {
			result[prefix || "value"] = value.join(", ");
		} else {
			result[prefix || "value"] = value;
		}
		return result;
	}

	if (isObject(value)) {
		if (prefix) {
			result[prefix] = value;
		} else {
			Object.entries(value).forEach(([key, item]) => {
				flattenObject(item, key, result);
			});
		}
		return result;
	}

	result[prefix || "value"] = String(value);
	return result;
};

const extractRows = (data: unknown) => {
	if (Array.isArray(data)) return data;

	if (data && typeof data === "object") {
		const entries = Object.entries(data as Record<string, unknown>);
		// 只有一个字段且该字段是数组时，认为对象是对数组的包装
		if (entries.length === 1 && Array.isArray(entries[0][1])) {
			return entries[0][1] as unknown[];
		}
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

const SubTable: React.FC<{ data: Array<Record<string, unknown>> }> = ({ data }) => {
	const subRows = useMemo<TableRow[]>(() => data.map(row => flattenObject(row)), [data]);
	const keys = useMemo(() => Array.from(new Set(subRows.flatMap(row => Object.keys(row)))), [subRows]);

	const subColumns: ColumnsType<TableRow> = useMemo(() => {
		const indexColumn: ColumnsType<TableRow>[number] = {
			title: "序号",
			key: "index",
			width: 60,
			fixed: "left",
			align: "center",
			render: (_value, _record, index) => index + 1
		};

		return [
			indexColumn,
			...keys.map(key => {
				const filterValues = Array.from(new Set(subRows.map(row => stringifyCell(row[key])))).sort();

				return {
					title: key,
					dataIndex: key,
					key,
					ellipsis: true,
					filters: filterValues.slice(0, 200).map(value => ({ text: value, value })),
					filterSearch: true,
					onFilter: (value: React.Key | boolean, record: TableRow) => stringifyCell(record[key]) === String(value),
					render: (_value: unknown, record: TableRow) => renderCell(record[key])
				};
			})
		];
	}, [keys, subRows]);

	return (
		<Table
			rowKey={(_record, index) => `sub-${index}`}
			columns={subColumns}
			dataSource={subRows}
			size="small"
			pagination={{ showSizeChanger: true, defaultPageSize: 20, showTotal: total => `共 ${total} 行` }}
			scroll={{ x: "max-content" }}
		/>
	);
};

const renderCell = (value: unknown) => {
	if (isObjectArray(value)) {
		return (
			<Popover content={<SubTable data={value} />} title={`共 ${value.length} 条`} trigger="click" placement="bottom">
				<Button type="link" size="small">
					{value.length} items
				</Button>
			</Popover>
		);
	}
	if (isObject(value)) {
		return (
			<Popover content={<SubTable data={[value]} />} title="对象" trigger="click" placement="bottom">
				<Button type="link" size="small">
					查看
				</Button>
			</Popover>
		);
	}
	return <span className={value === null ? "json-null-value" : undefined}>{stringifyCell(value)}</span>;
};

// JSON 转表格工具
const JsonToTable: React.FC<JsonToTableProps> = ({ onBack }) => {
	const [jsonText, setJsonText] = useState("");

	useEffect(() => {
		const transfer = sessionStorage.getItem(TRANSFER_KEY);
		if (transfer) {
			setJsonText(transfer);
			sessionStorage.removeItem(TRANSFER_KEY);
		}
	}, []);
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

			setRows(nextRows);
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
					render: (_value: unknown, record: TableRow) => renderCell(record[column])
				};
			})
		];
	}, [columns, rows]);

	const handleExportCsv = () => {
		const escapeCsv = (value: unknown) => `"${stringifyCell(value).replace(/"/g, '""')}"`;
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
						<Typography.Text type="secondary">
							支持 JSON 数组、对象数组字段、单个对象；基本类型数组合并为一列，嵌套对象和对象数组可点击展开查看子表格。
						</Typography.Text>
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
						rowKey={(_record, index) => `row-${index}`}
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
