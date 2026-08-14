import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { buildNoteOutlineItems, NoteOutlineItem, OutlineHeadingSource } from "./outlineUtils";

interface NoteOutlineProps {
	contentRef: React.RefObject<HTMLElement>;
	contentVersion: unknown;
	idPrefix: string;
	isDark?: boolean;
	scrollContainerRef?: React.RefObject<HTMLElement>;
	triggerHost?: HTMLElement | null;
}

const NoteOutline: React.FC<NoteOutlineProps> = ({
	contentRef,
	contentVersion,
	idPrefix,
	isDark = false,
	scrollContainerRef,
	triggerHost
}) => {
	const [items, setItems] = useState<NoteOutlineItem[]>([]);
	const [activeId, setActiveId] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const navigationTargetRef = useRef("");
	const scrollEndTimerRef = useRef<number>();

	useEffect(() => {
		const content = contentRef.current;
		if (!content) {
			setItems([]);
			setActiveId("");
			return;
		}

		const headingElements = Array.from(content.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"));
		const sources: OutlineHeadingSource[] = headingElements.map((heading, sourceIndex) => ({
			level: Number(heading.tagName.slice(1)),
			text: heading.textContent || "",
			sourceIndex
		}));
		const nextItems = buildNoteOutlineItems(sources, idPrefix);
		nextItems.forEach(item => {
			headingElements[item.sourceIndex].id = item.id;
		});
		setItems(nextItems);

		if (!nextItems.length) {
			setActiveId("");
			return;
		}

		const scrollContainer = scrollContainerRef?.current;
		let frame = 0;
		const updateActiveHeading = () => {
			frame = 0;
			if (navigationTargetRef.current) {
				setActiveId(navigationTargetRef.current);
				return;
			}
			const rootTop = scrollContainer?.getBoundingClientRect().top || 0;
			let nextActiveId = nextItems[0].id;
			for (const item of nextItems) {
				const heading = headingElements[item.sourceIndex];
				if (heading.getBoundingClientRect().top - rootTop <= 32) nextActiveId = item.id;
				else break;
			}
			setActiveId(nextActiveId);
		};
		const finishNavigation = () => {
			navigationTargetRef.current = "";
			scrollEndTimerRef.current = undefined;
		};
		const handleScroll = () => {
			if (navigationTargetRef.current) {
				if (scrollEndTimerRef.current) window.clearTimeout(scrollEndTimerRef.current);
				scrollEndTimerRef.current = window.setTimeout(finishNavigation, 120);
			}
			if (!frame) frame = window.requestAnimationFrame(updateActiveHeading);
		};
		const scrollTarget: HTMLElement | Window = scrollContainer || window;
		scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll, { passive: true });
		updateActiveHeading();

		return () => {
			scrollTarget.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
			if (frame) window.cancelAnimationFrame(frame);
			if (scrollEndTimerRef.current) window.clearTimeout(scrollEndTimerRef.current);
			scrollEndTimerRef.current = undefined;
			navigationTargetRef.current = "";
		};
	}, [contentRef, contentVersion, idPrefix, scrollContainerRef]);

	if (!items.length) return null;
	const minimumLevel = Math.min(...items.map(item => item.level));
	const navigateTo = (id: string) => {
		navigationTargetRef.current = id;
		if (scrollEndTimerRef.current) window.clearTimeout(scrollEndTimerRef.current);
		scrollEndTimerRef.current = window.setTimeout(() => {
			navigationTargetRef.current = "";
			scrollEndTimerRef.current = undefined;
		}, 500);
		setActiveId(id);
		contentRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
		setDrawerOpen(false);
	};
	const outlineList = (
		<nav className="note-outline-list" aria-label="笔记目录">
			{items.map(item => (
				<button
					key={item.id}
					type="button"
					className={`note-outline-item${activeId === item.id ? " note-outline-item-active" : ""}`}
					style={{ paddingInlineStart: 12 + Math.min(item.level - minimumLevel, 4) * 14 }}
					onClick={() => navigateTo(item.id)}
					title={item.text}
				>
					{item.text}
				</button>
			))}
		</nav>
	);
	const trigger = (
		<Button className="note-outline-mobile-trigger" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)}>
			目录
		</Button>
	);

	return (
		<>
			<aside className="note-outline-panel">
				<div className="note-outline-title">目录</div>
				{outlineList}
			</aside>
			{triggerHost ? createPortal(trigger, triggerHost) : null}
			<Drawer
				title="目录"
				placement="right"
				width={280}
				rootClassName={isDark ? "note-outline-drawer-dark" : ""}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			>
				{outlineList}
			</Drawer>
		</>
	);
};

export default NoteOutline;
