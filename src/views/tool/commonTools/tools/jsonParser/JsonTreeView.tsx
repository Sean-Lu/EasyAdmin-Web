import React from "react";

interface JsonTreeViewProps {
	data: unknown;
	expandedPaths: Set<string>;
	onToggle: (path: string) => void;
}

interface TreeNodeProps {
	name: string;
	value: unknown;
	path: string;
	depth: number;
	isArrayItem?: boolean;
	expandedPaths: Set<string>;
	onToggle: (path: string) => void;
}

const isExpandable = (value: unknown): value is Record<string, unknown> | unknown[] =>
	value !== null && typeof value === "object";

const collectExpandablePaths = (value: unknown, path: string, depth: number, maxDepth: number, result: Set<string>) => {
	if (!isExpandable(value) || depth > maxDepth) return;
	result.add(path);
	if (Array.isArray(value)) {
		value.forEach((item, index) => collectExpandablePaths(item, `${path}[${index}]`, depth + 1, maxDepth, result));
	} else {
		Object.entries(value).forEach(([key, item]) => collectExpandablePaths(item, `${path}.${key}`, depth + 1, maxDepth, result));
	}
};

const collectAllPaths = (value: unknown, path: string, result: Set<string>) => {
	if (!isExpandable(value)) return;
	result.add(path);
	if (Array.isArray(value)) {
		value.forEach((item, index) => collectAllPaths(item, `${path}[${index}]`, result));
	} else {
		Object.entries(value).forEach(([key, item]) => collectAllPaths(item, `${path}.${key}`, result));
	}
};

const KeyName: React.FC<{ name: string }> = ({ name }) => {
	if (!name) return null;
	const display = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(name) ? name : JSON.stringify(name);
	return <span className="json-tree-key">{display}</span>;
};

const PrimitiveValue: React.FC<{ value: unknown }> = ({ value }) => {
	if (value === null) return <span className="json-tree-null">null</span>;
	if (typeof value === "string") return <span className="json-tree-string">{JSON.stringify(value)}</span>;
	if (typeof value === "number") return <span className="json-tree-number">{String(value)}</span>;
	if (typeof value === "boolean") return <span className="json-tree-boolean">{String(value)}</span>;
	return <span className="json-tree-string">{JSON.stringify(value)}</span>;
};

const TreeNode: React.FC<TreeNodeProps> = ({ name, value, path, depth, isArrayItem = false, expandedPaths, onToggle }) => {
	const expandable = isExpandable(value);
	const expanded = expandedPaths.has(path);
	const keyNode = isArrayItem ? null : <KeyName name={name} />;

	if (!expandable) {
		return (
			<div className="json-tree-line" style={{ paddingLeft: depth * 16 }}>
				{keyNode && (
					<>
						{keyNode}
						<span className="json-tree-colon">: </span>
					</>
				)}
				<PrimitiveValue value={value} />
				<span className="json-tree-comma">,</span>
			</div>
		);
	}

	const isArray = Array.isArray(value);
	const entries = isArray
		? (value as unknown[]).map((item, index) => [String(index), item] as const)
		: Object.entries(value as Record<string, unknown>);

	return (
		<div className="json-tree-node">
			<div className="json-tree-line" style={{ paddingLeft: depth * 16 }}>
				<span className="json-tree-toggle" onClick={() => onToggle(path)}>
					{expanded ? "▼" : "▶"}
				</span>
				{keyNode && (
					<>
						{keyNode}
						<span className="json-tree-colon">: </span>
					</>
				)}
				<span className="json-tree-bracket">{isArray ? "[" : "{"}</span>
				{!expanded && (
					<span className="json-tree-preview" onClick={() => onToggle(path)}>
						{isArray ? `...${entries.length} items` : `...${entries.length} keys`}
					</span>
				)}
				{!expanded && <span className="json-tree-bracket">{isArray ? "]" : "}"}</span>}
				{expanded && entries.length > 0 && <span className="json-tree-comma">,</span>}
			</div>
			{expanded && (
				<div className="json-tree-children">
					{entries.map(([key, item]) => (
						<TreeNode
							key={key}
							name={key}
							value={item}
							path={isArray ? `${path}[${key}]` : `${path}.${key}`}
							depth={depth + 1}
							isArrayItem={isArray}
							expandedPaths={expandedPaths}
							onToggle={onToggle}
						/>
					))}
				</div>
			)}
			{expanded && (
				<div className="json-tree-line" style={{ paddingLeft: depth * 16 }}>
					<span className="json-tree-bracket">{isArray ? "]" : "}"}</span>
					<span className="json-tree-comma">,</span>
				</div>
			)}
		</div>
	);
};

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, expandedPaths, onToggle }) => {
	return (
		<div className="json-tree-view">
			<TreeNode name="" value={data} path="$" depth={0} expandedPaths={expandedPaths} onToggle={onToggle} />
		</div>
	);
};

export const expandAll = (data: unknown) => {
	const paths = new Set<string>();
	collectAllPaths(data, "$", paths);
	return paths;
};

export const collapseAll = () => new Set<string>();

export const expandToDepth = (data: unknown, depth: number) => {
	const paths = new Set<string>();
	collectExpandablePaths(data, "$", 0, depth, paths);
	return paths;
};

export default JsonTreeView;
