export interface IconItem {
	name: string;
	label: string;
	category: string;
}

export interface IconCategory {
	name: string;
	label: string;
	icons: IconItem[];
}

export const iconCategories: IconCategory[] = [
	{
		name: "通用",
		label: "通用图标",
		icons: [
			{ name: "DashboardOutlined", label: "仪表盘", category: "通用" },
			{ name: "MenuOutlined", label: "菜单", category: "通用" },
			{ name: "UserOutlined", label: "用户", category: "通用" },
			{ name: "TeamOutlined", label: "团队", category: "通用" },
			{ name: "LockOutlined", label: "权限", category: "通用" },
			{ name: "SettingOutlined", label: "设置", category: "通用" },
			{ name: "LinkOutlined", label: "链接", category: "通用" },
			{ name: "SearchOutlined", label: "搜索", category: "通用" },
			{ name: "GithubOutlined", label: "Github", category: "通用" },
			{ name: "CodeOutlined", label: "代码", category: "通用" },
			{ name: "ToolOutlined", label: "工具", category: "通用" },
			{ name: "InfoOutlined", label: "信息", category: "通用" },
			{ name: "BellOutlined", label: "通知", category: "通用" }
		]
	},
	{
		name: "数据",
		label: "数据图表",
		icons: [
			{ name: "BarChartOutlined", label: "柱状图", category: "数据" },
			{ name: "LineChartOutlined", label: "折线图", category: "数据" },
			{ name: "PieChartOutlined", label: "饼图", category: "数据" },
			{ name: "RadarChartOutlined", label: "雷达图", category: "数据" },
			{ name: "TableOutlined", label: "表格", category: "数据" },
			{ name: "DatabaseOutlined", label: "数据库", category: "数据" }
		]
	},
	{
		name: "文件",
		label: "文件管理",
		icons: [
			{ name: "FileOutlined", label: "文件", category: "文件" },
			{ name: "FolderOutlined", label: "文件夹", category: "文件" },
			{ name: "FolderOpenOutlined", label: "打开文件夹", category: "文件" },
			{ name: "FileTextOutlined", label: "文本文档", category: "文件" },
			{ name: "FilePdfOutlined", label: "PDF", category: "文件" },
			{ name: "UploadOutlined", label: "上传", category: "文件" },
			{ name: "DownloadOutlined", label: "下载", category: "文件" },
			{ name: "ImportOutlined", label: "导入", category: "文件" },
			{ name: "ExportOutlined", label: "导出", category: "文件" }
		]
	},
	{
		name: "编辑",
		label: "编辑操作",
		icons: [
			{ name: "PlusOutlined", label: "添加", category: "编辑" },
			{ name: "MinusOutlined", label: "减少", category: "编辑" },
			{ name: "EditOutlined", label: "编辑", category: "编辑" },
			{ name: "DeleteOutlined", label: "删除", category: "编辑" },
			{ name: "CopyOutlined", label: "复制", category: "编辑" },
			{ name: "UndoOutlined", label: "撤销", category: "编辑" },
			{ name: "RedoOutlined", label: "重做", category: "编辑" },
			{ name: "EyeOutlined", label: "查看", category: "编辑" }
		]
	},
	{
		name: "导航",
		label: "导航箭头",
		icons: [
			{ name: "ArrowLeftOutlined", label: "箭头左", category: "导航" },
			{ name: "ArrowRightOutlined", label: "箭头右", category: "导航" },
			{ name: "ArrowUpOutlined", label: "箭头上", category: "导航" },
			{ name: "ArrowDownOutlined", label: "箭头下", category: "导航" }
		]
	},
	{
		name: "状态",
		label: "状态指示",
		icons: [
			{ name: "CheckCircleOutlined", label: "成功", category: "状态" },
			{ name: "CloseCircleOutlined", label: "关闭", category: "状态" },
			{ name: "ExclamationCircleOutlined", label: "警告", category: "状态" },
			{ name: "InfoCircleOutlined", label: "信息", category: "状态" },
			{ name: "PlayCircleOutlined", label: "播放", category: "状态" },
			{ name: "PauseCircleOutlined", label: "暂停", category: "状态" },
			{ name: "CheckSquareOutlined", label: "勾选方块", category: "状态" },
			{ name: "CloseSquareOutlined", label: "关闭方块", category: "状态" },
			{ name: "StarOutlined", label: "星标", category: "状态" },
			{ name: "HeartOutlined", label: "爱心", category: "状态" }
		]
	},
	{
		name: "布局",
		label: "布局相关",
		icons: [
			{ name: "OrderedListOutlined", label: "有序列表", category: "布局" },
			{ name: "UnorderedListOutlined", label: "无序列表", category: "布局" },
			{ name: "MenuUnfoldOutlined", label: "展开菜单", category: "布局" },
			{ name: "MenuFoldOutlined", label: "折叠菜单", category: "布局" },
			{ name: "AppstoreOutlined", label: "应用商店", category: "布局" }
		]
	},
	{
		name: "系统",
		label: "系统硬件",
		icons: [
			{ name: "CloudOutlined", label: "云", category: "系统" },
			{ name: "CloudServerOutlined", label: "云服务器", category: "系统" },
			{ name: "CloudUploadOutlined", label: "云上传", category: "系统" },
			{ name: "CloudDownloadOutlined", label: "云下载", category: "系统" },
			{ name: "MobileOutlined", label: "手机", category: "系统" },
			{ name: "TabletOutlined", label: "平板", category: "系统" },
			{ name: "LaptopOutlined", label: "电脑", category: "系统" },
			{ name: "MonitorOutlined", label: "显示器", category: "系统" },
			{ name: "PrinterOutlined", label: "打印机", category: "系统" },
			{ name: "CameraOutlined", label: "相机", category: "系统" },
			{ name: "PhoneOutlined", label: "电话", category: "系统" }
		]
	},
	{
		name: "安全",
		label: "安全相关",
		icons: [
			{ name: "LockOutlined", label: "锁定", category: "安全" },
			{ name: "UnlockOutlined", label: "解锁", category: "安全" },
			{ name: "KeyOutlined", label: "钥匙", category: "安全" },
			{ name: "BugOutlined", label: "Bug", category: "安全" },
			{ name: "ScanOutlined", label: "扫描", category: "安全" },
			{ name: "BarcodeOutlined", label: "条形码", category: "安全" },
			{ name: "QrcodeOutlined", label: "二维码", category: "安全" }
		]
	},
	{
		name: "时间",
		label: "时间日期",
		icons: [
			{ name: "CalendarOutlined", label: "日历", category: "时间" },
			{ name: "HourglassOutlined", label: "沙漏", category: "时间" },
			{ name: "HistoryOutlined", label: "历史", category: "时间" }
		]
	},
	{
		name: "通讯",
		label: "通讯社交",
		icons: [
			{ name: "MailOutlined", label: "邮件", category: "通讯" },
			{ name: "MessageOutlined", label: "消息", category: "通讯" },
			{ name: "CommentOutlined", label: "评论", category: "通讯" },
			{ name: "SendOutlined", label: "发送", category: "通讯" },
			{ name: "InboxOutlined", label: "收件箱", category: "通讯" },
			{ name: "TagOutlined", label: "标签", category: "通讯" }
		]
	},
	{
		name: "表情",
		label: "表情符号",
		icons: [
			{ name: "SmileOutlined", label: "笑脸", category: "表情" },
			{ name: "FrownOutlined", label: "哭脸", category: "表情" },
			{ name: "MehOutlined", label: "平静", category: "表情" },
			{ name: "LikeOutlined", label: "点赞", category: "表情" },
			{ name: "DislikeOutlined", label: "点踩", category: "表情" },
			{ name: "HeartOutlined", label: "爱心", category: "表情" },
			{ name: "StarOutlined", label: "星星", category: "表情" }
		]
	},
	{
		name: "购物",
		label: "购物商务",
		icons: [
			{ name: "ShoppingCartOutlined", label: "购物车", category: "购物" },
			{ name: "WalletOutlined", label: "钱包", category: "购物" },
			{ name: "CreditCardOutlined", label: "信用卡", category: "购物" },
			{ name: "GiftOutlined", label: "礼物", category: "购物" }
		]
	},
	{
		name: "媒体",
		label: "媒体娱乐",
		icons: [
			{ name: "CameraOutlined", label: "相机", category: "媒体" },
			{ name: "VideoCameraOutlined", label: "视频", category: "媒体" }
		]
	},
	{
		name: "天气",
		label: "天气自然",
		icons: [
			{ name: "SunOutlined", label: "太阳", category: "天气" },
			{ name: "MoonOutlined", label: "月亮", category: "天气" },
			{ name: "CloudOutlined", label: "云朵", category: "天气" }
		]
	},
	{
		name: "交通工具",
		label: "交通工具",
		icons: [
			{ name: "CarOutlined", label: "汽车", category: "交通工具" },
			{ name: "TruckOutlined", label: "卡车", category: "交通工具" },
			{ name: "RocketOutlined", label: "火箭", category: "交通工具" }
		]
	},
	{
		name: "食物",
		label: "食物饮料",
		icons: [
			{ name: "CoffeeOutlined", label: "咖啡", category: "食物" },
			{ name: "AppleOutlined", label: "苹果", category: "食物" }
		]
	}
];

export const getAllIcons = (): IconItem[] => {
	return iconCategories.flatMap(category => category.icons);
};

export const getMenuIconOptions = (): { value: string; label: string }[] => {
	return getAllIcons().map(icon => ({
		value: icon.name,
		label: icon.label
	}));
};
