/* eslint-disable react/display-name */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TenantAiSettings from "./TenantAiSettings";
import TenantEdit from "./TenantEdit";
import TenantList from "./Tenant";

vi.mock("antd", () => {
	const Form = ({ children }) => <form>{children}</form>;
	Form.Item = ({ children, label }) => (
		<label>
			{label}
			{children}
		</label>
	);
	Form.useForm = () => [
		{
			resetFields: vi.fn(),
			setFieldsValue: vi.fn(),
			submit: vi.fn()
		}
	];
	Form.useWatch = () => false;

	return {
		Alert: ({ message }) => <div>{message}</div>,
		Button: ({ children }) => <button>{children}</button>,
		Col: ({ children }) => <div>{children}</div>,
		DatePicker: () => <input />,
		Divider: ({ children }) => <div>{children}</div>,
		Form,
		Input: Object.assign(() => <input />, { Search: () => <input /> }),
		InputNumber: () => <input />,
		message: { error: vi.fn(), success: vi.fn() },
		Modal: ({ children, open, okText, title }) =>
			open ? (
				<section data-title={title}>
					{children}
					<button>{okText}</button>
				</section>
			) : null,
		Row: ({ children }) => <div>{children}</div>,
		Space: ({ children }) => <div>{children}</div>,
		Spin: ({ children }) => <div>{children}</div>,
		Switch: () => <button>switch</button>
	};
});

vi.mock("@/services/ai/aiService", () => ({
	aiService: {
		getTenantSetting: vi.fn(),
		updateTenantSetting: vi.fn()
	}
}));

vi.mock("../../../components/StandardTable", () => ({
	default: props => (
		<div>
			{props.renderRecordOperate?.({ id: 1, name: "系统默认" })}
			{props.renderModal?.({}, false, vi.fn(), vi.fn(), false, vi.fn(), vi.fn(), false, vi.fn())}
		</div>
	)
}));

describe("租户 AI 设置", () => {
	it("通过租户列表的独立操作入口打开", () => {
		const html = renderToStaticMarkup(<TenantList />);

		expect(html).toContain("AI设置");
	});

	it("使用带租户名称的独立弹窗", () => {
		const html = renderToStaticMarkup(
			<TenantAiSettings modalVisible={true} onCancel={() => undefined} record={{ id: 1, name: "系统默认" }} />
		);

		expect(html).toContain('data-title="AI 设置 - 系统默认"');
		expect(html).toContain("每日请求上限");
		expect(html).toContain("保存");
	});

	it("租户基础信息弹窗不再包含 AI 设置", () => {
		const html = renderToStaticMarkup(
			<TenantEdit
				modalVisible={true}
				onCancel={() => undefined}
				onSubmit={() => undefined}
				record={{ id: 1, name: "系统默认" }}
			/>
		);

		expect(html).not.toContain("AI 设置");
	});
});
