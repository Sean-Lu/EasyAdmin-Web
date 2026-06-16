import React, { useMemo } from "react";
import { Card, Checkbox, Table, Input } from "antd";
import { SearchOutlined, TableOutlined } from "@ant-design/icons";
import { BackendId } from "@/api/interface";
import { DbTableInfoDto } from "@/services/tool/codeGenService";

const { Search } = Input;

interface DbTablePanelProps {
	dbTables: DbTableInfoDto[];
	selectedTables: string[];
	selectedDbConfig: BackendId | null;
	tableSearchText: string;
	onSearchChange: (text: string) => void;
	onSelectAll: () => void;
	onSelectTable: (tableName: string, checked: boolean) => void;
}

/**
 * 数据库表面板
 */
const DbTablePanel: React.FC<DbTablePanelProps> = ({
	dbTables,
	selectedTables,
	selectedDbConfig,
	tableSearchText,
	onSearchChange,
	onSelectAll,
	onSelectTable
}) => {
	const filteredTables = useMemo(() => {
		if (!tableSearchText) return dbTables;
		const search = tableSearchText.toLowerCase();
		return dbTables.filter(
			t => t.tableName.toLowerCase().includes(search) || (t.tableComment && t.tableComment.toLowerCase().includes(search))
		);
	}, [dbTables, tableSearchText]);

	const isAllSelected = filteredTables.length > 0 && filteredTables.every(t => selectedTables.includes(t.tableName));

	const columns = [
		{
			title: "选择",
			dataIndex: "selected",
			key: "selected",
			width: 50,
			render: (_: any, record: DbTableInfoDto) => (
				<Checkbox
					checked={selectedTables.includes(record.tableName)}
					onChange={e => onSelectTable(record.tableName, e.target.checked)}
				/>
			)
		},
		{ title: "表名", dataIndex: "tableName", key: "tableName", width: 150 },
		{ title: "表注释", dataIndex: "tableComment", key: "tableComment" }
	];

	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<TableOutlined style={{ fontSize: 16 }} />
					<span>数据表</span>
				</div>
			}
			bordered
			style={{ borderRadius: 8 }}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<Checkbox checked={isAllSelected} onChange={onSelectAll} />
					<span style={{ marginLeft: 8, fontSize: 13 }}>{isAllSelected ? "取消全选" : "全选"}</span>
					<span style={{ marginLeft: 16, fontSize: 12, color: "#999" }}>已选择 {selectedTables.length} 个表</span>
				</div>
				<Search
					placeholder="搜索数据表"
					allowClear
					enterButton={<SearchOutlined />}
					size="small"
					value={tableSearchText}
					onChange={e => onSearchChange(e.target.value)}
					style={{ width: 220 }}
				/>
			</div>
			{selectedDbConfig ? (
				<Table
					dataSource={filteredTables}
					columns={columns}
					rowKey="tableName"
					pagination={{ pageSize: 5 }}
					bordered={false}
					size="small"
				/>
			) : (
				<div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
					<TableOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
					<p style={{ marginBottom: 8 }}>请先选择数据库配置</p>
					<p style={{ fontSize: 12 }}>选择后将显示该数据库中的所有数据表</p>
				</div>
			)}
		</Card>
	);
};

export default DbTablePanel;
