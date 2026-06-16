import { Component } from "react";
import { Card } from "antd";
import { connect } from "react-redux";

import Calendar from "./Calendar";

import "./index.css";

// 签到组件
class CheckIn extends Component<any> {
	render() {
		const { themeConfig } = this.props.global;

		return (
			<>
				<div className={`checkIn-container${themeConfig.isDark ? " checkIn-dark" : ""}`}>
					<div className="checkIn-content">
						<Card
							style={{
								width: 450
							}}
							styles={{ body: { padding: 8 } }}
						>
							<Calendar />
						</Card>
					</div>
				</div>
			</>
		);
	}
}

const mapStateToProps = (state: any) => state;
export default connect(mapStateToProps)(CheckIn);
