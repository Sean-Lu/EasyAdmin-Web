import { message } from "antd";
import { store } from "@/redux";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";
import { captureLoginRedirect } from "@/utils/authRedirect";
import { clearLockRuntime } from "@/utils/lockStorage";

/** 统一处理登录凭证过期 */
export function handleTokenExpired() {
	message.info("登录已过期，请您重新登录！");
	store.dispatch(setToken(""));
	store.dispatch(setTabsList([]));
	clearLockRuntime();
	localStorage.removeItem("refreshToken");
	captureLoginRedirect(window.location.hash.slice(1));
	window.location.hash = "/login";
}
