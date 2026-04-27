import React from "react";
import { Button, Form, Input, Modal, Select, Switch, InputNumber, Row, Col } from "antd";

const { TextArea } = Input;

// 定时任务新增弹窗
export default class ScheduleJobAdd extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			scheduleType: 1,
			simpleInterval: 1,
			simpleIntervalUnit: 1
		};
		this.formRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		// 当弹窗从关闭变为打开时，重置状态
		if (!prevProps.modalVisible && this.props.modalVisible) {
			this.setState({
				scheduleType: 1,
				simpleInterval: 1,
				simpleIntervalUnit: 1
			});
			if (this.formRef.current) {
				this.formRef.current.resetFields();
			}
		}
	}

	handleScheduleTypeChange = value => {
		this.setState({ scheduleType: value });
	};

	handleSimpleIntervalChange = value => {
		this.setState({ simpleInterval: value });
	};

	handleSimpleIntervalUnitChange = value => {
		this.setState({ simpleIntervalUnit: value });
	};

	render() {
		const { modalVisible, onCancel, onSubmit } = this.props;
		const { scheduleType, simpleInterval, simpleIntervalUnit } = this.state;
		return (
			<Modal open={modalVisible} title="新增定时任务" footer={null} destroyOnHidden={true} onCancel={onCancel} width={600}>
				<Form
					ref={this.formRef}
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={onSubmit}
					initialValues={{
						scheduleType: 1,
						state: false
					}}
				>
					<Form.Item name="jobName" label="任务名称" rules={[{ required: true, message: "请输入任务名称" }]}>
						<Input placeholder="请输入任务名称" />
					</Form.Item>
					<Form.Item name="scheduleType" label="调度类型" rules={[{ required: true, message: "请选择调度类型" }]}>
						<Select
							placeholder="请选择调度类型"
							options={[
								{ value: 0, label: "简单调度" },
								{ value: 1, label: "Cron调度" }
							]}
							onChange={this.handleScheduleTypeChange}
						/>
					</Form.Item>
					{scheduleType === 1 && (
						<Form.Item name="cronExpression" label="Cron表达式" rules={[{ required: true, message: "请输入Cron表达式" }]}>
							<Input placeholder="请输入Cron表达式，例如：0 0/5 * * * ?" />
						</Form.Item>
					)}
					{scheduleType === 0 && (
						<Form.Item label="执行间隔" required>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item name="simpleInterval" noStyle rules={[{ required: true, message: "请输入执行间隔" }]}>
										<InputNumber
											min={1}
											max={3600}
											value={simpleInterval}
											onChange={this.handleSimpleIntervalChange}
											placeholder="间隔值"
											style={{ width: "100%" }}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name="simpleIntervalUnit" noStyle rules={[{ required: true, message: "请选择时间单位" }]}>
										<Select
											value={simpleIntervalUnit}
											onChange={this.handleSimpleIntervalUnitChange}
											options={[
												{ value: 0, label: "秒" },
												{ value: 1, label: "分钟" },
												{ value: 2, label: "小时" },
												{ value: 3, label: "天" }
											]}
											style={{ width: "100%" }}
										/>
									</Form.Item>
								</Col>
							</Row>
						</Form.Item>
					)}
					<Form.Item name="jobClassName" label="任务类名" rules={[{ required: true, message: "请输入任务类名" }]}>
						<Input placeholder="请输入任务类完整命名空间，例如：EasyAdmin.Web.Jobs.TestJob" />
					</Form.Item>
					<Form.Item name="jobData" label="任务参数">
						<TextArea placeholder="请输入任务参数（JSON格式）" autoSize={{ minRows: 3, maxRows: 5 }} />
					</Form.Item>
					<Form.Item name="description" label="描述">
						<TextArea placeholder="请输入任务描述" autoSize={{ minRows: 2, maxRows: 4 }} />
					</Form.Item>
					<Form.Item name="state" label="状态" valuePropName="checked">
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button key="cancel" onClick={onCancel}>
							取消
						</Button>
						<Button key="submit" type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
							确定
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
