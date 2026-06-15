import { useEffect, useState, useImperativeHandle, Ref } from "react";
import { Avatar, Button, Form, Input, Modal, Spin, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/lib/upload/interface";
import {
	deleteUserAvatarFile,
	getAvatarObjectUrl,
	getUserInfo,
	updateUserProfile,
	uploadUserAvatar,
	UserInfo
} from "@/api/modules/login";
import { ThemeConfigProp } from "@/redux/interface";
import { connect } from "react-redux";
import "./InfoModal.less";

interface Props {
	innerRef: Ref<{ showModal: (params: any) => void } | undefined>;
	themeConfig?: ThemeConfigProp;
	onUserInfoChange?: (userInfo: UserInfo) => void;
}

const InfoModal = (props: Props) => {
	const [form] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [avatarFileId, setAvatarFileId] = useState<number>();
	const [originalAvatarFileId, setOriginalAvatarFileId] = useState<number>();
	const [avatarSrc, setAvatarSrc] = useState("");
	const [modalUserInfo, setModalUserInfo] = useState<UserInfo>();
	const userInfo = modalUserInfo;
	const avatarText = userInfo?.nickName?.slice(0, 1) || userInfo?.userName?.slice(0, 1) || "-";
	const infoItems = [
		{
			label: "昵称",
			value: (
				<Form.Item name="nickName" noStyle rules={[{ required: true, message: "请输入昵称" }, { max: 50 }]}>
					<Input className="user-info-nickname-input" placeholder="请输入昵称" maxLength={50} />
				</Form.Item>
			)
		},
		{ label: "手机号码", value: userInfo?.phoneNumber || "-" },
		{ label: "邮箱", value: userInfo?.email || "-" },
		{ label: "部门", value: userInfo?.departmentName || "-" },
		{ label: "岗位", value: userInfo?.positionName || "-" }
	];

	useImperativeHandle(props.innerRef, () => ({
		showModal
	}));

	useEffect(() => {
		let objectUrl = "";
		let disposed = false;

		const loadAvatar = async () => {
			try {
				const nextAvatarSrc = await getAvatarObjectUrl(avatarFileId);
				if (disposed) {
					if (nextAvatarSrc.startsWith("blob:")) URL.revokeObjectURL(nextAvatarSrc);
					return;
				}
				objectUrl = nextAvatarSrc.startsWith("blob:") ? nextAvatarSrc : "";
				setAvatarSrc(nextAvatarSrc);
			} catch {
				setAvatarSrc("");
			}
		};

		loadAvatar();
		return () => {
			disposed = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [avatarFileId]);

	const showModal = async (params: { name: number }) => {
		setModalVisible(true);
		setModalUserInfo(undefined);
		setAvatarFileId(undefined);
		setOriginalAvatarFileId(undefined);
		form.resetFields();
		setLoading(true);
		try {
			const res = await getUserInfo();
			setModalUserInfo(res.data);
			setAvatarFileId(res.data?.avatarFileId);
			setOriginalAvatarFileId(res.data?.avatarFileId);
			form.setFieldsValue({ nickName: res.data?.nickName });
		} catch (error) {
			message.error("获取个人信息失败");
		} finally {
			setLoading(false);
		}
	};

	const cleanupUnsavedAvatar = async (targetAvatarFileId = avatarFileId) => {
		if (!targetAvatarFileId || targetAvatarFileId === originalAvatarFileId) return;

		try {
			await deleteUserAvatarFile(targetAvatarFileId);
		} catch {
			// Best effort cleanup; closing the modal should not be blocked by this.
		}
	};

	const handleCancel = () => {
		void cleanupUnsavedAvatar();
		setModalVisible(false);
	};

	const beforeAvatarUpload = async (file: RcFile) => {
		const isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type);
		if (!isImage) {
			message.warning("仅支持 JPG、PNG、GIF、WEBP 图片");
			return Upload.LIST_IGNORE;
		}
		if (file.size / 1024 / 1024 > 2) {
			message.warning("头像大小不能超过 2MB");
			return Upload.LIST_IGNORE;
		}

		setUploading(true);
		try {
			const previousAvatarFileId = avatarFileId;
			const res = await uploadUserAvatar(file as unknown as File);
			const nextAvatarFileId = res.data || undefined;
			setAvatarFileId(nextAvatarFileId);
			if (previousAvatarFileId && previousAvatarFileId !== originalAvatarFileId && previousAvatarFileId !== nextAvatarFileId) {
				void cleanupUnsavedAvatar(previousAvatarFileId);
			}
			message.success("头像上传成功");
		} catch (error) {
			message.error("头像上传失败");
		} finally {
			setUploading(false);
		}
		return Upload.LIST_IGNORE;
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			setSaving(true);
			const res = await updateUserProfile({
				nickName: values.nickName,
				avatarFileId
			});
			if (res.data) {
				const userInfoRes = await getUserInfo();
				setModalUserInfo(userInfoRes.data);
				setAvatarFileId(userInfoRes.data?.avatarFileId);
				setOriginalAvatarFileId(userInfoRes.data?.avatarFileId);
				form.setFieldsValue({ nickName: userInfoRes.data?.nickName });
				props.onUserInfoChange?.(userInfoRes.data);
				message.success("个人信息保存成功");
				setModalVisible(false);
			}
		} catch (error) {
			message.error("个人信息保存失败");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal
			title="个人信息"
			open={modalVisible}
			onCancel={handleCancel}
			destroyOnHidden={true}
			footer={null}
			width={620}
			className={`user-info-modal${props.themeConfig?.isDark ? " user-info-modal-dark" : ""}`}
		>
			<Spin spinning={loading}>
				<Form form={form}>
					<div className="user-info-profile">
						<Avatar className="user-info-avatar" size={72} src={avatarSrc}>
							{avatarText}
						</Avatar>
						<div className="user-info-main">
							<div className="user-info-name">{userInfo?.nickName || userInfo?.userName || "-"}</div>
							<div className="user-info-subtitle">
								{userInfo?.departmentName || "-"} · {userInfo?.positionName || "-"}
							</div>
						</div>
						<Upload accept="image/*" beforeUpload={beforeAvatarUpload} showUploadList={false}>
							<Button icon={<UploadOutlined />} loading={uploading}>
								上传头像
							</Button>
						</Upload>
					</div>
					<div className="user-info-list">
						{infoItems.map(item => (
							<div className="user-info-item" key={item.label}>
								<span className="user-info-label">{item.label}</span>
								<span className="user-info-value">{item.value}</span>
							</div>
						))}
					</div>
					<div className="user-info-actions">
						<Button onClick={handleCancel}>取消</Button>
						<Button type="primary" loading={saving} onClick={handleSave}>
							保存
						</Button>
					</div>
				</Form>
			</Spin>
		</Modal>
	);
};

const mapStateToProps = (state: any) => state.global;
export default connect(mapStateToProps)(InfoModal);
