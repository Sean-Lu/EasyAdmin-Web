import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
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
	Select,
	Space,
	Switch,
	Table,
	Tooltip,
	message
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { InputRef } from "antd";
import { useSelector } from "react-redux";
import { BackendId } from "@/api/interface";
import {
	FixedExpenseCycle,
	FixedExpenseItem,
	FixedExpenseItemPayload,
	FixedExpenseItemService
} from "@/services/tool/fixedExpenseService";
import "./index.less";

interface MonthlyExpenseProps {
	onBack?: () => void;
}

type ExpenseFormValues = FixedExpenseItemPayload;

const currencyFormatter = (value: number) =>
	`¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 大金额紧凑展示：>= 1亿 显示"亿"，>= 1万 显示"万"，否则正常格式 */
const compactCurrencyFormatter = (value: number) => {
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (abs >= 1_0000_0000) {
		return `${sign}¥${(abs / 1_0000_0000).toFixed(2)}亿`;
	}
	if (abs >= 1_0000) {
		return `${sign}¥${(abs / 1_0000).toFixed(2)}万`;
	}
	return currencyFormatter(value);
};

const CYCLE_LABELS: Record<FixedExpenseCycle, string> = {
	[FixedExpenseCycle.Monthly]: "按月",
	[FixedExpenseCycle.Daily]: "按天",
	[FixedExpenseCycle.Weekly]: "按周",
	[FixedExpenseCycle.Yearly]: "按年"
};

/** 折算为每月支出：按天×30、按周×4、按年÷12、按月原值，保留两位小数 */
const toMonthlyAmount = (item: Pick<FixedExpenseItem, "amount" | "cycle">) => {
	const { amount, cycle } = item;
	const monthly =
		cycle === FixedExpenseCycle.Daily
			? amount * 30
			: cycle === FixedExpenseCycle.Weekly
			? amount * 4
			: cycle === FixedExpenseCycle.Yearly
			? amount / 12
			: amount;
	return Math.round(monthly * 100) / 100;
};

// 月度支出统计
const MonthlyExpense: React.FC<MonthlyExpenseProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [form] = Form.useForm<ExpenseFormValues>();
	const [items, setItems] = useState<FixedExpenseItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<BackendId | null>(null);
	const [saving, setSaving] = useState(false);
	const togglingEnabledIds = useRef(new Set<BackendId>());
	const nameInputRef = useRef<InputRef>(null);

	const loadItems = useCallback(async () => {
		setLoading(true);
		try {
			const response = await FixedExpenseItemService.getList();
			if (response.success) {
				setItems(response.data || []);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadItems();
	}, [loadItems]);

	const enabledMonthlyTotal = useMemo(
		() => Math.round(items.filter(item => item.isEnabled).reduce((sum, item) => sum + toMonthlyAmount(item), 0) * 100) / 100,
		[items]
	);

	const openCreateModal = () => {
		setEditingId(null);
		form.resetFields();
		setModalOpen(true);
	};

	const openEditModal = (record: FixedExpenseItem) => {
		setEditingId(record.id);
		form.setFieldsValue({
			name: record.name,
			amount: record.amount,
			cycle: record.cycle,
			isEnabled: record.isEnabled
		});
		setModalOpen(true);
	};

	const handleSave = async () => {
		const values = await form.validateFields();
		const normalizedValues: FixedExpenseItemPayload = {
			name: values.name.trim(),
			amount: values.amount,
			cycle: values.cycle,
			isEnabled: values.isEnabled ?? true
		};

		setSaving(true);
		try {
			const response = editingId
				? await FixedExpenseItemService.update({ ...normalizedValues, id: editingId })
				: await FixedExpenseItemService.add(normalizedValues);
			if (!response.success) return;
			if (response.data !== true) {
				message.warning("保存失败");
				await loadItems();
				return;
			}

			message.success(editingId ? "支出项已更新" : "支出项已新增");
			setModalOpen(false);
			await loadItems();
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (record: FixedExpenseItem) => {
		const response = await FixedExpenseItemService.delete(record.id);
		if (!response.success) return;
		if (response.data !== true) {
			message.warning("删除失败");
			await loadItems();
			return;
		}

		message.success("支出项已删除");
		await loadItems();
	};

	const handleToggleEnabled = async (record: FixedExpenseItem, isEnabled: boolean) => {
		if (togglingEnabledIds.current.has(record.id)) return;

		togglingEnabledIds.current.add(record.id);
		try {
			const response = await FixedExpenseItemService.updateIsEnabled(record.id, isEnabled);
			if (!response.success) return;
			if (response.data !== true) {
				message.warning("修改失败");
			}

			await loadItems();
		} finally {
			togglingEnabledIds.current.delete(record.id);
		}
	};

	const columns: ColumnsType<FixedExpenseItem> = [
		{
			title: "支出名称",
			dataIndex: "name",
			key: "name",
			width: 180,
			render: (name: string) => <span className="expense-name">{name}</span>
		},
		{
			title: "金额",
			dataIndex: "amount",
			key: "amount",
			width: 140,
			align: "right",
			render: (value: number) => currencyFormatter(value)
		},
		{
			title: "计费周期",
			dataIndex: "cycle",
			key: "cycle",
			width: 110,
			render: (cycle: FixedExpenseCycle) => CYCLE_LABELS[cycle] ?? "-"
		},
		{
			title: (
				<Space size={4}>
					<span>折算月支出</span>
					<Tooltip title="折算规则：按天×30、按周×4、按年÷12、按月原值">
						<InfoCircleOutlined className="monthly-amount-help-icon" tabIndex={0} />
					</Tooltip>
				</Space>
			),
			key: "monthlyAmount",
			width: 150,
			align: "right",
			render: (_value, record) => <span className="monthly-amount">{currencyFormatter(toMonthlyAmount(record))}</span>
		},
		{
			title: "启用",
			dataIndex: "isEnabled",
			key: "isEnabled",
			width: 90,
			align: "center",
			render: (value: boolean, record) => (
				<Switch
					size="small"
					checked={value}
					checkedChildren="启用"
					unCheckedChildren="禁用"
					onChange={nextValue => handleToggleEnabled(record, nextValue)}
				/>
			)
		},
		{
			title: "操作",
			key: "action",
			width: 112,
			render: (_value, record) => (
				<Space size={4}>
					<Tooltip title="编辑">
						<Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
					</Tooltip>
					<Popconfirm title="确定删除这条支出项吗？" okText="删除" cancelText="取消" onConfirm={() => handleDelete(record)}>
						<Tooltip title="删除">
							<Button type="text" danger icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className={`monthly-expense-page${isDark ? " monthly-expense-dark" : ""}`}>
			<Card
				title="月度支出统计"
				extra={
					onBack && (
						<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
							返回百宝箱
						</Button>
					)
				}
			>
				<div className="expense-toolbar">
					<Space wrap>
						<span className="expense-table-title">固定支出项</span>
						<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
							新增支出项
						</Button>
					</Space>
				</div>

				<Table
					rowKey="id"
					loading={loading}
					columns={columns}
					dataSource={items}
					scroll={{ x: "max-content" }}
					pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条` }}
					rowClassName={(record: FixedExpenseItem) => (!record.isEnabled ? "expense-row-disabled" : "")}
				/>

				<div className="expense-total-bar">
					<span className="expense-total-label">每月固定支出预估</span>
					<span className="expense-total-value">
						{compactCurrencyFormatter(enabledMonthlyTotal)}
						<span className="expense-total-unit">/月</span>
					</span>
				</div>
			</Card>

			<Modal
				title={editingId ? "编辑支出项" : "新增支出项"}
				open={modalOpen}
				okText="保存"
				cancelText="取消"
				confirmLoading={saving}
				onOk={handleSave}
				onCancel={() => setModalOpen(false)}
				destroyOnHidden
				afterOpenChange={open => {
					if (open) nameInputRef.current?.focus();
				}}
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{ amount: undefined, cycle: FixedExpenseCycle.Monthly, isEnabled: true }}
				>
					<Form.Item name="name" label="支出名称" rules={[{ required: true, whitespace: true, message: "请输入支出名称" }]}>
						<Input ref={nameInputRef} placeholder="如：房租、水费、交通、吃饭" maxLength={100} />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name="amount" label="金额" rules={[{ required: true, message: "请输入金额" }]}>
								<InputNumber min={0} precision={2} prefix="¥" className="form-number-input" placeholder="如：1500" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="cycle" label="计费周期" rules={[{ required: true, message: "请选择计费周期" }]}>
								<Select
									className="form-cycle-select"
									options={[
										{ label: "按月", value: FixedExpenseCycle.Monthly },
										{ label: "按天", value: FixedExpenseCycle.Daily },
										{ label: "按周", value: FixedExpenseCycle.Weekly },
										{ label: "按年", value: FixedExpenseCycle.Yearly }
									]}
								/>
							</Form.Item>
						</Col>
					</Row>
					<Form.Item name="isEnabled" label="是否启用" valuePropName="checked">
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MonthlyExpense;
