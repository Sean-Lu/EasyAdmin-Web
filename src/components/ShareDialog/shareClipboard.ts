export const buildShareClipboardText = (link: string, password?: string) => {
	const normalizedPassword = password?.trim();
	return normalizedPassword ? `分享链接：${link}\n访问密码：${normalizedPassword}` : `分享链接：${link}`;
};
