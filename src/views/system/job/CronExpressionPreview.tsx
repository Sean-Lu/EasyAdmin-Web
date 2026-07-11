import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Space, Tag, Typography } from "antd";
import { calculateCronRuns } from "../../tool/commonTools/tools/cronTester/calculateCronRuns";
import { validateQuartzCron } from "../../tool/commonTools/tools/cronTester/utils";

interface CronExpressionPreviewProps {
	expression?: string;
	showValidation?: boolean;
	showValidTag?: boolean;
}

const CronExpressionPreview: React.FC<CronExpressionPreviewProps> = ({
	expression = "",
	showValidation = true,
	showValidTag = false
}) => {
	const [nextRun, setNextRun] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const calculationToken = useRef(0);
	const validation = useMemo(() => validateQuartzCron(expression), [expression]);

	useEffect(() => {
		calculationToken.current += 1;
		setNextRun(null);
		setLoading(false);
	}, [expression]);

	const handlePreview = async () => {
		if (!validation.valid) return;
		const token = ++calculationToken.current;
		setNextRun(null);
		setLoading(true);
		try {
			const runs = await calculateCronRuns(expression, 1);
			if (token === calculationToken.current) setNextRun(runs[0] ?? null);
		} finally {
			if (token === calculationToken.current) setLoading(false);
		}
	};

	return (
		<div className="cron-expression-preview" style={{ marginTop: 0, marginBottom: 8 }}>
			<Space wrap>
				<Button size="small" onClick={handlePreview} loading={loading} disabled={!validation.valid || loading}>
					预览下次执行
				</Button>
				{((showValidation && expression) || (showValidTag && expression && validation.valid)) &&
					expression &&
					(validation.valid ? (
						<Tag color="success">Cron 表达式有效</Tag>
					) : (
						<Typography.Text type="danger">{validation.error}</Typography.Text>
					))}
			</Space>
			{nextRun && (
				<Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
					下次执行：{new Date(nextRun).toLocaleString("zh-CN", { hour12: false })}
				</Typography.Text>
			)}
		</div>
	);
};

export default CronExpressionPreview;
