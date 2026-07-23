export const ParamValueType = {
	String: 0,
	Boolean: 1,
	Number: 2
};

export const parseParamValue = (value, valueType) => {
	if (valueType === ParamValueType.Boolean) return value === true || value === "true";
	if (valueType === ParamValueType.Number)
		return value === "" || value === null || value === undefined ? undefined : Number(value);
	return value ?? "";
};

export const serializeParamValue = (value, valueType) => {
	if (valueType === ParamValueType.Boolean) return value ? "true" : "false";
	return value === null || value === undefined ? "" : String(value);
};
