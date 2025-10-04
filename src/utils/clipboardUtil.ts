import { message } from "antd";
import copy from "copy-to-clipboard";

export default class clipboardUtil {
	// static copyString = (text: string) => {
	// 	// navigator.clipboard: Available only in secure contexts.
	// 	// 安全上下文通常指的是通过HTTPS协议访问的页面，或者是通过localhost（包括127.0.0.1）访问的页面。
	// 	navigator.clipboard
	// 		.writeText(text)
	// 		.then(() => {
	// 			message.success("复制成功");
	// 		})
	// 		.catch(err => {
	// 			message.success("复制失败");
	// 		});
	// };

	static copyString = (text: string) => {
		copy(text);
		message.success("复制成功");
	};
}
