import { Modal } from "antd";
import dayjs from "dayjs";

// 角色详情弹窗
export default function RoleDetail({ modalVisible = false, onCancel = () => {}, record = {} }) {
	const formatTime = time => {
		return time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "-";
	};

	return (
		<Modal open={modalVisible} title="查看角色信息" footer={null} destroyOnHidden={true} onCancel={onCancel} width={600}>
			<div style={{ paddingLeft: 24 }}>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>角色名称:</label>
					<span>{record?.name || "-"}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>角色编码:</label>
					<span>{record?.code || "-"}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>角色描述:</label>
					<span>{record?.description || "-"}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>排序:</label>
					<span>{record?.sort || "-"}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>状态:</label>
					<span style={{ color: record?.state === 1 ? "#108ee9" : "#f50" }}>{record?.state === 1 ? "启用" : "禁用"}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>创建时间:</label>
					<span>{formatTime(record?.createTime)}</span>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: "inline-block", width: 80, fontWeight: "bold" }}>更新时间:</label>
					<span>{formatTime(record?.updateTime)}</span>
				</div>
			</div>
		</Modal>
	);
}
