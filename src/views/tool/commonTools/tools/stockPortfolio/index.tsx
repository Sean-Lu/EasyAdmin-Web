import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Space,
	Statistic,
	Table,
	Tag,
	Tooltip,
	message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import { BackendId } from "@/api/interface";
import { StockHolding, StockHoldingPayload, StockHoldingService, StockHoldingSummary } from "@/services/tool/stockHoldingService";
import "./index.less";

interface StockPortfolioProps {
	onBack?: () => void;
}

type HoldingFormValues = StockHoldingPayload;

const currencyFormatter = (value: number) =>
	`￥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const percentFormatter = (value: number) => `${value.toFixed(2)}%`;
const quantityFormatter = (value: number) => value.toLocaleString("zh-CN");
const getProfitClassName = (value: number) => {
	if (value > 0) return "profit-up";
	if (value < 0) return "profit-down";
	return undefined;
};

const emptySummary: StockHoldingSummary = {
	totalQuantity: 0,
	totalCostAmount: 0,
	totalMarketValue: 0,
	totalProfitAmount: 0,
	totalProfitRatio: 0
};

// 股票持仓管理
const StockPortfolio: React.FC<StockPortfolioProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [form] = Form.useForm<HoldingFormValues>();
	const [holdings, setHoldings] = useState<StockHolding[]>([]);
	const [summary, setSummary] = useState<StockHoldingSummary>(emptySummary);
	const [keyword, setKeyword] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<BackendId | null>(null);
	const [loading, setLoading] = useState(false);
	const [priceDrafts, setPriceDrafts] = useState<Record<string, number>>({});
	const savingPriceIds = useRef(new Set<BackendId>());

	// 列表和统计由同一个后端接口返回，避免前端筛选后统计口径与后端不一致。
	const loadHoldings = useCallback(async (searchKeyword = "") => {
		setLoading(true);
		try {
			const response = await StockHoldingService.getList(searchKeyword.trim());
			if (response.success) {
				const nextHoldings = response.data?.list || [];
				setHoldings(nextHoldings);
				setSummary(response.data?.summary || emptySummary);
				setPriceDrafts(
					nextHoldings.reduce<Record<string, number>>((result, item) => {
						result[item.id] = item.currentPrice;
						return result;
					}, {})
				);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadHoldings("");
	}, [loadHoldings]);

	const tableTitle = useMemo(() => (keyword.trim() ? `搜索结果：${keyword.trim()}` : "持仓列表"), [keyword]);

	const openCreateModal = () => {
		setEditingId(null);
		form.resetFields();
		setModalOpen(true);
	};

	const openEditModal = (record: StockHolding) => {
		setEditingId(record.id);
		form.setFieldsValue({
			name: record.name,
			code: record.code,
			costPrice: record.costPrice,
			quantity: record.quantity,
			currentPrice: record.currentPrice
		});
		setModalOpen(true);
	};

	// 保存后重新拉取列表，让后端计算字段和统计卡片保持最新。
	const handleSave = async () => {
		const values = await form.validateFields();
		const normalizedValues: StockHoldingPayload = {
			...values,
			code: values.code.trim(),
			name: values.name.trim()
		};

		const response = editingId
			? await StockHoldingService.update({ ...normalizedValues, id: editingId })
			: await StockHoldingService.add(normalizedValues);

		if (!response.success) return;

		if (editingId) {
			message.success("持仓已更新");
		} else {
			message.success("持仓已新增");
		}

		setModalOpen(false);
		loadHoldings(keyword);
	};

	const handleDelete = async (id: BackendId) => {
		const response = await StockHoldingService.delete(id);
		if (!response.success) return;

		message.success("持仓已删除");
		loadHoldings(keyword);
	};

	// 当前价格是高频更新字段，独立接口可以减少误改名称、成本、数量等基础信息的风险。
	const handleCurrentPriceChange = (id: BackendId, currentPrice: number | null) => {
		if (currentPrice === null) {
			setPriceDrafts(items => {
				const nextItems = { ...items };
				delete nextItems[id];
				return nextItems;
			});
			return;
		}
		setPriceDrafts(items => ({ ...items, [id]: currentPrice }));
	};

	const handleCurrentPriceCommit = async (record: StockHolding) => {
		const currentPrice = priceDrafts[record.id];
		if (currentPrice === undefined || currentPrice === record.currentPrice) return;
		if (savingPriceIds.current.has(record.id)) return;

		savingPriceIds.current.add(record.id);
		try {
			const response = await StockHoldingService.updateCurrentPrice(record.id, currentPrice);
			if (!response.success) return;

			loadHoldings(keyword);
		} finally {
			savingPriceIds.current.delete(record.id);
		}
	};

	const columns: ColumnsType<StockHolding> = [
		{
			title: "股票名称",
			dataIndex: "name",
			key: "name",
			width: 140,
			fixed: "left",
			render: (name: string, record) => (
				<Space direction="vertical" size={0}>
					<span className="stock-name">{name}</span>
					<span className="stock-code">{record.code}</span>
				</Space>
			)
		},
		{
			title: "持仓成本",
			dataIndex: "costPrice",
			key: "costPrice",
			width: 120,
			align: "right",
			render: (value: number) => currencyFormatter(value)
		},
		{
			title: "持仓数量",
			dataIndex: "quantity",
			key: "quantity",
			width: 120,
			align: "right",
			render: (value: number) => quantityFormatter(value)
		},
		{
			title: "当前价格",
			dataIndex: "currentPrice",
			key: "currentPrice",
			width: 150,
			render: (value: number, record) => (
				<InputNumber
					min={0}
					precision={3}
					value={priceDrafts[record.id] ?? value}
					addonBefore="￥"
					className="current-price-input"
					onChange={nextValue => handleCurrentPriceChange(record.id, nextValue)}
					onBlur={() => handleCurrentPriceCommit(record)}
					onPressEnter={() => handleCurrentPriceCommit(record)}
				/>
			)
		},
		{
			title: "持仓市值",
			dataIndex: "marketValue",
			key: "marketValue",
			width: 130,
			align: "right",
			render: (value: number) => currencyFormatter(value)
		},
		{
			title: "盈亏金额",
			dataIndex: "profitAmount",
			key: "profitAmount",
			width: 130,
			align: "right",
			render: (value: number) => <span className={getProfitClassName(value)}>{currencyFormatter(value)}</span>
		},
		{
			title: "盈亏比例",
			dataIndex: "profitRatio",
			key: "profitRatio",
			width: 120,
			align: "right",
			render: (value: number) => <Tag color={value > 0 ? "red" : value < 0 ? "green" : "default"}>{percentFormatter(value)}</Tag>
		},
		{
			title: "操作",
			key: "action",
			width: 112,
			fixed: "right",
			render: (_value, record) => (
				<Space size={4}>
					<Tooltip title="编辑">
						<Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
					</Tooltip>
					<Popconfirm title="确定删除这条持仓吗？" okText="删除" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
						<Tooltip title="删除">
							<Button type="text" danger icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className={`stock-portfolio-page${isDark ? " stock-portfolio-dark" : ""}`}>
			<Card
				title="股票持仓管理"
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<Row gutter={[16, 16]} className="portfolio-summary">
					<Col xs={24} sm={12} lg={6}>
						<Card size="small">
							<Statistic
								title="总持仓市值"
								value={summary.totalMarketValue}
								formatter={value => currencyFormatter(Number(value))}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card size="small">
							<Statistic
								title="总持仓成本"
								value={summary.totalCostAmount}
								formatter={value => currencyFormatter(Number(value))}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card size="small">
							<Statistic
								title="总盈亏金额"
								value={summary.totalProfitAmount}
								formatter={value => currencyFormatter(Number(value))}
								className={getProfitClassName(summary.totalProfitAmount)}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card size="small">
							<Statistic
								title="总盈亏比例"
								value={summary.totalProfitRatio}
								formatter={value => percentFormatter(Number(value))}
								className={getProfitClassName(summary.totalProfitRatio)}
							/>
						</Card>
					</Col>
				</Row>

				<div className="portfolio-toolbar">
					<Space wrap>
						<span className="portfolio-table-title">{tableTitle}</span>
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
							新增持仓
						</Button>
					</Space>
					<Input.Search
						allowClear
						placeholder="按股票名称/代码搜索"
						value={keyword}
						onChange={event => {
							const nextKeyword = event.target.value;
							setKeyword(nextKeyword);
							if (!nextKeyword) {
								loadHoldings("");
							}
						}}
						onSearch={value => loadHoldings(value)}
						className="portfolio-search"
					/>
				</div>

				<Table
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={holdings}
					scroll={{ x: "max-content" }}
					pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条` }}
				/>
			</Card>

			<Modal
				title={editingId ? "编辑持仓" : "新增持仓"}
				open={modalOpen}
				okText="保存"
				cancelText="取消"
				onOk={handleSave}
				onCancel={() => setModalOpen(false)}
				destroyOnHidden
			>
				<Form form={form} layout="vertical" initialValues={{ quantity: 100, costPrice: 0, currentPrice: 0 }}>
					<Form.Item name="name" label="股票名称" rules={[{ required: true, whitespace: true, message: "请输入股票名称" }]}>
						<Input placeholder="如：平安银行" />
					</Form.Item>
					<Form.Item name="code" label="股票代码" rules={[{ required: true, whitespace: true, message: "请输入股票代码" }]}>
						<Input placeholder="如：000001" />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name="costPrice" label="持仓成本" rules={[{ required: true, message: "请输入持仓成本" }]}>
								<InputNumber min={0} precision={3} addonBefore="￥" className="form-number-input" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="quantity" label="持仓数量" rules={[{ required: true, message: "请输入持仓数量" }]}>
								<InputNumber min={0} precision={0} className="form-number-input" />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name="currentPrice" label="当前价格" rules={[{ required: true, message: "请输入当前价格" }]}>
						<InputNumber min={0} precision={3} addonBefore="￥" className="form-number-input" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default StockPortfolio;
