import React from 'react'
import './StatsCardComponent.css'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Users, BookOpen, Award } from 'lucide-react';

const StatsCardComponent = () => {

	const progressData = [
		{ name: 'Week 1', current: 65, previous: 45 },
		{ name: 'Week 2', current: 75, previous: 55 },
		{ name: 'Week 3', current: 82, previous: 62 },
		{ name: 'Week 4', current: 88, previous: 70 },
	];

	const attendanceData = [
		{ name: 'Mon', current: 95, previous: 85 },
		{ name: 'Tue', current: 88, previous: 80 },
		{ name: 'Wed', current: 92, previous: 88 },
		{ name: 'Thu', current: 85, previous: 82 },
		{ name: 'Fri', current: 90, previous: 86 },
	];

	const assessmentData = [
		{ name: 'Quiz', value: 30, growth: 15 },
		{ name: 'Assignments', value: 45, growth: -5 },
		{ name: 'Projects', value: 25, growth: 10 },
	];

	const timeSpentData = [
		{ name: 'Week 1', current: 12, previous: 10 },
		{ name: 'Week 2', current: 15, previous: 12 },
		{ name: 'Week 3', current: 10, previous: 8 },
		{ name: 'Week 4', current: 18, previous: 14 },
	];

	const COLORS = ['#fbbf24', '#60a5fa', '#34d399'];

	const getGrowthIndicator = (current, previous) => {
		const growth = ((current - previous) / previous) * 100;
		return {
			value: Math.abs(growth).toFixed(1),
			isPositive: growth > 0,
			previousValue: previous
		};
	};

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border rounded shadow-sm">
					<p className="fw-medium mb-1">{label}</p>
					<p className="text-primary mb-0">
						Current: {payload[0].value}
					</p>
					{payload[1] && (
						<p className="text-secondary mb-0">
							Previous: {payload[1].value}
						</p>
					)}
				</div>
			);
		}
		return null;
	};

	const MetricCard = ({ title, value, unit, data, type, icon: Icon, growth }) => {
		const ChartComponent = type === 'line' ? LineChart :
			type === 'bar' ? BarChart :
				type === 'area' ? AreaChart : null;

		return (
			<div className="card card-box  shadow-sm border-0 transition">
				<div className="card-body">

					<div className="d-flex justify-content-between align-items-center mb-2">

						<div className="d-flex align-items-center gap-2">
							<div className="px-2 py-1 card-icon">
								<Icon size={20} />
							</div>
							<p className="card-title-font mb-0">{title}</p>
						</div>

						{growth && (
							<div className={`d-flex align-items-center gap-1 ${growth.isPositive ? 'text-success' : 'text-danger'}`}>
								{growth.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
								<span className="small fw-medium">{growth.value}%</span>
							</div>
						)}

					</div>

					<div className="mb-1">
						<span className="fs-4 fw-bold text-dark">
							{value}<span className="fs-6 fw-medium text-secondary ms-1">{unit}</span>
						</span>
					</div>

					<div className="small text-secondary mb-3">
						{growth && `${growth.isPositive ? '+' : '-'}${growth.value}% from last month (${growth.previousValue}${unit})`}
					</div>

					<div style={{ height: '90px' }}>
						<ResponsiveContainer width="100%" height="100%">
							{type !== 'pie' ? (
								<ChartComponent data={data}>
									<XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} padding={{ left: 16, right: 16 }} />
									<YAxis hide />
									<Tooltip content={<CustomTooltip />} />
									<Line
										type="monotone"
										dataKey="current"
										stroke="#ffc107"
										strokeWidth={2}
										dot={false}
									/>
									<Line
										type="monotone"
										dataKey="previous"
										stroke="#dee2e6"
										strokeWidth={2}
										dot={false}
										strokeDasharray="5 5"
									/>
								</ChartComponent>
							) :
								null
							}
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		);
	};


	return (

		<div className="stats-card-box row m-0 p-0 mb-5">

			<div className="col-md-3 ps-0">
				<MetricCard
					title="Class Progress"
					value={88}
					unit="%"
					data={progressData}
					type="line"
					icon={BookOpen}
					growth={getGrowthIndicator(88, 70)}
				/>
			</div>

			<div className="col-md-3 ps-1">
				<MetricCard
					title="Average Attendance"
					value={90}
					unit="%"
					data={attendanceData}
					type="line"
					icon={Users}
					growth={getGrowthIndicator(90, 85)}
				/>
			</div>

			<div className="col-md-3 h-auto">
				<div className="card card-box shadow-sm border-0 h-100">
					<div className="card-body">

						<div className="d-flex align-items-center gap-2">
							<div className="px-2 py-1 card-icon">
								<Award size={20} />
							</div>
							<p className="card-title-font mb-0">Assesments Tracking</p>
						</div>

						<div style={{ height: '112px' }} className="d-flex align-items-center justify-content-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={assessmentData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={50}
										innerRadius={35}
									>
										{assessmentData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="d-flex justify-content-center  gap-3 mt-3">
							{assessmentData.map((item, index) => (
								<div key={index} className="text-center">

									<div className="d-flex align-items-center gap-1 mb-1">
										<div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: COLORS[index] }}></div>
										<span className="small text-secondary">{item.name}</span>
									</div>

									<div className="d-flex align-items-center justify-content-center">
										<span className="small fw-medium">{item.value}%</span>
									</div>
								</div>
							))}
						</div>

					</div>
				</div>
			</div>

			<div className="col-md-3 ps-1 pe-0">
				<MetricCard
					title="Total Time Spent"
					value={55}
					unit="hrs"
					data={timeSpentData}
					type="line"
					icon={Clock}
					growth={getGrowthIndicator(55, 44)}
				/>
			</div>

		</div>

	)
}

export default StatsCardComponent