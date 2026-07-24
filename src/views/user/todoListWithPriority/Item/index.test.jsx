import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import TodoItem from "./index";

const createProps = overrides => ({
	id: 1,
	name: "一条较长的待办事项内容",
	done: false,
	priority: 1,
	categories: [],
	updateName: vi.fn().mockResolvedValue(undefined),
	...overrides
});

describe("todo item editing", () => {
	it("renders a textarea in edit mode so long content can grow with wrapped lines", () => {
		const item = new TodoItem(createProps({ editing: true }));
		const markup = renderToStaticMarkup(<TodoItem {...createProps({ editing: true })} />);
		const textArea = item.render().props.children.props.children[0];

		expect(markup).toContain("<textarea");
		expect(textArea.props.onKeyDown).toBe(item.handleEditKeyPress);
	});

	it("prevents Enter from inserting a newline while saving the edit", async () => {
		const updateName = vi.fn().mockResolvedValue(undefined);
		const item = new TodoItem(createProps({ updateName }));
		const event = { key: "Enter", preventDefault: vi.fn() };

		await item.handleEditKeyPress(event);

		expect(event.preventDefault).toHaveBeenCalledOnce();
		expect(updateName).toHaveBeenCalledWith(1, "一条较长的待办事项内容");
	});

	it("inserts a newline at the cursor for Ctrl or Command plus Enter", () => {
		const item = new TodoItem(createProps({ name: "前后" }));
		item.setState = vi.fn();
		const ctrlEnterEvent = {
			key: "Enter",
			ctrlKey: true,
			preventDefault: vi.fn(),
			currentTarget: { selectionStart: 1, selectionEnd: 1 }
		};

		item.handleEditKeyPress(ctrlEnterEvent);

		expect(ctrlEnterEvent.preventDefault).toHaveBeenCalledOnce();
		expect(item.setState).toHaveBeenCalledWith({ editValue: "前\n后" }, expect.any(Function));
	});
});
