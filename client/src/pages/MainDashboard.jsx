import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, Wallet, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import Chart from 'react-apexcharts';
import api from '../services/api';

const DashboardCard = ({ title, value, icon, subtitle, color, className = "" }) => {
    return (
        <div className={`bg-white p-4 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] dark:shadow-none dark:bg-white flex flex-col justify-center border border-gray-200 ${className}`}>
            <div className="flex items-center gap-3">
                <div className={`rounded-full p-3 ${color} text-white`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <h4 className="text-xl font-bold text-gray-700 dark:text-gray-700">{value}</h4>
                    {subtitle && <p className="text-xs text-green-500 font-bold">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

const MainDashboard = () => {
    const [chartPeriod, setChartPeriod] = useState("Weekly");
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0, activeCount: 0 });
    const [chartData, setChartData] = useState({ categories: [], series: [] });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/api/analytics/summary');
                setSummary({
                    total: response.data.data?.total || 0,
                    paid: response.data.data?.paid || 0,
                    due: response.data.data?.due || 0,
                    activeCount: response.data.activeCount || 0
                });
            } catch (error) {
                console.error('Failed to load dashboard summary', error);
            }
        };

        fetchSummary();
    }, []);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const period = chartPeriod.toLowerCase();
                const response = await api.get(`/api/analytics/${period}`);
                const data = response.data.data || [];
                let categories = [];
                const seriesTotal = [];
                const seriesPaid = [];
                const seriesDue = [];

                if (chartPeriod === 'Weekly') {
                    categories = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const totals = Array(7).fill(0);
                    const paid = Array(7).fill(0);
                    const due = Array(7).fill(0);
                    data.forEach((item) => {
                        const idx = item._id - 1;
                        if (idx >= 0 && idx < 7) {
                            totals[idx] = item.total || 0;
                            paid[idx] = item.paid || 0;
                            due[idx] = item.due || 0;
                        }
                    });
                    seriesTotal.push({ name: 'Total Payment', data: totals });
                    seriesPaid.push({ name: 'Paid Payment', data: paid });
                    seriesDue.push({ name: 'Due Payment', data: due });
                } else if (chartPeriod === 'Monthly') {
                    categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                    const totals = Array(5).fill(0);
                    const paid = Array(5).fill(0);
                    const due = Array(5).fill(0);
                    data.forEach((item) => {
                        const idx = item._id - 1;
                        if (idx >= 0 && idx < 5) {
                            totals[idx] = item.total || 0;
                            paid[idx] = item.paid || 0;
                            due[idx] = item.due || 0;
                        }
                    });
                    seriesTotal.push({ name: 'Total Payment', data: totals });
                    seriesPaid.push({ name: 'Paid Payment', data: paid });
                    seriesDue.push({ name: 'Due Payment', data: due });
                } else {
                    categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const totals = Array(12).fill(0);
                    const paid = Array(12).fill(0);
                    const due = Array(12).fill(0);
                    data.forEach((item) => {
                        const idx = item._id - 1;
                        if (idx >= 0 && idx < 12) {
                            totals[idx] = item.total || 0;
                            paid[idx] = item.paid || 0;
                            due[idx] = item.due || 0;
                        }
                    });
                    seriesTotal.push({ name: 'Total Payment', data: totals });
                    seriesPaid.push({ name: 'Paid Payment', data: paid });
                    seriesDue.push({ name: 'Due Payment', data: due });
                }

                setChartData({ categories, series: [...seriesTotal, ...seriesPaid, ...seriesDue] });
            } catch (error) {
                console.error('Failed to load revenue analytics', error);
                setChartData({ categories: [], series: [] });
            }
        };

        fetchChartData();
    }, [chartPeriod]);

    const currentChartData = chartData;

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: {
                show: false
            }
        },
        colors: ['#3b82f6', '#4f46e5', '#a855f7'], // Blue-500, Indigo-600, Purple-500
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: currentChartData.categories,
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                },
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                },
                formatter: (value) => {
                    return value >= 1000 ? `${value / 1000}k` : value;
                }
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "$ " + val
                }
            }
        },
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        }
    };

    const paymentMetrics = [
        { title: "Total Payment", value: `$${summary.total.toLocaleString()}`, icon: <DollarSign size={24} />, color: "bg-blue-500" },
        { title: "Paid Payment", value: `$${summary.paid.toLocaleString()}`, icon: <CheckCircle2 size={24} />, color: "bg-indigo-500" },
        { title: "Due Payment", value: `$${summary.due.toLocaleString()}`, icon: <Clock size={24} />, color: "bg-purple-500" },
    ];

    return (
        <div className="p-2">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-700 mb-8">Main Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Active Substockists Card (Big Box) */}
                <div className="lg:col-span-1 lg:row-span-3 bg-white p-6 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] flex flex-col items-center justify-center text-center border border-gray-200">
                    <div className="bg-indigo-50 p-6 rounded-full mb-4 border border-blue-200">
                        <Users size={48} className="text-indigo-500" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-700 mb-2">{summary.activeCount}</h3>
                    <p className="text-gray-500 font-medium text-lg">Active Substockists</p>
                    <div className="mt-6 text-sm text-gray-500">
                        <p>{summary.activeCount === 0 ? 'No active substockists yet' : `${summary.activeCount} total active substockists`}</p>
                    </div>
                </div>

                {/* 3x3 Payment Metrics Grid */}
                {paymentMetrics.map((metric, index) => (
                    <DashboardCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                        color={metric.color}
                    />
                ))}
            </div>

            {/* Revenue Analytics Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-navy-700 text-gray-700">Revenue Analytics</h3>

                    {/* Toggle Buttons */}
                    <div className="mt-4 md:mt-0 bg-gray-100 p-1.5 rounded-xl inline-flex">
                        {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setChartPeriod(period)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${chartPeriod === period
                                    ? 'bg-white text-indigo-500 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full min-h-[350px]">
                    <Chart
                        options={chartOptions}
                        series={currentChartData.series}
                        type="bar"
                        height={350}
                    />
                </div>
            </div>

            {/* Yearly Summary Row */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Yearly Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard
                        title="Yearly Total Payment"
                        value={`$${summary.total.toLocaleString()}`}
                        icon={<DollarSign size={24} />}
                        color="bg-blue-800"
                    />
                    <DashboardCard
                        title="Yearly Paid Payment"
                        value={`$${summary.paid.toLocaleString()}`}
                        icon={<CheckCircle2 size={24} />}
                        color="bg-indigo-800"
                    />
                    <DashboardCard
                        title="Yearly Due Payment"
                        value={`$${summary.due.toLocaleString()}`}
                        icon={<Clock size={24} />}
                        color="bg-purple-800"
                    />
                </div>
            </div>
        </div>
    )
}

export default MainDashboard