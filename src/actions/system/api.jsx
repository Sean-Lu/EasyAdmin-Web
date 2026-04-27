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
		resetPassword: "/user/resetPassword", // 重置密码
		assignRoles: "/user/assignRoles", // 分配用户角色
		getUserRoleIds: "/user/getUserRoleIds" // 查询用户已分配的角色ID列表
	},
	// 角色管理
	role: {
		add: "/role/add",
		delete: "/role/delete",
		update: "/role/update",
		updateState: "/role/updateState",
		page: "/role/page",
		list: "/role/list",
		detail: "/role/detail",
		assignMenus: "/role/assignMenus", // 分配角色菜单权限
		getRoleMenuIds: "/role/getRoleMenuIds", // 查询角色已分配的菜单ID列表
		getRoleMenus: "/role/getRoleMenus" // 查询角色已分配的菜单列表
	},
	// 菜单管理
	menu: {
		add: "/menu/add",
		delete: "/menu/delete",
		update: "/menu/update",
		updateState: "/menu/updateState",
		listTree: "/menu/listTree",
		detail: "/menu/detail"
	},
	// 部门管理
	department: {
		add: "/department/add",
		delete: "/department/delete",
		update: "/department/update",
		updateState: "/department/updateState",
		listTree: "/department/listTree",
		detail: "/department/detail"
	},
	// 岗位管理
	position: {
		add: "/position/add",
		delete: "/position/delete",
		update: "/position/update",
		updateState: "/position/updateState",
		page: "/position/page",
		list: "/position/list",
		detail: "/position/detail"
	},
	// 字典类型管理
	dictType: {
		add: "/sysDictType/add",
		delete: "/sysDictType/delete",
		update: "/sysDictType/update",
		updateState: "/sysDictType/updateState",
		page: "/sysDictType/page",
		list: "/sysDictType/list",
		detail: "/sysDictType/detail"
	},
	// 字典数据管理
	dictData: {
		add: "/sysDictData/add",
		delete: "/sysDictData/delete",
		update: "/sysDictData/update",
		updateState: "/sysDictData/updateState",
		page: "/sysDictData/page",
		getByTypeCode: "/sysDictData/getByTypeCode",
		detail: "/sysDictData/detail"
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
	// 定时任务
	scheduleJob: {
		add: "/scheduleJob/add",
		delete: "/scheduleJob/delete",
		update: "/scheduleJob/update",
		updateState: "/scheduleJob/updateState",
		runOnce: "/scheduleJob/runOnce",
		page: "/scheduleJob/page",
		detail: "/scheduleJob/detail",
		deleteLog: "/scheduleJob/deleteLog",
		clearLog: "/scheduleJob/clearLog",
		logPage: "/scheduleJob/logPage",
		logDetail: "/scheduleJob/logDetail"
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
