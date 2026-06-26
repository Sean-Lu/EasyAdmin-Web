import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ArrowLeftOutlined,
	ClearOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	ReloadOutlined,
	ThunderboltOutlined
} from "@ant-design/icons";
import {
	Button,
	Col,
	Empty,
	Form,
	Input,
	InputNumber,
	List,
	Modal,
	Popconfirm,
	Row,
	Space,
	Switch,
	Tabs,
	Tag,
	Typography,
	message
} from "antd";
import { useSelector } from "react-redux";
import { BackendIdInput } from "@/api/interface";
import { CommonState, DecisionItem, DecisionItemService, DecisionItemType } from "@/services/tool/decisionItemService";
import "./index.less";

interface RandomDecisionProps {
	onBack?: () => void;
}

interface DecisionFormValues {
	name: string;
	description?: string;
	sort?: number;
	state?: CommonState;
}

const decisionConfigs: Record<
	DecisionItemType,
	{
		tab: string;
		title: string;
		itemName: string;
		addText: string;
		drawText: string;
		emptyText: string;
		resultTitle: string;
	}
> = {
	[DecisionItemType.Food]: {
		tab: "吃什么",
		title: "菜单维护",
		itemName: "菜单",
		addText: "新增菜单",
		drawText: "随机吃什么",
		emptyText: "暂无菜单",
		resultTitle: "今日备选"
	},
	[DecisionItemType.Place]: {
		tab: "去哪玩",
		title: "地点维护",
		itemName: "地点",
		addText: "新增地点",
		drawText: "随机去哪玩",
		emptyText: "暂无地点",
		resultTitle: "出行备选"
	}
};

const defaultFormValues: DecisionFormValues = {
	name: "",
	description: "",
	sort: 0,
	state: CommonState.Enable
};

// 随机决策器
const RandomDecision: React.FC<RandomDecisionProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [activeType, setActiveType] = useState<DecisionItemType>(DecisionItemType.Food);
	const [items, setItems] = useState<DecisionItem[]>([]);
	const [drawResults, setDrawResults] = useState<DecisionItem[]>([]);
	const [drawCount, setDrawCount] = useState(1);
	const [loading, setLoading] = useState(false);
	const [drawing, setDrawing] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editingItem, setEditingItem] = useState<DecisionItem | null>(null);
	const [form] = Form.useForm<DecisionFormValues>();

	const config = decisionConfigs[activeType];
	const activeCount = useMemo(() => items.filter(item => item.state === CommonState.Enable).length, [items]);
	const maxDrawCount = Math.max(activeCount, 1);

	const fetchItems = useCallback(async () => {
		setLoading(true);
		try {
			const response = await DecisionItemService.getList(activeType);
			if (response.success) {
				setItems(response.data || []);
			}
		} finally {
			setLoading(false);
		}
	}, [activeType]);

	useEffect(() => {
		setDrawResults([]);
		setDrawCount(1);
		fetchItems();
	}, [fetchItems]);

	const openCreateModal = () => {
		setEditingItem(null);
		form.setFieldsValue(defaultFormValues);
		setModalOpen(true);
	};

	const openEditModal = (item: DecisionItem) => {
		setEditingItem(item);
		form.setFieldsValue({
			name: item.name,
			description: item.description,
			sort: item.sort,
			state: item.state
		});
		setModalOpen(true);
	};

	const handleSave = async () => {
		const values = await form.validateFields();
		setSaving(true);
		try {
			const payload: DecisionItem = {
				type: activeType,
				name: values.name.trim(),
				description: values.description?.trim() || "",
				sort: values.sort ?? 0,
				state: values.state ?? CommonState.Enable
			};

			const response =
				editingItem?.id !== undefined
					? await DecisionItemService.update({ ...payload, id: editingItem.id })
					: await DecisionItemService.add(payload);

			if (response.success) {
				message.success(editingItem ? "已更新" : "已新增");
				setModalOpen(false);
				await fetchItems();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: BackendIdInput) => {
		const response = await DecisionItemService.delete(id);
		if (response.success) {
			message.success("已删除");
			await fetchItems();
		}
	};

	const handleStateChange = async (item: DecisionItem, checked: boolean) => {
		if (item.id === undefined) return;
		const state = checked ? CommonState.Enable : CommonState.Disable;
		const response = await DecisionItemService.updateState(item.id, state);
		if (response.success) {
			setItems(prev => prev.map(current => (current.id === item.id ? { ...current, state } : current)));
		}
	};

	const handleDraw = async () => {
		if (activeCount < 1) {
			message.warning(`请先启用至少 1 个${config.itemName}`);
			return;
		}

		setDrawing(true);
		setDrawResults([]);
		try {
			const response = await DecisionItemService.draw(activeType, Math.min(drawCount, activeCount));
			if (response.success) {
				setDrawResults(response.data || []);
			}
		} finally {
			setDrawing(false);
		}
	};

	const handleClearResults = () => {
		setDrawResults([]);
	};

	return (
		<div className={`random-decision-page${isDark ? " random-decision-dark" : ""}`}>
			<div className="random-decision-header">
				<Space align="center">
					{onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回
						</Button>
					)}
					<div>
						<Typography.Title level={3}>随机决策器</Typography.Title>
						<Typography.Text type="secondary">吃什么/去哪玩</Typography.Text>
					</div>
				</Space>
			</div>

			<Tabs
				activeKey={String(activeType)}
				onChange={key => setActiveType(Number(key) as DecisionItemType)}
				items={[
					{ key: String(DecisionItemType.Food), label: decisionConfigs[DecisionItemType.Food].tab },
					{ key: String(DecisionItemType.Place), label: decisionConfigs[DecisionItemType.Place].tab }
				]}
			/>

			<Row gutter={[20, 20]} align="stretch">
				<Col xs={24} lg={15}>
					<section className="decision-panel">
						<div className="panel-toolbar">
							<div>
								<Typography.Title level={4}>{config.title}</Typography.Title>
								<Typography.Text type="secondary">
									共 {items.length} 项，已启用 {activeCount} 项
								</Typography.Text>
							</div>
							<Space>
								<Button icon={<ReloadOutlined />} onClick={fetchItems} loading={loading} />
								<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
									{config.addText}
								</Button>
							</Space>
						</div>

						<List
							className="decision-list"
							loading={loading}
							dataSource={items}
							locale={{ emptyText: <Empty description={config.emptyText} /> }}
							renderItem={item => (
								<List.Item
									actions={[
										<Switch
											key="state"
											size="small"
											checked={item.state === CommonState.Enable}
											onChange={checked => handleStateChange(item, checked)}
										/>,
										<Button key="edit" type="text" icon={<EditOutlined />} onClick={() => openEditModal(item)} />,
										item.id !== undefined && (
											<Popconfirm
												key="delete"
												title={`确认删除这个${config.itemName}？`}
												onConfirm={() => handleDelete(item.id!)}
											>
												<Button type="text" danger icon={<DeleteOutlined />} />
											</Popconfirm>
										)
									]}
								>
									<List.Item.Meta
										title={
											<Space wrap>
												<span>{item.name}</span>
												{item.state !== CommonState.Enable && <Tag>未启用</Tag>}
												{item.sort > 0 && <Tag color="blue">排序 {item.sort}</Tag>}
											</Space>
										}
										description={item.description || "未填写备注"}
									/>
								</List.Item>
							)}
						/>
					</section>
				</Col>

				<Col xs={24} lg={9}>
					<section className="decision-panel draw-panel">
						<Typography.Title level={4}>{config.drawText}</Typography.Title>
						<Typography.Text type="secondary">从已启用候选项中随机抽取，不重复。</Typography.Text>

						<div className="draw-controls">
							<Typography.Text>抽取数量</Typography.Text>
							<InputNumber min={1} max={maxDrawCount} value={drawCount} onChange={value => setDrawCount(value || 1)} />
							<Space.Compact className="draw-actions">
								<Button type="primary" icon={<ThunderboltOutlined />} loading={drawing} onClick={handleDraw}>
									随机一下
								</Button>
								<Button icon={<ClearOutlined />} disabled={drawResults.length === 0 || drawing} onClick={handleClearResults}>
									清空
								</Button>
							</Space.Compact>
						</div>

						<div className="draw-results">
							<Typography.Title level={5}>{config.resultTitle}</Typography.Title>
							{drawResults.length > 0 ? (
								<Space orientation="vertical" size={10} className="result-stack">
									{drawResults.map((item, index) => (
										<div className="result-item" key={`${item.id}-${index}`}>
											<Tag color="green">#{index + 1}</Tag>
											<div>
												<Typography.Text strong>{item.name}</Typography.Text>
												{item.description && <Typography.Text type="secondary">{item.description}</Typography.Text>}
											</div>
										</div>
									))}
								</Space>
							) : (
								<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有抽取结果" />
							)}
						</div>
					</section>
				</Col>
			</Row>

			<Modal
				title={editingItem ? `编辑${config.itemName}` : config.addText}
				open={modalOpen}
				onOk={handleSave}
				onCancel={() => setModalOpen(false)}
				confirmLoading={saving}
				destroyOnHidden
			>
				<Form form={form} layout="vertical" initialValues={defaultFormValues}>
					<Form.Item
						label={`${config.itemName}名称`}
						name="name"
						rules={[{ required: true, whitespace: true, message: `请输入${config.itemName}名称` }]}
					>
						<Input maxLength={100} placeholder={`请输入${config.itemName}名称`} />
					</Form.Item>
					<Form.Item label="备注" name="description">
						<Input.TextArea rows={3} maxLength={500} showCount placeholder="可填写口味、地址、开放时间等备注" />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label="排序" name="sort">
								<InputNumber min={0} max={99999} className="full-width-control" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="是否启用"
								name="state"
								getValueProps={(value?: CommonState) => ({ checked: value === CommonState.Enable })}
								getValueFromEvent={(checked: boolean) => (checked ? CommonState.Enable : CommonState.Disable)}
							>
								<Switch />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default RandomDecision;
