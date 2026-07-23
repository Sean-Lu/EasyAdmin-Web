import React from "react";
import { Button, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { ParamValueType, parseParamValue, serializeParamValue } from "./paramValueUtils";

const { TextArea } = Input;
const valueTypeOptions = [
	{ value: ParamValueType.String, label: "字符串" },
	{ value: ParamValueType.Boolean, label: "布尔值" },
	{ value: ParamValueType.Number, label: "数字" }
];

const ParamValueInput = () => (
	<Form.Item noStyle shouldUpdate={(prev, current) => prev.valueType !== current.valueType}>
		{({ getFieldValue }) => {
			const valueType = getFieldValue("valueType");
			const control =
				valueType === ParamValueType.Boolean ? (
					<Switch checkedChildren="是" unCheckedChildren="否" />
				) : valueType === ParamValueType.Number ? (
					<InputNumber style={{ width: "100%" }} />
				) : (
					<Input placeholder="请输入参数值" />
				);
			return (
				<Form.Item
					name="paramValue"
					label="参数键值"
					valuePropName={valueType === ParamValueType.Boolean ? "checked" : "value"}
					rules={valueType === ParamValueType.Boolean ? [] : [{ required: true }]}
				>
					{control}
				</Form.Item>
			);
		}}
	</Form.Item>
);

// 参数编辑弹窗
export default class ParamEdit extends React.Component {
	render() {
		const { modalVisible, onCancel, onSubmit, record } = this.props;
		const valueType = record?.valueType ?? ParamValueType.String;
		return (
			<Modal open={modalVisible} title="修改参数信息" footer={null} destroyOnHidden onCancel={onCancel}>
				<Form
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 17 }}
					layout="horizontal"
					onFinish={values => onSubmit({ ...values, paramValue: serializeParamValue(values.paramValue, values.valueType) })}
					initialValues={{ ...record, valueType, paramValue: parseParamValue(record?.paramValue, valueType) }}
				>
					<Form.Item name="paramName" label="参数名称" rules={[{ required: true }]}>
						<Input placeholder="请输入参数名称" />
					</Form.Item>
					<Form.Item name="paramKey" label="参数键名" rules={[{ required: true }]}>
						<Input placeholder="请输入参数键名" />
					</Form.Item>
					<Form.Item name="valueType" label="参数类型" rules={[{ required: true }]}>
						<Select options={valueTypeOptions} />
					</Form.Item>
					<ParamValueInput />
					<Form.Item name="remark" label="备注">
						<TextArea placeholder="请输入备注" autoSize={{ minRows: 3, maxRows: 5 }} />
					</Form.Item>
					<Form.Item name="state" label="状态" valuePropName="checked">
						<Switch checkedChildren="启用" unCheckedChildren="禁用" />
					</Form.Item>
					<Form.Item style={{ margin: "20px 0 0 120px" }}>
						<Button onClick={onCancel}>取消</Button>
						<Button type="primary" htmlType="submit" style={{ marginLeft: 4 }}>
							确定
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}
