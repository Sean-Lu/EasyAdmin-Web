import React from "react";
import { act, create } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import TodoHeader from "./index";

vi.mock("antd", () => ({ Input: { TextArea: "textarea" }, Select: "select" }));

let renderer;
afterEach(() => {
	act(() => renderer?.unmount());
});

function mount(value) {
	const addTodo = vi.fn();
	act(() => {
		renderer = create(<TodoHeader addTodo={addTodo} />);
	});
	act(() => renderer.root.findByType("textarea").props.onChange({ target: { value } }));
	return addTodo;
}

describe("todo creation keyboard", () => {
	it("Ctrl+Enter inserts a newline without creating a task", () => {
		const addTodo = mount("前选中后");
		const target = { selectionStart: 1, selectionEnd: 3 };
		const event = { key: "Enter", ctrlKey: true, currentTarget: target, preventDefault: vi.fn() };
		act(() => renderer.root.findByType("textarea").props.onKeyDown(event));
		expect(renderer.root.findByType("textarea").props.value).toBe("前\n后");
		expect(target).toEqual({ selectionStart: 2, selectionEnd: 2 });
		expect(event.preventDefault).toHaveBeenCalledOnce();
		expect(addTodo).not.toHaveBeenCalled();
	});
	it("Enter creates a multiline task and clears the content", () => {
		const addTodo = mount("第一行\n第二行");
		const event = { key: "Enter", preventDefault: vi.fn() };
		act(() => renderer.root.findByType("textarea").props.onKeyDown(event));
		expect(addTodo).toHaveBeenCalledWith(expect.objectContaining({ name: "第一行\n第二行" }));
		expect(event.preventDefault).toHaveBeenCalledOnce();
		expect(renderer.root.findByType("textarea").props.value).toBe("");
	});
});
