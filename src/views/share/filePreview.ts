export const isPreviewableImage = (contentType?: string) => contentType?.toLowerCase().startsWith("image/") ?? false;
