import React from "react";
import { Card, Button, Form, Input, Row, Col } from "antd";
import { PlayCircleOutlined, SettingOutlined } from "@ant-design/icons";

interface GenConfigPanelProps {
	genParams: {
		packageName: string;
		moduleName: string;
		author: string;
		tablePrefix: string;
	};
	onParamsChange: (params: Partial<GenConfigPanelProps["genParams"]>) => void;
	onGenerate: () => void;
}

/**
 * 生成配置面板
 */
const GenConfigPanel: React.FC<GenConfigPanelProps> = ({ genParams, onParamsChange, onGenerate }) => {
	return (
		<Card
			title={
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<SettingOutlined style={{ fontSize: 16 }} />
					<span>生成配置</span>
				</div>
			}
			bordered
			style={{ borderRadius: 8 }}
		>
			<Form layout="vertical">
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item label="包名">
							<Input
								value={genParams.packageName}
								onChange={e => onParamsChange({ packageName: e.target.value })}
								placeholder="com.example"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="模块名">
							<Input
								value={genParams.moduleName}
								onChange={e => onParamsChange({ moduleName: e.target.value })}
								placeholder="system"
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item label="作者">
							<Input
								value={genParams.author}
								onChange={e => onParamsChange({ author: e.target.value })}
								placeholder="请输入作者名"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="表前缀">
							<Input
								value={genParams.tablePrefix}
								onChange={e => onParamsChange({ tablePrefix: e.target.value })}
								placeholder="t_（选填，用于移除表名前缀）"
							/>
						</Form.Item>
					</Col>
				</Row>
				<Button type="primary" block size="large" icon={<PlayCircleOutlined />} onClick={onGenerate}>
					生成代码
				</Button>
			</Form>
		</Card>
	);
};

export default GenConfigPanel;
