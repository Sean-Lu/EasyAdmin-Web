import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Empty, Input, Row, Typography, message } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSearchParams } from "react-router-dom";
import { BackendId, BackendIdInput } from "@/api/interface";
import { FavoriteService, FavoriteTargetType } from "@/services/user/favoriteService";
import { UserPreferenceService } from "@/services/user/userPreferenceService";
import Crypto from "./tools/crypto";
import CronTester from "./tools/cronTester";
import JsonParser from "./tools/jsonParser";
import JsonToTable from "./tools/jsonToTable";
import JwtParser from "./tools/jwtParser";
import Lottery from "./tools/lottery";
import QrCode from "./tools/qrCode";
import RandomDecision from "./tools/randomDecision";
import RandomPassword from "./tools/randomPassword";
import RegexTester from "./tools/regexTester";
import SqlToTable from "./tools/sqlToTable";
import StockPortfolio from "./tools/stockPortfolio";
import Timestamp from "./tools/timestamp";
import UrlCodec from "./tools/urlCodec";
import WebSocketTester from "./tools/webSocketTester";
import DraggableToolCard from "./DraggableToolCard";
import {
	ToolItem,
	ToolKey,
	VALID_TOOL_KEYS,
	applyToolOrder,
	filterAndPrioritizeTools,
	reorderToolWithinGroup,
	tools
} from "./toolCatalog";
import "./index.less";

const CommonTools: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [orderedTools, setOrderedTools] = useState<ToolItem[]>(tools);
	const [favoriteMap, setFavoriteMap] = useState<Map<BackendId, BackendIdInput>>(new Map());
	const [savingOrder, setSavingOrder] = useState(false);
	const [loadingToolboxState, setLoadingToolboxState] = useState(true);
	const pageRef = useRef<HTMLDivElement>(null);
	const pendingDropScrollTopRef = useRef<number | null>(null);

	const toolParam = searchParams.get("tool");
	const activeTool: ToolKey | null = toolParam && VALID_TOOL_KEYS.has(toolParam) ? (toolParam as ToolKey) : null;
	const keyword = searchParams.get("q") ?? "";

	useLayoutEffect(() => {
		if (!activeTool) return;
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
		document.querySelectorAll<HTMLElement>(".ant-layout-content").forEach(container => {
			container.scrollTop = 0;
		});
	}, [activeTool]);

	useLayoutEffect(() => {
		const scrollTop = pendingDropScrollTopRef.current;
		if (scrollTop === null) return;
		const scrollContainer = pageRef.current?.closest<HTMLElement>(".ant-layout-content");
		if (scrollContainer) scrollContainer.scrollTop = scrollTop;
		pendingDropScrollTopRef.current = null;
	}, [orderedTools]);

	useEffect(() => {
		const loadOrder = async () => {
			try {
				const result = await UserPreferenceService.getToolboxToolOrder();
				setOrderedTools(applyToolOrder(result?.toolIds));
			} catch {
				setOrderedTools(tools);
			}
		};
		const loadFavorites = async () => {
			try {
				const statuses = await FavoriteService.status(
					tools.map(tool => ({ targetType: FavoriteTargetType.Tool, targetId: tool.id }))
				);
				setFavoriteMap(
					new Map(
						(statuses ?? [])
							.filter(status => status.isFavorite && status.favoriteId)
							.map(status => [status.targetId as BackendId, status.favoriteId!])
					)
				);
			} catch {
				setFavoriteMap(new Map());
			}
		};
		void Promise.all([loadOrder(), loadFavorites()]).finally(() => setLoadingToolboxState(false));
	}, []);

	const favoriteIds = useMemo(() => new Set(favoriteMap.keys()), [favoriteMap]);
	const filteredTools = useMemo(
		() => filterAndPrioritizeTools(keyword, favoriteIds, orderedTools),
		[favoriteIds, keyword, orderedTools]
	);
	const dragDisabled = loadingToolboxState || Boolean(keyword.trim()) || savingOrder;

	const handleFavoriteChange = useCallback((toolId: BackendId, favoriteId?: BackendIdInput) => {
		setFavoriteMap(current => {
			const next = new Map(current);
			if (favoriteId) next.set(toolId, favoriteId);
			else next.delete(toolId);
			return next;
		});
	}, []);

	const handleDrop = useCallback(
		async (draggedId: BackendId, targetId: BackendId) => {
			if (dragDisabled) return;
			const previous = orderedTools;
			const next = reorderToolWithinGroup(previous, favoriteIds, draggedId, targetId);
			if (!next) return;
			const scrollContainer = pageRef.current?.closest<HTMLElement>(".ant-layout-content");
			pendingDropScrollTopRef.current = scrollContainer?.scrollTop ?? null;
			setOrderedTools(next);
			setSavingOrder(true);
			try {
				const saved = await UserPreferenceService.updateToolboxToolOrder(next.map(tool => tool.id));
				setOrderedTools(applyToolOrder(saved.toolIds));
				message.success("排序已保存");
			} catch {
				setOrderedTools(previous);
			} finally {
				setSavingOrder(false);
			}
		},
		[dragDisabled, favoriteIds, orderedTools]
	);

	if (activeTool === "sqlToTable") return <SqlToTable onBack={() => setSearchParams({})} />;
	if (activeTool === "urlCodec") return <UrlCodec onBack={() => setSearchParams({})} />;
	if (activeTool === "jsonToTable") return <JsonToTable onBack={() => setSearchParams({})} />;
	if (activeTool === "jsonParser") return <JsonParser onBack={() => setSearchParams({})} />;
	if (activeTool === "qrCode") return <QrCode onBack={() => setSearchParams({})} />;
	if (activeTool === "randomDecision") return <RandomDecision onBack={() => setSearchParams({})} />;
	if (activeTool === "randomPassword") return <RandomPassword onBack={() => setSearchParams({})} />;
	if (activeTool === "jwtParser") return <JwtParser onBack={() => setSearchParams({})} />;
	if (activeTool === "webSocketTester") return <WebSocketTester onBack={() => setSearchParams({})} />;
	if (activeTool === "lottery") return <Lottery onBack={() => setSearchParams({})} />;
	if (activeTool === "stockPortfolio") return <StockPortfolio onBack={() => setSearchParams({})} />;
	if (activeTool === "timestamp") return <Timestamp onBack={() => setSearchParams({})} />;
	if (activeTool === "crypto") return <Crypto onBack={() => setSearchParams({})} />;
	if (activeTool === "regexTester") return <RegexTester onBack={() => setSearchParams({})} />;
	if (activeTool === "cronTester") return <CronTester onBack={() => setSearchParams({})} />;

	return (
		<DndProvider backend={HTML5Backend}>
			<div ref={pageRef} className="common-tools-page">
				<div className="common-tools-header">
					<div>
						<Typography.Title level={2}>百宝箱</Typography.Title>
						<Typography.Text type="secondary">Toolbox</Typography.Text>
					</div>
					<div className="tool-search-wrap">
						<Input
							allowClear
							prefix={<SearchOutlined />}
							placeholder="搜索工具名称"
							value={keyword}
							onChange={event => {
								const value = event.target.value;
								setSearchParams(value ? { q: value } : {});
							}}
							className="tool-search"
						/>
						{keyword.trim() && <Typography.Text type="warning">清空搜索后可调整排序</Typography.Text>}
						{!keyword.trim() && savingOrder && <Typography.Text type="secondary">正在保存排序...</Typography.Text>}
					</div>
				</div>

				{filteredTools.length > 0 ? (
					<Row gutter={[24, 24]}>
						{filteredTools.map(tool => (
							<DraggableToolCard
								key={tool.key}
								tool={tool}
								isFavorite={favoriteIds.has(tool.id)}
								favoriteId={favoriteMap.get(tool.id)}
								favoriteDisabled={loadingToolboxState}
								dragDisabled={dragDisabled}
								onFavoriteChange={handleFavoriteChange}
								onOpen={item => setSearchParams({ tool: item.key })}
								onDrop={handleDrop}
							/>
						))}
					</Row>
				) : (
					<Empty description="未找到匹配的工具" />
				)}
			</div>
		</DndProvider>
	);
};

export default CommonTools;
