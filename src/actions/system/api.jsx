export const api = {
	// 租户管理
	tenant: {
		add: "/tenant/add",
		delete: "/tenant/delete",
		update: "/tenant/update",
		updateState: "/tenant/updateState",
		page: "/tenant/page",
		detail: "/tenant/detail"
	},
	// 用户管理
	user: {
		add: "/user/add",
		delete: "/user/delete",
		update: "/user/update",
		updateState: "/user/updateState",
		page: "/user/page",
		list: "/user/list",
		detail: "/user/detail",
		resetPassword: "/user/resetPassword" // 重置密码
	},
	// 菜单管理
	menu: {
		add: "/menu/add",
		delete: "/menu/delete",
		update: "/menu/update",
		updateState: "/menu/updateState",
		listTree: "/menu/listTree?all=true", // 查询所有菜单（包含被禁用的）
		detail: "/menu/detail"
	},
	// 参数管理
	param: {
		add: "/param/add",
		delete: "/param/delete",
		update: "/param/update",
		updateState: "/param/updateState",
		page: "/param/page",
		detail: "/param/detail"
	},
	// 任务管理
	task: {
		add: "/task/add",
		delete: "/task/delete",
		update: "/task/update",
		updateState: "/task/updateState",
		page: "/task/page",
		detail: "/task/detail"
	},
	// 登录日志
	loginLog: {
		delete: "/loginLog/delete",
		page: "/loginLog/page",
		detail: "/loginLog/detail"
	},
	// 操作日志
	operateLog: {
		delete: "/operateLog/delete",
		page: "/operateLog/page",
		detail: "/operateLog/detail"
	}
};
