import React from "react";
import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import { RouteObject } from "@/routers/interface";

const aiRouter: RouteObject[] = [
	{
		element: <LayoutIndex />,
		meta: { title: "AI 助手" },
		children: [
			{
				path: "/ai/assistant",
				element: lazyLoad(React.lazy(() => import("@/views/ai/workbench"))),
				meta: { requiresAuth: true, title: "AI 助手", key: "ai-assistant" }
			}
		]
	}
];

export default aiRouter;
