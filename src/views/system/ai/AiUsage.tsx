import { Button, Card, DatePicker, Form, Input, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { aiService, AiUsage as AiUsageItem } from "@/services/ai/aiService";

/** AI 用量记录页面 */
export default function AiUsage() {
	const [form] = Form.useForm();
	const [items, setItems] = useState<AiUsageItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const load = async (page = pageNumber) => {
		setLoading(true);
		try {
			const values = form.getFieldsValue();
			const range = values.range;
			const result = await aiService.usagePage({
				pageNumber: page,
				pageSize: 20,
				tenantId: values.tenantId || undefined,
				userKeyword: values.userKeyword?.trim() || undefined,
				status: values.status,
				startTime: range?.[0]?.toISOString(),
				endTime: range?.[1]?.toISOString()
			});
			setItems(result.list);
			setTotal(result.total);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => void load(1), []);
	return (
		<Card title="AI 用量记录" className="ai-admin-card">
			<Form
				form={form}
				layout="inline"
				onFinish={() => {
					setPageNumber(1);
					void load(1);
				}}
			>
				<Form.Item name="tenantId" label="租户 ID">
					<Input />
				</Form.Item>
				<Form.Item name="userKeyword" label="用户">
					<Input placeholder="用户名或昵称" />
				</Form.Item>
				<Form.Item name="status" label="状态">
					<Select
						allowClear
						style={{ width: 120 }}
						options={[
							{ value: 0, label: "运行中" },
							{ value: 1, label: "成功" },
							{ value: 2, label: "失败" },
							{ value: 3, label: "已取消" }
						]}
					/>
				</Form.Item>
				<Form.Item name="range" label="时间">
					<DatePicker.RangePicker showTime />
				</Form.Item>
				<Button type="primary" htmlType="submit">
					查询
				</Button>
			</Form>
			<Table
				rowKey="id"
				loading={loading}
				dataSource={items}
				pagination={{
					current: pageNumber,
					total,
					pageSize: 20,
					onChange: page => {
						setPageNumber(page);
						void load(page);
					}
				}}
				scroll={{ x: 1100 }}
				columns={[
					{ title: "租户", dataIndex: "tenantId" },
					{ title: "用户", dataIndex: "userId" },
					{ title: "模型", dataIndex: "model" },
					{ title: "开始时间", dataIndex: "createTime" },
					{ title: "输入", dataIndex: "inputTokens" },
					{ title: "输出", dataIndex: "outputTokens" },
					{ title: "耗时(ms)", dataIndex: "durationMs" },
					{ title: "状态", dataIndex: "status", render: value => <Tag>{["运行中", "成功", "失败", "已取消"][value]}</Tag> },
					{ title: "错误类型", dataIndex: "errorType" }
				]}
			/>
		</Card>
	);
}
