// * Echarts 按需引入
// 系列类型的定义后缀都为 SeriesOption
// 组件类型的定义后缀都为 ComponentOption
import * as echarts from "echarts/core";
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption } from "echarts/charts";
import {
	// 数据集组件
	DatasetComponent,
	DatasetComponentOption,
	GridComponent,
	GridComponentOption,
	LegendComponent,
	TitleComponent,
	TitleComponentOption,
	TooltipComponent,
	TooltipComponentOption,
	// 内置数据转换器组件 (filter, sort)
	TransformComponent
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type ECOption = echarts.ComposeOption<
	| BarSeriesOption
	| LineSeriesOption
	| TitleComponentOption
	| TooltipComponentOption
	| GridComponentOption
	| DatasetComponentOption
>;

// 注册必须的组件
echarts.use([
	LegendComponent,
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent,
	BarChart,
	LineChart,
	LabelLayout,
	UniversalTransition,
	CanvasRenderer
]);

export default echarts;
