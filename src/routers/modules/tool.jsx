import { LayoutIndex } from "@/routers/constant";
import lazyLoad from "@/routers/utils/lazyLoad";
import React from "react";

// 工具模块
const toolRouter = [
	{
		element: <LayoutIndex />,
		meta: {
			title: "工具"
		},
		children: [
			{
				path: "/tool/crypto",
				element: lazyLoad(React.lazy(() => import("@/views/tool/crypto/index"))),
				meta: {
					requiresAuth: true,
					title: "加解密",
					key: "tool-crypto"
				}
			},
			{
				path: "/tool/codeGen",
				element: lazyLoad(React.lazy(() => import("@/views/tool/codeGen/CodeGen"))),
				meta: {
					requiresAuth: true,
					title: "代码生成",
					key: "tool-codeGen"
				}
			},
			{
				path: "/tool/commonTools",
				element: lazyLoad(React.lazy(() => import("@/views/tool/commonTools/index"))),
				meta: {
					requiresAuth: true,
					title: "百宝箱",
					key: "tool-commonTools"
				}
			}
		]
	}
];

export default toolRouter;
