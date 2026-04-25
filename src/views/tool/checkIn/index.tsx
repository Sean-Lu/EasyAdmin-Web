import { Component } from "react";
import { Card } from "antd";

import Calendar from "./Calendar";

import "./index.css";

// 签到组件
export default class CheckIn extends Component {
	render() {
		return (
			<>
				<div className="checkIn-container">
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
