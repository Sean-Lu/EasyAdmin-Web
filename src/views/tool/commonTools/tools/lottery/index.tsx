import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowLeftOutlined,
	ClearOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	ReloadOutlined,
	RocketOutlined,
	StopOutlined,
	UploadOutlined
} from "@ant-design/icons";
import { Button, Empty, Form, InputNumber, Popconfirm, Space, Table, Tabs, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import { BackendId, BackendIdInput, CommonState } from "@/api/interface";
import { LotteryActivity, LotteryParticipant, LotteryPrize, LotteryService, LotteryWinner } from "@/services/tool/lotteryService";
import DrawStage from "./components/DrawStage";
import { ActivityModal, ImportModal, ParticipantModal, PrizeModal } from "./components/LotteryForms";
import {
	ActivityFormValues,
	createRollingNames,
	defaultActivityValues,
	defaultParticipantValues,
	defaultPrizeValues,
	formatTime,
	getDrawLimit,
	idKey,
	normalizeDrawCount,
	ParticipantFormValues,
	PrizeFormValues
} from "./model";
import "./index.less";

interface LotteryProps {
	onBack?: () => void;
}

// 抽奖工具
const Lottery: React.FC<LotteryProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [activities, setActivities] = useState<LotteryActivity[]>([]);
	const [selectedActivity, setSelectedActivity] = useState<LotteryActivity | null>(null);
	const [prizes, setPrizes] = useState<LotteryPrize[]>([]);
	const [participants, setParticipants] = useState<LotteryParticipant[]>([]);
	const [winners, setWinners] = useState<LotteryWinner[]>([]);
	const [loading, setLoading] = useState(false);
	const [detailLoading, setDetailLoading] = useState(false);
	const [activityModalOpen, setActivityModalOpen] = useState(false);
	const [prizeModalOpen, setPrizeModalOpen] = useState(false);
	const [participantModalOpen, setParticipantModalOpen] = useState(false);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [editingActivity, setEditingActivity] = useState<LotteryActivity | null>(null);
	const [editingPrize, setEditingPrize] = useState<LotteryPrize | null>(null);
	const [editingParticipant, setEditingParticipant] = useState<LotteryParticipant | null>(null);
	const [saving, setSaving] = useState(false);
	const [importContent, setImportContent] = useState("");
	const [drawCountMap, setDrawCountMap] = useState<Record<string, number>>({});
	const [drawingPrizeId, setDrawingPrizeId] = useState<BackendId | null>(null);
	const [rollingNames, setRollingNames] = useState<string[]>([]);
	const [latestWinners, setLatestWinners] = useState<LotteryWinner[]>([]);
	const [stopping, setStopping] = useState(false);
	const rollingTimerRef = useRef<number | null>(null);
	const rollingIndexRef = useRef(0);
	const [activityForm] = Form.useForm<ActivityFormValues>();
	const [prizeForm] = Form.useForm<PrizeFormValues>();
	const [participantForm] = Form.useForm<ParticipantFormValues>();

	const winnerCountByPrize = useMemo(() => {
		return winners.reduce<Record<string, number>>((map, winner) => {
			const key = idKey(winner.prizeId);
			map[key] = (map[key] || 0) + 1;
			return map;
		}, {});
	}, [winners]);

	const clearRollingTimer = () => {
		if (rollingTimerRef.current) {
			window.clearInterval(rollingTimerRef.current);
		}
		rollingTimerRef.current = null;
	};

	const fetchActivities = useCallback(async () => {
		setLoading(true);
		try {
			const response = await LotteryService.getActivityList();
			if (response.success) {
				setActivities(response.data || []);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchDetail = useCallback(async (activityId: BackendIdInput) => {
		setDetailLoading(true);
		try {
			const response = await LotteryService.getActivityDetail(activityId);
			if (response.success) {
				const detail = response.data;
				setSelectedActivity(detail.activity || null);
				setPrizes(detail.prizes || []);
				setParticipants(detail.participants || []);
				setWinners(detail.winners || []);
				setLatestWinners([]);
			}
		} finally {
			setDetailLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchActivities();
		return () => clearRollingTimer();
	}, [fetchActivities]);

	const openActivityModal = (activity?: LotteryActivity) => {
		setEditingActivity(activity || null);
		activityForm.setFieldsValue(activity || defaultActivityValues);
		setActivityModalOpen(true);
	};

	const saveActivity = async () => {
		const values = await activityForm.validateFields();
		const editingActivityId = editingActivity?.id;
		setSaving(true);
		try {
			const payload = {
				...values,
				name: values.name.trim(),
				description: values.description?.trim() || ""
			};
			const response = editingActivity
				? await LotteryService.updateActivity({ ...payload, id: editingActivity.id })
				: await LotteryService.addActivity(payload);
			if (response.success) {
				message.success(editingActivity ? "活动已更新" : "活动已创建");
				setActivityModalOpen(false);
				await fetchActivities();
				if (editingActivityId && selectedActivity?.id === editingActivityId) {
					await fetchDetail(editingActivityId);
				}
			}
		} finally {
			setSaving(false);
		}
	};

	const deleteActivity = async (id: BackendIdInput) => {
		const response = await LotteryService.deleteActivity(id);
		if (response.success) {
			message.success("活动已删除");
			if (selectedActivity?.id === id) {
				setSelectedActivity(null);
			}
			await fetchActivities();
		}
	};

	const openPrizeModal = (prize?: LotteryPrize) => {
		if (!selectedActivity) return;
		setEditingPrize(prize || null);
		prizeForm.setFieldsValue(prize || { ...defaultPrizeValues, activityId: selectedActivity.id });
		setPrizeModalOpen(true);
	};

	const savePrize = async () => {
		if (!selectedActivity) return;
		const values = await prizeForm.validateFields();
		setSaving(true);
		try {
			const payload = {
				...values,
				activityId: selectedActivity.id,
				name: values.name.trim(),
				description: values.description?.trim() || "",
				quota: values.quota || 1,
				sort: values.sort || 0
			};
			const response = editingPrize
				? await LotteryService.updatePrize({ ...payload, id: editingPrize.id })
				: await LotteryService.addPrize(payload);
			if (response.success) {
				message.success(editingPrize ? "奖项已更新" : "奖项已创建");
				setPrizeModalOpen(false);
				await fetchDetail(selectedActivity.id);
			}
		} finally {
			setSaving(false);
		}
	};

	const deletePrize = async (id: BackendIdInput) => {
		if (!selectedActivity) return;
		const response = await LotteryService.deletePrize(id);
		if (response.success) {
			message.success("奖项已删除");
			await fetchDetail(selectedActivity.id);
		}
	};

	const openParticipantModal = (participant?: LotteryParticipant) => {
		if (!selectedActivity) return;
		setEditingParticipant(participant || null);
		participantForm.setFieldsValue(participant || { ...defaultParticipantValues, activityId: selectedActivity.id });
		setParticipantModalOpen(true);
	};

	const saveParticipant = async () => {
		if (!selectedActivity) return;
		const values = await participantForm.validateFields();
		setSaving(true);
		try {
			const payload = {
				...values,
				activityId: selectedActivity.id,
				name: values.name.trim(),
				code: values.code?.trim() || "",
				description: values.description?.trim() || "",
				sort: values.sort || 0
			};
			const response = editingParticipant
				? await LotteryService.updateParticipant({ ...payload, id: editingParticipant.id })
				: await LotteryService.addParticipant(payload);
			if (response.success) {
				message.success(editingParticipant ? "参与人已更新" : "参与人已添加");
				setParticipantModalOpen(false);
				await fetchDetail(selectedActivity.id);
			}
		} finally {
			setSaving(false);
		}
	};

	const deleteParticipant = async (id: BackendIdInput) => {
		if (!selectedActivity) return;
		const response = await LotteryService.deleteParticipant(id);
		if (response.success) {
			message.success("参与人已删除");
			await fetchDetail(selectedActivity.id);
		}
	};

	const importParticipants = async () => {
		if (!selectedActivity) return;
		const content = importContent.trim();
		if (!content) {
			message.warning("请粘贴参与人名单");
			return;
		}

		setSaving(true);
		try {
			const response = await LotteryService.importParticipants(selectedActivity.id, content);
			if (response.success) {
				message.success(`已导入 ${response.data || 0} 人`);
				setImportModalOpen(false);
				setImportContent("");
				await fetchDetail(selectedActivity.id);
			}
		} finally {
			setSaving(false);
		}
	};

	const getRollingCandidates = (prizeId: BackendId) => {
		// 与后端规则保持一致：不允许重复中奖时排除本活动全部中奖人，允许时只排除当前奖项中奖人。
		const winnerParticipantIds = new Set(
			winners
				.filter(winner => !selectedActivity?.allowRepeatWinner || idKey(winner.prizeId) === idKey(prizeId))
				.map(winner => idKey(winner.participantId))
		);

		return participants.filter(
			participant => participant.state === CommonState.Enable && !winnerParticipantIds.has(idKey(participant.id))
		);
	};

	const startDraw = (prize: LotteryPrize) => {
		if (!selectedActivity) return;
		const winnerCount = winnerCountByPrize[idKey(prize.id)] || 0;
		const candidates = getRollingCandidates(prize.id);
		const drawLimit = getDrawLimit(prize.quota, winnerCount, candidates.length);
		const drawCount = normalizeDrawCount(drawCountMap[idKey(prize.id)], prize.quota, winnerCount, candidates.length);

		if (drawLimit < 1) {
			message.warning(winnerCount >= prize.quota ? "该奖项名额已抽完" : "暂无可抽取的参与人");
			return;
		}

		// 前端只负责现场滚动效果，最终中奖名单仍由停止时的后端接口生成。
		clearRollingTimer();
		setLatestWinners([]);
		setDrawingPrizeId(prize.id);
		setDrawCountMap(prev => ({ ...prev, [idKey(prize.id)]: drawCount }));
		rollingIndexRef.current = 0;
		setRollingNames(createRollingNames(candidates, drawCount, 0));
		rollingTimerRef.current = window.setInterval(() => {
			rollingIndexRef.current = (rollingIndexRef.current + 1) % candidates.length;
			setRollingNames(createRollingNames(candidates, drawCount, rollingIndexRef.current));
		}, 80);
	};

	const stopDraw = async (prize: LotteryPrize) => {
		if (!selectedActivity) return;
		const count = drawCountMap[idKey(prize.id)] || 1;
		clearRollingTimer();
		setStopping(true);
		try {
			// 停止按钮才调用后端开奖；这样现场滚动可以反复展示，但只有停止结果会落库。
			const response = await LotteryService.draw(selectedActivity.id, prize.id, count);
			if (response.success) {
				const drawnWinners = response.data || [];
				setLatestWinners(drawnWinners);
				setRollingNames(drawnWinners.length > 0 ? drawnWinners.map(item => item.winnerNameSnapshot) : ["未抽中"]);
				await fetchDetail(selectedActivity.id);
			}
		} finally {
			setStopping(false);
			setDrawingPrizeId(null);
		}
	};

	const clearWinners = async () => {
		if (!selectedActivity) return;
		const response = await LotteryService.clearWinners(selectedActivity.id);
		if (response.success) {
			message.success("中奖记录已清空");
			await fetchDetail(selectedActivity.id);
		}
	};

	const deleteWinner = async (id: BackendIdInput) => {
		if (!selectedActivity) return;
		const response = await LotteryService.deleteWinner(id);
		if (response.success) {
			message.success("中奖记录已删除");
			await fetchDetail(selectedActivity.id);
		}
	};

	const leaveDetail = () => {
		clearRollingTimer();
		setDrawingPrizeId(null);
		setSelectedActivity(null);
		setPrizes([]);
		setParticipants([]);
		setWinners([]);
		setLatestWinners([]);
		setRollingNames([]);
	};

	const activityColumns: ColumnsType<LotteryActivity> = [
		{ title: "活动名称", dataIndex: "name" },
		{
			title: "重复中奖",
			dataIndex: "allowRepeatWinner",
			width: 110,
			render: value => <Tag color={value ? "blue" : "default"}>{value ? "允许" : "不允许"}</Tag>
		},
		{ title: "创建时间", dataIndex: "createTime", width: 180, render: formatTime },
		{
			title: "操作",
			width: 220,
			render: (_, record) => (
				<Space>
					<Button type="link" onClick={() => fetchDetail(record.id)}>
						进入
					</Button>
					<Button type="text" icon={<EditOutlined />} onClick={() => openActivityModal(record)} />
					<Popconfirm title="确认删除该活动？" onConfirm={() => deleteActivity(record.id)}>
						<Button type="text" danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			)
		}
	];

	const prizeColumns: ColumnsType<LotteryPrize> = [
		{ title: "奖项", dataIndex: "name" },
		{
			title: "进度",
			width: 120,
			render: (_, record) => `${winnerCountByPrize[idKey(record.id)] || 0}/${record.quota}`
		},
		{
			title: "状态",
			dataIndex: "state",
			width: 90,
			render: value => (
				<Tag color={value === CommonState.Enable ? "green" : "default"}>{value === CommonState.Enable ? "启用" : "禁用"}</Tag>
			)
		},
		{ title: "排序", dataIndex: "sort", width: 80 },
		{
			title: "抽取数量",
			width: 130,
			render: (_, record) => {
				const candidates = getRollingCandidates(record.id);
				const max = Math.max(getDrawLimit(record.quota, winnerCountByPrize[idKey(record.id)] || 0, candidates.length), 1);

				return (
					<InputNumber
						min={1}
						max={max}
						value={drawCountMap[idKey(record.id)] || 1}
						disabled={drawingPrizeId !== null}
						onChange={value => setDrawCountMap(prev => ({ ...prev, [idKey(record.id)]: value || 1 }))}
					/>
				);
			}
		},
		{
			title: "操作",
			width: 260,
			render: (_, record) => {
				const isDrawing = idKey(drawingPrizeId || "") === idKey(record.id);
				return (
					<Space>
						<Button
							type="primary"
							icon={isDrawing ? <StopOutlined /> : <RocketOutlined />}
							loading={isDrawing && stopping}
							disabled={(drawingPrizeId !== null && !isDrawing) || record.state !== CommonState.Enable}
							onClick={() => (isDrawing ? stopDraw(record) : startDraw(record))}
						>
							{isDrawing ? "停止" : "开始抽奖"}
						</Button>
						<Button
							disabled={drawingPrizeId !== null}
							type="text"
							icon={<EditOutlined />}
							onClick={() => openPrizeModal(record)}
						/>
						<Popconfirm title="确认删除该奖项？" onConfirm={() => deletePrize(record.id)}>
							<Button disabled={drawingPrizeId !== null} type="text" danger icon={<DeleteOutlined />} />
						</Popconfirm>
					</Space>
				);
			}
		}
	];

	const participantColumns: ColumnsType<LotteryParticipant> = [
		{ title: "姓名", dataIndex: "name" },
		{ title: "编号", dataIndex: "code", render: value => value || "-" },
		{
			title: "状态",
			dataIndex: "state",
			width: 90,
			render: value => (
				<Tag color={value === CommonState.Enable ? "green" : "default"}>{value === CommonState.Enable ? "启用" : "禁用"}</Tag>
			)
		},
		{ title: "排序", dataIndex: "sort", width: 80 },
		{
			title: "操作",
			width: 130,
			render: (_, record) => (
				<Space>
					<Button
						disabled={drawingPrizeId !== null}
						type="text"
						icon={<EditOutlined />}
						onClick={() => openParticipantModal(record)}
					/>
					<Popconfirm title="确认删除该参与人？" onConfirm={() => deleteParticipant(record.id)}>
						<Button disabled={drawingPrizeId !== null} type="text" danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			)
		}
	];

	const winnerColumns: ColumnsType<LotteryWinner> = [
		{ title: "奖项", dataIndex: "prizeNameSnapshot" },
		{ title: "中奖人", dataIndex: "winnerNameSnapshot" },
		{ title: "批次", dataIndex: "batchNo" },
		{ title: "中奖时间", dataIndex: "createTime", render: formatTime },
		{
			title: "操作",
			width: 90,
			render: (_, record) => (
				<Popconfirm title="确认删除该中奖记录？" onConfirm={() => deleteWinner(record.id)}>
					<Button disabled={drawingPrizeId !== null} type="text" danger icon={<DeleteOutlined />} />
				</Popconfirm>
			)
		}
	];

	return (
		<div className={`lottery-page${isDark ? " lottery-dark" : ""}`}>
			{selectedActivity ? renderActivityDetail() : renderActivityList()}
			<ActivityModal
				open={activityModalOpen}
				editing={!!editingActivity}
				saving={saving}
				form={activityForm}
				onOk={saveActivity}
				onCancel={() => setActivityModalOpen(false)}
			/>
			<PrizeModal
				open={prizeModalOpen}
				editing={!!editingPrize}
				saving={saving}
				form={prizeForm}
				onOk={savePrize}
				onCancel={() => setPrizeModalOpen(false)}
			/>
			<ParticipantModal
				open={participantModalOpen}
				editing={!!editingParticipant}
				saving={saving}
				form={participantForm}
				onOk={saveParticipant}
				onCancel={() => setParticipantModalOpen(false)}
			/>
			<ImportModal
				open={importModalOpen}
				saving={saving}
				content={importContent}
				onContentChange={setImportContent}
				onOk={importParticipants}
				onCancel={() => setImportModalOpen(false)}
			/>
		</div>
	);

	function renderActivityList() {
		return (
			<>
				<div className="lottery-header">
					<Space align="center">
						{onBack && (
							<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
								返回
							</Button>
						)}
						<div>
							<Typography.Title level={3}>抽奖工具</Typography.Title>
							<Typography.Text type="secondary">创建抽奖活动，维护奖项与参与人名单</Typography.Text>
						</div>
					</Space>
					<Space>
						<Button icon={<ReloadOutlined />} loading={loading} onClick={fetchActivities} />
						<Button type="primary" icon={<PlusOutlined />} onClick={() => openActivityModal()}>
							新建活动
						</Button>
					</Space>
				</div>
				<section className="lottery-panel">
					<Table
						rowKey="id"
						loading={loading}
						columns={activityColumns}
						dataSource={activities}
						locale={{ emptyText: <Empty description="暂无抽奖活动" /> }}
						pagination={false}
					/>
				</section>
			</>
		);
	}

	function renderActivityDetail() {
		if (!selectedActivity) return null;

		return (
			<>
				<div className="lottery-header">
					<Space align="center">
						<Button icon={<ArrowLeftOutlined />} disabled={drawingPrizeId !== null} onClick={leaveDetail}>
							返回活动列表
						</Button>
						<div>
							<Typography.Title level={3}>{selectedActivity.name}</Typography.Title>
							<Space wrap>
								<Tag color={selectedActivity.allowRepeatWinner ? "blue" : "default"}>
									{selectedActivity.allowRepeatWinner ? "允许重复中奖" : "不允许重复中奖"}
								</Tag>
								<Typography.Text type="secondary">{selectedActivity.description || "未填写活动说明"}</Typography.Text>
							</Space>
						</div>
					</Space>
					<Button
						icon={<ReloadOutlined />}
						loading={detailLoading}
						disabled={drawingPrizeId !== null}
						onClick={() => fetchDetail(selectedActivity.id)}
					/>
				</div>

				<DrawStage
					rollingNames={rollingNames}
					latestWinners={latestWinners}
					isDrawing={drawingPrizeId !== null}
					participantsCount={participants.length}
					prizesCount={prizes.length}
					winnersCount={winners.length}
				/>

				<section className="lottery-panel">
					<Tabs
						items={[
							{
								key: "prizes",
								label: "奖项",
								children: (
									<>
										<div className="panel-toolbar">
											<Typography.Title level={4}>奖项管理</Typography.Title>
											<Button
												type="primary"
												icon={<PlusOutlined />}
												disabled={drawingPrizeId !== null}
												onClick={() => openPrizeModal()}
											>
												新增奖项
											</Button>
										</div>
										<Table rowKey="id" loading={detailLoading} columns={prizeColumns} dataSource={prizes} pagination={false} />
									</>
								)
							},
							{
								key: "participants",
								label: "参与人",
								children: (
									<>
										<div className="panel-toolbar">
											<Typography.Title level={4}>参与人管理</Typography.Title>
											<Space>
												<Button
													icon={<UploadOutlined />}
													disabled={drawingPrizeId !== null}
													onClick={() => setImportModalOpen(true)}
												>
													批量导入
												</Button>
												<Button
													type="primary"
													icon={<PlusOutlined />}
													disabled={drawingPrizeId !== null}
													onClick={() => openParticipantModal()}
												>
													新增参与人
												</Button>
											</Space>
										</div>
										<Table
											rowKey="id"
											loading={detailLoading}
											columns={participantColumns}
											dataSource={participants}
											pagination={{ pageSize: 8 }}
										/>
									</>
								)
							},
							{
								key: "winners",
								label: "中奖结果",
								children: (
									<>
										<div className="panel-toolbar">
											<Typography.Title level={4}>中奖结果</Typography.Title>
											<Popconfirm title="确认清空该活动所有中奖记录？" onConfirm={clearWinners}>
												<Button danger icon={<ClearOutlined />} disabled={drawingPrizeId !== null || winners.length === 0}>
													清空结果
												</Button>
											</Popconfirm>
										</div>
										<Table
											rowKey="id"
											loading={detailLoading}
											columns={winnerColumns}
											dataSource={winners}
											pagination={{ pageSize: 8 }}
										/>
									</>
								)
							}
						]}
					/>
				</section>
			</>
		);
	}
};

export default Lottery;
