import { useState, useEffect, useRef } from "react";

import { api } from "../../../actions/tool/checkIn";
import axios from "../../../api/index";

import "./Calendar.css";

const Calendar = () => {
	const [curDate, setCurDate] = useState(new Date()); // 当前日期
	const [curMonthCheckInDateArray, setCurMonthCheckInDateArray] = useState<String[]>([]); // 当前月份签到数据
	const [lastMonthCheckInDateArray, setLastMonthCheckInDateArray] = useState<String[]>([]); // 上一个月份签到数据
	const [nextMonthCheckInDateArray, setNextMonthCheckInDateArray] = useState<String[]>([]); // 下一个月份签到数据
	const [curMonthCheckInDaysCount, setCurMonthCheckInDaysCount] = useState(0); // 当前月份累计签到次数
	const [continuousCheckInDays, setContinuousCheckInDays] = useState(0); // 连续签到次数
	const [checkFlag, setCheckFlag] = useState(false); // 今日签到状态
	const [checkintype, setCheckintype] = useState(1); // 签到类型

	const signDaysBoxRef = useRef(null);

	useEffect(() => {
		const parentContainer = document.getElementById("calendar-container");

		const changeRem = () => {
			if (parentContainer) {
				// const width = document.documentElement.getBoundingClientRect().width; // 获取视口宽度（浏览器窗口宽度）
				const width = parentContainer.getBoundingClientRect().width; // 获取指定元素的宽度
				const rem = (width / 750) * 100;
				document.documentElement.style.fontSize = rem + "px"; // 这行代码会直接修改 <html> 元素的 font-size 样式，从而影响整个页面的根字体大小。由于 CSS 中的 rem 单位是相对于根元素（即 <html> 元素）的字体大小的，因此这会导致页面中所有使用 rem 单位的元素的大小发生变化。
				// parentContainer.style.fontSize = rem + "px"; // 只修改 #calendar-container 的 font-size。CSS 调整：如果使用了 rem 单位，需要改为 em 或 px 单位。
			}
		};

		// 在组件挂载时，立即调用 changeRem 函数。
		changeRem();

		// // 监听窗口变化：
		// // resize 事件：当窗口大小发生变化时，调用 changeRem 函数重新计算 font-size。
		// // orientationchange 事件：当设备方向发生变化（如从竖屏切换到横屏）时，调用 changeRem 函数重新计算 font-size。
		// window.addEventListener("resize", changeRem);
		// window.addEventListener("orientationchange", changeRem);

		// 使用 ResizeObserver 监听父容器的大小变化
		const resizeObserver = new ResizeObserver(changeRem);
		if (parentContainer) {
			resizeObserver.observe(parentContainer);
		}

		// 查询今日是否已签到
		axios
			.get(api.checkIn.isCheckInToday, { checkInType: checkintype })
			.then(result => {
				if (result.success === true && result.data.isCheckIn === true) {
					setCheckFlag(true);
				}
			})
			.catch(err => {
				console.log("查询今日是否已签到异常", err);
			});

		return () => {
			// // 在组件卸载时，移除之前添加的事件监听器，防止内存泄漏。
			// window.removeEventListener("resize", changeRem);
			// window.removeEventListener("orientationchange", changeRem);

			// 在组件卸载时，停止监听父容器的大小变化
			if (parentContainer) {
				resizeObserver.unobserve(parentContainer);
			}
		};
	}, []); // 空依赖数组表示这个effect只在组件挂载时运行一次

	useEffect(() => {
		refresh();
	}, [curDate]);

	const getFormatDate = (addMonth = 0) => {
		const date = new Date(curDate);
		date.setMonth(date.getMonth() + addMonth, 1);
		return `${date.getFullYear()}年${date.getMonth() + 1}月`;
	};

	const refresh = (onlyCurMonth = false) => {
		const data = {
			year: curDate.getFullYear(),
			month: curDate.getMonth() + 1,
			onlyCurMonth,
			checkInType: checkintype
		};

		axios
			.get(api.checkIn.search, data)
			.then(result => {
				if (result.success === true) {
					setCurMonthCheckInDateArray(result.data.curMonthCheckinDatas);
					setLastMonthCheckInDateArray(result.data.lastMonthCheckinDatas);
					setNextMonthCheckInDateArray(result.data.nextMonthCheckinDatas);
					setCurMonthCheckInDaysCount(Array.from(result.data.curMonthCheckinDatas).length);
					setContinuousCheckInDays(result.data.continuousCheckInDays);
				}
			})
			.catch(err => {
				console.log("查询签到数据异常", err);
			});
	};

	const todayCheckIn = (isRefresh = false) => {
		setCheckFlag(true);
		if (isRefresh) {
			refresh();
		}
	};

	const handleCheckIn = () => {
		if (checkFlag) return;

		axios
			.post(api.checkIn.checkIn, { checkintype })
			.then(result => {
				if (result.success === true) {
					setCurMonthCheckInDaysCount(prev => prev + 1);
					todayCheckIn(true);
				}
			})
			.catch(err => {
				console.log("签到异常", err);
			});
	};

	const handlePrevMonth = () => {
		setCurDate(prevDate => {
			const newDate = new Date(prevDate);
			newDate.setMonth(newDate.getMonth() - 1);
			return newDate;
		});
	};

	const handleNextMonth = () => {
		setCurDate(prevDate => {
			const newDate = new Date(prevDate);
			newDate.setMonth(newDate.getMonth() + 1);
			return newDate;
		});
	};

	/**渲染日历 */
	const renderCalendarDays = () => {
		const daysArray = [];
		const date = new Date(curDate);
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // 当前月最后一天
		const lastDayOfPrevMonth = new Date(year, month, 0).getDate(); // 上个月最后一天
		const offset = (firstDayOfMonth + 6) % 7; // 默认是周一作为第一天

		// console.log(`firstDayOfMonth: ${firstDayOfMonth}`);
		// console.log(`lastDayOfMonth: ${lastDayOfMonth}`);
		// console.log(`lastDayOfPrevMonth: ${lastDayOfPrevMonth}`);

		// Add previous month's days
		for (let i = offset - 1; i >= 0; i--) {
			daysArray.push(
				<span key={`prev-${i}`} className="calendar-day" style={{ color: "#c4c4c4" }}>
					{lastDayOfPrevMonth - i}
				</span>
			);
		}

		// Add current month's days
		for (let i = 1; i <= lastDayOfMonth; i++) {
			const curDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
			const isCheckedIn = curMonthCheckInDateArray.includes(curDate);
			daysArray.push(
				<span key={`current-${i}`} className={`calendar-day ${isCheckedIn ? "calendar-day-checkin" : ""}`}>
					{i}
				</span>
			);
		}

		// Add next month's days
		const totalDays = daysArray.length;
		for (let i = 1; i <= 42 - totalDays; i++) {
			daysArray.push(
				<span key={`next-${i}`} className="calendar-day" style={{ color: "#c4c4c4" }}>
					{i}
				</span>
			);
		}

		return daysArray;
	};

	return (
		<div id="calendar-container">
			<div className="mem-sign-st">
				<div className="mem-sign-st-detail clearfix">
					<span className="calendar-fl">本月累计签到 {curMonthCheckInDaysCount} 天</span>
					<span className="calendar-fr">已连续签到 {continuousCheckInDays} 天</span>
				</div>
				<div className="mem-sign-before mem-sign-circle">
					<div className="mem-sign-circle-text" style={{ cursor: "pointer" }} onClick={handleCheckIn}>
						{checkFlag ? "✔" : "签到"}
					</div>
				</div>
				<div className="mem-sign-tips">{checkFlag ? "今日已经签到" : "今日未签到"}</div>
			</div>
			<div className="sign-date-wrap">
				<div className="sign-date-top clearfix calendar-tc">
					<span className="calendar-fl" style={{ cursor: "pointer" }} onClick={handlePrevMonth}>
						&lt;
					</span>
					<span>{getFormatDate()}</span>
					<span className="calendar-fr" style={{ cursor: "pointer" }} onClick={handleNextMonth}>
						&gt;
					</span>
				</div>
				<div className="sign-date-week clearfix">
					{["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
						<span key={index} className="calendar-day">
							{day}
						</span>
					))}
				</div>
				<div id="sign-days-box" className="sign-date-days clearfix" ref={signDaysBoxRef}>
					{renderCalendarDays()}
				</div>
			</div>
		</div>
	);
};

export default Calendar;
