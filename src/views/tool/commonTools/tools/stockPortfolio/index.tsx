import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Empty,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Row,
	Select,
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
import { StockAccount, StockAccountPayload, StockAccountService } from "@/services/tool/stockAccountService";
import { StockHolding, StockHoldingPayload, StockHoldingService, StockHoldingSummary } from "@/services/tool/stockHoldingService";
import "./index.less";

interface StockPortfolioProps {
	onBack?: () => void;
}

type HoldingFormValues = Omit<StockHoldingPayload, "accountId">;
type AccountFormValues = StockAccountPayload;

const currencyFormatter = (value: number) =>
	`¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const normalizeOptionalNumber = (value?: number | null) => (value === null || value === undefined ? undefined : value);

// 股票持仓管理
const StockPortfolio: React.FC<StockPortfolioProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [form] = Form.useForm<HoldingFormValues>();
	const [accountForm] = Form.useForm<AccountFormValues>();
	const [accounts, setAccounts] = useState<StockAccount[]>([]);
	const [selectedAccountId, setSelectedAccountId] = useState<BackendId>();
	const [holdings, setHoldings] = useState<StockHolding[]>([]);
	const [summary, setSummary] = useState<StockHoldingSummary>(emptySummary);
	const [keyword, setKeyword] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [accountModalOpen, setAccountModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<BackendId | null>(null);
	const [editingAccountId, setEditingAccountId] = useState<BackendId | null>(null);
	const [loading, setLoading] = useState(false);
	const [accountLoading, setAccountLoading] = useState(false);
	const [accountInitialized, setAccountInitialized] = useState(false);
	const [priceDrafts, setPriceDrafts] = useState<Record<string, number>>({});
	const holdingRequestSeq = useRef(0);
	const accountRequestSeq = useRef(0);
	const savingPriceIds = useRef(new Set<BackendId>());

	const selectedAccount = useMemo(
		() => accounts.find(account => account.id === selectedAccountId),
		[accounts, selectedAccountId]
	);
	const hasAccount = Boolean(selectedAccountId);

	// 清空上一个账户的持仓视图
	const clearHoldings = useCallback(() => {
		setHoldings([]);
		setSummary(emptySummary);
		setPriceDrafts({});
	}, []);

	const loadHoldings = useCallback(
		async (accountId?: BackendId, searchKeyword = "") => {
			// 防止旧请求覆盖当前账户数据
			const requestSeq = ++holdingRequestSeq.current;

			if (!accountId) {
				clearHoldings();
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const response = await StockHoldingService.getList(accountId, searchKeyword.trim());
				if (requestSeq !== holdingRequestSeq.current) return;

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
				if (requestSeq === holdingRequestSeq.current) {
					setLoading(false);
				}
			}
		},
		[clearHoldings]
	);

	const loadAccounts = useCallback(
		async (preferredAccountId?: BackendId, searchKeyword = "") => {
			// 先确定账户，再加载持仓
			const requestSeq = ++accountRequestSeq.current;

			setAccountLoading(true);
			try {
				const response = await StockAccountService.getList();
				if (requestSeq !== accountRequestSeq.current) return;
				if (!response.success) return;

				const nextAccounts = response.data || [];
				const nextSelectedAccountId =
					preferredAccountId && nextAccounts.some(account => account.id === preferredAccountId)
						? preferredAccountId
						: nextAccounts[0]?.id;

				setAccounts(nextAccounts);
				setSelectedAccountId(nextSelectedAccountId);

				if (nextSelectedAccountId) {
					loadHoldings(nextSelectedAccountId, searchKeyword);
				} else {
					loadHoldings();
				}
			} finally {
				if (requestSeq === accountRequestSeq.current) {
					setAccountLoading(false);
					setAccountInitialized(true);
				}
			}
		},
		[loadHoldings]
	);

	useEffect(() => {
		loadAccounts();
	}, [loadAccounts]);

	const tableTitle = useMemo(() => (keyword.trim() ? `搜索结果：${keyword.trim()}` : "持仓列表"), [keyword]);

	const openCreateModal = () => {
		if (!selectedAccountId) return;

		setEditingId(null);
		form.resetFields();
		setModalOpen(true);
	};

	const openEditModal = (record: StockHolding) => {
		setEditingId(record.id);
		form.setFieldsValue({
			id: record.id,
			name: record.name,
			code: record.code,
			costPrice: record.costPrice,
			quantity: record.quantity,
			currentPrice: record.currentPrice
		});
		setModalOpen(true);
	};

	const openCreateAccountModal = () => {
		setEditingAccountId(null);
		accountForm.resetFields();
		setAccountModalOpen(true);
	};

	const openEditAccountModal = () => {
		if (!selectedAccount) return;

		setEditingAccountId(selectedAccount.id);
		accountForm.setFieldsValue({
			brokerName: selectedAccount.brokerName,
			initialAsset: selectedAccount.initialAsset,
			currentAsset: selectedAccount.currentAsset
		});
		setAccountModalOpen(true);
	};

	const handleAccountChange = (accountId: BackendId) => {
		setSelectedAccountId(accountId);
		loadHoldings(accountId, keyword);
	};

	const handleSaveAccount = async () => {
		const values = await accountForm.validateFields();
		const normalizedValues: StockAccountPayload = {
			brokerName: values.brokerName.trim(),
			initialAsset: normalizeOptionalNumber(values.initialAsset),
			currentAsset: normalizeOptionalNumber(values.currentAsset)
		};

		const response = editingAccountId
			? await StockAccountService.update({ ...normalizedValues, id: editingAccountId })
			: await StockAccountService.add(normalizedValues);

		if (!response.success) return;

		message.success(editingAccountId ? "账户已更新" : "账户已新增");
		setAccountModalOpen(false);
		loadAccounts(editingAccountId || selectedAccountId, keyword);
	};

	const handleDeleteAccount = async () => {
		if (!selectedAccountId) return;

		const deletedAccountId = selectedAccountId;
		const response = await StockAccountService.delete(deletedAccountId);
		if (!response.success) return;

		message.success("账户已删除");
		// 废弃在途请求，避免旧响应回填已删除账户
		accountRequestSeq.current += 1;
		holdingRequestSeq.current += 1;
		setAccounts([]);
		setSelectedAccountId(undefined);
		setEditingAccountId(null);
		setAccountModalOpen(false);
		setKeyword("");
		clearHoldings();
		setLoading(false);
		loadAccounts(undefined, "");
	};

	const handleSave = async () => {
		if (!selectedAccountId) return;

		const values = await form.validateFields();
		const normalizedValues: StockHoldingPayload = {
			...values,
			accountId: selectedAccountId,
			code: values.code.trim(),
			name: values.name.trim()
		};

		const response = editingId
			? await StockHoldingService.update({ ...normalizedValues, id: editingId })
			: await StockHoldingService.add(normalizedValues);

		if (!response.success) return;

		message.success(editingId ? "持仓已更新" : "持仓已新增");
		setModalOpen(false);
		// 重新拉取后端计算字段和汇总
		loadHoldings(selectedAccountId, keyword);
	};

	const handleDelete = async (record: StockHolding) => {
		if (!record.accountId) return;

		const response = await StockHoldingService.delete(record.accountId, record.id);
		if (!response.success) return;

		message.success("持仓已删除");
		if (record.accountId === selectedAccountId) {
			loadHoldings(selectedAccountId, keyword);
		}
	};

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
		if (!selectedAccountId) return;
		if (record.accountId !== selectedAccountId) {
			// 旧行数据不提交，刷新当前账户
			loadHoldings(selectedAccountId, keyword);
			return;
		}

		const currentPrice = priceDrafts[record.id];
		if (currentPrice === undefined || currentPrice === record.currentPrice) return;
		if (savingPriceIds.current.has(record.id)) return;

		savingPriceIds.current.add(record.id);
		try {
			const response = await StockHoldingService.updateCurrentPrice(record.accountId, record.id, currentPrice);
			if (!response.success) return;

			loadHoldings(selectedAccountId, keyword);
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
					addonBefore="¥"
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
					<Popconfirm title="确定删除这条持仓吗？" okText="删除" cancelText="取消" onConfirm={() => handleDelete(record)}>
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
				<div className="account-toolbar">
					<Space wrap>
						<Select
							placeholder="选择账户"
							value={selectedAccountId}
							loading={accountLoading}
							className="account-select"
							options={accounts.map(account => ({ label: account.brokerName, value: account.id }))}
							onChange={handleAccountChange}
						/>
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateAccountModal}>
							新增账户
						</Button>
						<Button icon={<EditOutlined />} disabled={!selectedAccount} onClick={openEditAccountModal}>
							编辑账户
						</Button>
						<Popconfirm
							title="确定删除当前账户吗？"
							description="删除后会重新加载账户和持仓列表。"
							okText="删除"
							cancelText="取消"
							disabled={!selectedAccount}
							onConfirm={handleDeleteAccount}
						>
							<Button danger icon={<DeleteOutlined />} disabled={!selectedAccount}>
								删除账户
							</Button>
						</Popconfirm>
					</Space>
				</div>

				{selectedAccount && (
					<Row gutter={[16, 16]} className="account-summary">
						<Col xs={24} sm={12} lg={6}>
							<Card size="small">
								<Statistic title="账户" value={selectedAccount.brokerName} />
							</Card>
						</Col>
						<Col xs={24} sm={12} lg={6}>
							<Card size="small">
								<Statistic
									title="初始资产"
									value={selectedAccount.initialAsset ?? 0}
									formatter={value => currencyFormatter(Number(value))}
								/>
							</Card>
						</Col>
						<Col xs={24} sm={12} lg={6}>
							<Card size="small">
								<Statistic
									title="当前资产"
									value={selectedAccount.currentAsset ?? 0}
									formatter={value => currencyFormatter(Number(value))}
								/>
							</Card>
						</Col>
						<Col xs={24} sm={12} lg={6}>
							<Card size="small">
								<Statistic
									title="资产盈亏"
									value={selectedAccount.assetProfitAmount}
									formatter={value =>
										`${currencyFormatter(Number(value))} / ${percentFormatter(selectedAccount.assetProfitRatio)}`
									}
									className={getProfitClassName(selectedAccount.assetProfitAmount)}
								/>
							</Card>
						</Col>
					</Row>
				)}

				{!hasAccount && (!accountInitialized || accountLoading) ? (
					<Empty description="账户加载中..." className="account-empty" />
				) : !hasAccount ? (
					<Empty description="暂无股票账户" className="account-empty">
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateAccountModal}>
							新增账户
						</Button>
					</Empty>
				) : (
					<>
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
										loadHoldings(selectedAccountId, "");
									}
								}}
								onSearch={value => loadHoldings(selectedAccountId, value)}
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
					</>
				)}
			</Card>

			<Modal
				title={editingAccountId ? "编辑账户" : "新增账户"}
				open={accountModalOpen}
				okText="保存"
				cancelText="取消"
				onOk={handleSaveAccount}
				onCancel={() => setAccountModalOpen(false)}
				destroyOnHidden
			>
				<Form form={accountForm} layout="vertical">
					<Form.Item name="brokerName" label="券商名称" rules={[{ required: true, whitespace: true, message: "请输入券商名称" }]}>
						<Input placeholder="如：华泰证券" />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name="initialAsset" label="初始资产">
								<InputNumber min={0} precision={2} addonBefore="¥" className="form-number-input" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="currentAsset" label="当前资产">
								<InputNumber min={0} precision={2} addonBefore="¥" className="form-number-input" />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

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
								<InputNumber min={0} precision={3} addonBefore="¥" className="form-number-input" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="quantity" label="持仓数量" rules={[{ required: true, message: "请输入持仓数量" }]}>
								<InputNumber min={0} precision={0} className="form-number-input" />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name="currentPrice" label="当前价格" rules={[{ required: true, message: "请输入当前价格" }]}>
						<InputNumber min={0} precision={3} addonBefore="¥" className="form-number-input" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default StockPortfolio;
