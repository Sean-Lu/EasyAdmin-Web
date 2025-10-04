/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from "react";

// 错误边界组件
export default class ErrorBoundary extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			hasError: false
		};
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		console.error("ErrorBoundary 捕获异常:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return <p style={{ color: "red", fontWeight: "bold" }}>出错啦(´･ω･`)</p>;
		}

		return this.props.children;
	}
}
