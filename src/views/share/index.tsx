import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Divider, Image, Input, Spin, Tag, Typography, message } from "antd";
import { CloudDownloadOutlined, FileImageOutlined, FileOutlined, FilePdfOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PublicShareFileDto, PublicShareNoteDto, ShareService, ShareTargetType } from "@/services/share/shareService";
import "../user/note/note.less";
import "./share.less";
import { isPreviewableImage } from "./filePreview";

const formatSize = (size: number) =>
	size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(2)} KB` : `${(size / 1024 / 1024).toFixed(2)} MB`;

const SharePage = () => {
	const { shareCode = "" } = useParams();
	const [loading, setLoading] = useState(true);
	const [needPassword, setNeedPassword] = useState(false);
	const [password, setPassword] = useState("");
	const [file, setFile] = useState<PublicShareFileDto>();
	const [filePreviewUrl, setFilePreviewUrl] = useState("");
	const [note, setNote] = useState<PublicShareNoteDto>();
	const [error, setError] = useState("");

	const loadContent = async (type: ShareTargetType) => {
		if (type === ShareTargetType.File) {
			setNote(undefined);
			setFile(await ShareService.fileInfo(shareCode));
		} else {
			setFile(undefined);
			setNote(await ShareService.note(shareCode));
		}
	};
	const load = async () => {
		setLoading(true);
		setError("");
		setNeedPassword(false);
		setFile(undefined);
		setNote(undefined);
		setFilePreviewUrl("");
		try {
			const status = await ShareService.status(shareCode);
			if (!status.requiresPassword) {
				await loadContent(status.targetType);
			} else if (!ShareService.hasAccessToken(shareCode)) {
				setNeedPassword(true);
			} else {
				try {
					await loadContent(status.targetType);
				} catch {
					ShareService.clearAccessToken(shareCode);
					setNeedPassword(true);
				}
			}
		} catch (e: any) {
			setError(e?.msg || "分享不存在或已失效");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		void load();
	}, [shareCode]);
	useEffect(() => {
		if (!note?.contentHtml) return;
		const documentNode = new DOMParser().parseFromString(note.contentHtml, "text/html");
		const images = Array.from(documentNode.querySelectorAll<HTMLImageElement>("img[data-file-id]"));
		const objectUrls: string[] = [];
		void Promise.all(
			images.map(async image => {
				const fileId = image.dataset.fileId;
				if (!fileId) return;
				const response = await ShareService.image(shareCode, fileId);
				const url = URL.createObjectURL(new Blob([response.data], { type: response.headers["content-type"] }));
				objectUrls.push(url);
				image.src = url;
			})
		)
			.then(() => setNote(value => (value ? { ...value, contentHtml: documentNode.body.innerHTML } : value)))
			.catch(() => undefined);
		return () => objectUrls.forEach(URL.revokeObjectURL);
	}, [note?.title, shareCode]);
	useEffect(() => {
		if (!file || !isPreviewableImage(file.contentType)) {
			setFilePreviewUrl("");
			return;
		}
		let objectUrl = "";
		void ShareService.fileContent(shareCode)
			.then(response => {
				objectUrl = URL.createObjectURL(new Blob([response.data], { type: file.contentType }));
				setFilePreviewUrl(objectUrl);
			})
			.catch(() => undefined);
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [file?.contentType, file?.name, shareCode]);
	const verify = async () => {
		try {
			setLoading(true);
			await ShareService.verify(shareCode, password);
			const status = await ShareService.status(shareCode);
			await loadContent(status.targetType);
			setNeedPassword(false);
		} catch {
			// 请求层已统一提示错误
		} finally {
			setLoading(false);
		}
	};
	const download = async () => {
		try {
			const response = await ShareService.download(shareCode);
			const url = URL.createObjectURL(new Blob([response.data]));
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = file?.name || "download";
			anchor.click();
			URL.revokeObjectURL(url);
		} catch {
			message.error("下载失败");
		}
	};
	const fileIcon = () => {
		if (isPreviewableImage(file?.contentType)) return <FileImageOutlined />;
		if (file?.contentType === "application/pdf") return <FilePdfOutlined />;
		return <FileOutlined />;
	};
	return (
		<div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 0" }}>
			<Card className="share-card">
				<a className="share-home-link" href="/">
					<HomeOutlined />
					返回首页
				</a>
				{loading && (
					<div style={{ textAlign: "center", padding: 64 }}>
						<Spin />
					</div>
				)}
				{!loading && error && <Typography.Text type="danger">{error}</Typography.Text>}
				{!loading && needPassword && (
					<div style={{ maxWidth: 360, margin: "48px auto" }}>
						<Typography.Title level={3}>该分享需要密码</Typography.Title>
						<Input.Password
							value={password}
							onChange={event => setPassword(event.target.value)}
							onPressEnter={() => void verify()}
							placeholder="请输入分享密码"
						/>
						<Button type="primary" block style={{ marginTop: 16 }} onClick={() => void verify()}>
							验证并访问
						</Button>
					</div>
				)}
				{!loading && file && (
					<article className="share-file">
						<div className="share-source">
							<span>来自</span>
							<strong>{file.ownerName || "分享者"}</strong>
							<span>的文件分享</span>
						</div>
						<header className="share-file-header">
							<div className="share-file-icon">{fileIcon()}</div>
							<div>
								<Typography.Title level={2}>{file.name}</Typography.Title>
								<Typography.Text type="secondary">可通过下方按钮保存到本地</Typography.Text>
							</div>
						</header>
						{filePreviewUrl && (
							<div className="share-file-preview">
								<Image src={filePreviewUrl} alt={file.name} preview />
							</div>
						)}
						<div className="share-file-meta">
							<div>
								<span>文件大小</span>
								<strong>{formatSize(file.size)}</strong>
							</div>
							<div>
								<span>文件格式</span>
								<strong>{file.contentType || "未知"}</strong>
							</div>
							<div>
								<span>有效期</span>
								<strong>{file.expiresAt ? dayjs(file.expiresAt).format("YYYY-MM-DD HH:mm:ss") : "永久有效"}</strong>
							</div>
						</div>
						<Button type="primary" size="large" icon={<CloudDownloadOutlined />} onClick={() => void download()}>
							下载文件
						</Button>
					</article>
				)}
				{!loading && note && (
					<article className="share-note">
						<header className="share-note-header">
							<div className="share-source">
								<span>来自</span>
								<strong>{note.ownerName || "分享者"}</strong>
								<span>的笔记分享</span>
							</div>
							<Typography.Title level={2}>{note.title}</Typography.Title>
							<div className="share-note-meta">
								<span>分类：{note.categoryName || "未分类"}</span>
								{note.tags.map(tag => (
									<Tag key={tag}>{tag}</Tag>
								))}
								<span>更新于：{note.updateTime ? dayjs(note.updateTime).format("YYYY-MM-DD HH:mm") : "-"}</span>
							</div>
						</header>
						<Divider />
						<div className="note-preview share-note-content" dangerouslySetInnerHTML={{ __html: note.contentHtml || "" }} />
					</article>
				)}
			</Card>
		</div>
	);
};
export default SharePage;
