import React from "react";
import {
	ApiOutlined,
	BarChartOutlined,
	ClockCircleOutlined,
	CodeOutlined,
	CompassOutlined,
	FileTextOutlined,
	FundProjectionScreenOutlined,
	FieldTimeOutlined,
	GiftOutlined,
	HourglassOutlined,
	LinkOutlined,
	LockOutlined,
	QrcodeOutlined,
	SafetyCertificateOutlined
} from "@ant-design/icons";
import { BackendId } from "@/api/interface";

export type ToolKey =
	| "sqlToTable"
	| "jsonToTable"
	| "jsonParser"
	| "urlCodec"
	| "qrCode"
	| "randomDecision"
	| "randomPassword"
	| "jwtParser"
	| "webSocketTester"
	| "lottery"
	| "stockPortfolio"
	| "timestamp"
	| "crypto"
	| "regexTester"
	| "cronTester"
	| "timer"
	| "countdown"
	| "flipClock";

export interface ToolItem {
	id: BackendId;
	key: ToolKey;
	title: string;
	description: string;
	tag: string;
	icon: React.ReactNode;
}

export const tools: ToolItem[] = [
	{
		id: "1",
		key: "sqlToTable",
		title: "SQL 转表格",
		description: "INSERT / REPLACE 转可筛选表格",
		tag: "developer_tools",
		icon: <BarChartOutlined />
	},
	{
		id: "2",
		key: "jsonToTable",
		title: "JSON 转表格",
		description: "JSON 数组转可筛选表格",
		tag: "developer_tools",
		icon: <CodeOutlined />
	},
	{
		id: "3",
		key: "jsonParser",
		title: "JSON 解析工具",
		description: "格式化、压缩、折叠、校验 JSON",
		tag: "developer_tools",
		icon: <FileTextOutlined />
	},
	{
		id: "4",
		key: "urlCodec",
		title: "URL 编码/解码",
		description: "URL 与中文路径互转",
		tag: "developer_tools",
		icon: <LinkOutlined />
	},
	{
		id: "5",
		key: "qrCode",
		title: "二维码工具",
		description: "二维码生成/解析",
		tag: "image_tools",
		icon: <QrcodeOutlined />
	},
	{
		id: "6",
		key: "randomDecision",
		title: "随机决策器",
		description: "吃什么/去哪玩",
		tag: "life_tools",
		icon: <CompassOutlined />
	},
	{
		id: "7",
		key: "randomPassword",
		title: "随机密码",
		description: "安全生成可配置的随机密码",
		tag: "developer_tools",
		icon: <LockOutlined />
	},
	{
		id: "8",
		key: "jwtParser",
		title: "JWT 解析",
		description: "解析并格式化 JWT 内容",
		tag: "developer_tools",
		icon: <SafetyCertificateOutlined />
	},
	{
		id: "9",
		key: "webSocketTester",
		title: "WebSocket 测试",
		description: "在线调试 WebSocket 消息",
		tag: "developer_tools",
		icon: <ApiOutlined />
	},
	{
		id: "10",
		key: "lottery",
		title: "抽奖工具",
		description: "活动奖项与现场抽奖",
		tag: "life_tools",
		icon: <GiftOutlined />
	},
	{
		id: "11",
		key: "stockPortfolio",
		title: "股票持仓管理",
		description: "记录持仓并统计盈亏",
		tag: "finance_tools",
		icon: <FundProjectionScreenOutlined />
	},
	{
		id: "12",
		key: "timestamp",
		title: "时间戳转换",
		description: "秒/毫秒时间戳与时间互转",
		tag: "developer_tools",
		icon: <ClockCircleOutlined />
	},
	{
		id: "13",
		key: "crypto",
		title: "加解密工具",
		description: "MD5/Base64/AES/DES/RSA 等",
		tag: "developer_tools",
		icon: <LockOutlined />
	},
	{
		id: "14",
		key: "regexTester",
		title: "正则表达式测试",
		description: "测试匹配结果与捕获组",
		tag: "developer_tools",
		icon: <CodeOutlined />
	},
	{
		id: "15",
		key: "cronTester",
		title: "Cron 表达式测试",
		description: "校验 Quartz 表达式并预览执行时间",
		tag: "developer_tools",
		icon: <ClockCircleOutlined />
	},
	{
		id: "16",
		key: "timer",
		title: "计时器",
		description: "记录一段经过的时间",
		tag: "life_tools",
		icon: <ClockCircleOutlined />
	},
	{
		id: "17",
		key: "countdown",
		title: "倒计时",
		description: "设置时间并在结束时提醒",
		tag: "life_tools",
		icon: <HourglassOutlined />
	},
	{
		id: "18",
		key: "flipClock",
		title: "翻页时钟",
		description: "专注展示当前时间与屏保式时钟",
		tag: "life_tools",
		icon: <FieldTimeOutlined />
	}
];

export const VALID_TOOL_KEYS: ReadonlySet<string> = new Set(tools.map(tool => tool.key));

export function applyToolOrder(toolIds: BackendId[] | undefined): ToolItem[] {
	const toolMap = new Map(tools.map(tool => [tool.id, tool]));
	const result: ToolItem[] = [];
	const added = new Set<BackendId>();
	for (const id of toolIds ?? []) {
		const tool = toolMap.get(id);
		if (tool && !added.has(id)) {
			result.push(tool);
			added.add(id);
		}
	}
	result.push(...tools.filter(tool => !added.has(tool.id)));
	return result;
}

export function filterAndPrioritizeTools(
	keyword: string,
	favoriteIds: ReadonlySet<BackendId>,
	orderedTools: ToolItem[] = tools
): ToolItem[] {
	const normalizedKeyword = keyword.trim().toLowerCase();
	const filtered = normalizedKeyword
		? orderedTools.filter(tool => `${tool.title} ${tool.description}`.toLowerCase().includes(normalizedKeyword))
		: orderedTools;
	return [...filtered.filter(tool => favoriteIds.has(tool.id)), ...filtered.filter(tool => !favoriteIds.has(tool.id))];
}

export function reorderToolWithinGroup(
	orderedTools: ToolItem[],
	favoriteIds: ReadonlySet<BackendId>,
	draggedId: BackendId,
	targetId: BackendId
): ToolItem[] | null {
	const draggedIndex = orderedTools.findIndex(tool => tool.id === draggedId);
	const targetIndex = orderedTools.findIndex(tool => tool.id === targetId);
	if (draggedIndex < 0 || targetIndex < 0 || favoriteIds.has(draggedId) !== favoriteIds.has(targetId)) {
		return null;
	}

	const isFavoriteGroup = favoriteIds.has(draggedId);
	const groupIndexes = orderedTools
		.map((tool, index) => (favoriteIds.has(tool.id) === isFavoriteGroup ? index : -1))
		.filter(index => index >= 0);
	const groupTools = groupIndexes.map(index => orderedTools[index]);
	const draggedGroupIndex = groupTools.findIndex(tool => tool.id === draggedId);
	const targetGroupIndex = groupTools.findIndex(tool => tool.id === targetId);
	const [draggedTool] = groupTools.splice(draggedGroupIndex, 1);
	groupTools.splice(targetGroupIndex, 0, draggedTool);

	const result = [...orderedTools];
	groupIndexes.forEach((index, groupIndex) => {
		result[index] = groupTools[groupIndex];
	});
	return result;
}
