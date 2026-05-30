import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, Wallet, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import Chart from 'react-apexcharts';
import api from '../services/api';

const DashboardCard = ({ title, value, icon, subtitle, color, className = "" }) => {
    return (
        <div className={`bg-white p-6 rounded-3xl shadow-[0px_10px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between border border-gray-200 transition-transform duration-200 hover:-translate-y-0.5 ${className}`}>
            <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-3 ${color} text-white shadow-sm`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-gray-500 font-semibold">{title}</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-800">{value}</h4>
                    {subtitle && <p className="mt-2 text-xs text-green-600 font-semibold">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

const MainDashboard = () => {
    const [chartPeriod, setChartPeriod] = useState("Weekly");
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0, activeCount: 0 });
    const [chartData, setChartData] = useState({ categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], series: [] });
    const [currentIST, setCurrentIST] = useState('');

    useEffect(() => {
        const formatIST = () => {
            const formatter = new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            setCurrentIST(formatter.format(new Date()));
        };

        formatIST();
        const interval = setInterval(formatIST, 1000);
        return () => clearInterval(interval);
    }, []);

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
                        const idx = Number(item._id) - 1;
                        if (idx >= 0 && idx < 7) {
                            totals[idx] = Number(item.total) || 0;
                            paid[idx] = Number(item.paid) || 0;
                            due[idx] = Number(item.due) || 0;
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
                const fallbackCategories = chartPeriod === 'Monthly'
                    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
                    : chartPeriod === 'Yearly'
                        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                setChartData({ categories: fallbackCategories, series: [] });
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
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    plotOptions: {
                        bar: {
                            columnWidth: '70%'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center'
                    },
                    xaxis: {
                        labels: {
                            rotate: -45,
                            rotateAlways: true
                        }
                    }
                }
            }
        ]
    };

    const paymentMetrics = [
        { title: "Total Payment", value: `$${summary.total.toLocaleString()}`, icon: <DollarSign size={24} />, color: "bg-blue-500" },
        { title: "Paid Payment", value: `$${summary.paid.toLocaleString()}`, icon: <CheckCircle2 size={24} />, color: "bg-indigo-500" },
        { title: "Due Payment", value: `$${summary.due.toLocaleString()}`, icon: <Clock size={24} />, color: "bg-purple-500" },
    ];

    return (
        <div className="p-2">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Main Dashboard</h2>
                    <p className="mt-2 text-sm text-gray-500 max-w-2xl">Track active substockists, payment totals, and weekly revenue analytics with a cleaner dashboard layout.</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Indian Standard Time</p>
                    <p className="mt-1 text-base font-semibold text-gray-800">{currentIST}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                {/* Active Substockists Card (Big Box) */}
                <div className="xl:col-span-2 xl:row-span-2 bg-white p-6 rounded-3xl shadow-[0px_12px_35px_rgba(15,23,42,0.08)] flex flex-col justify-between border border-gray-200">
                    <div>
                        <div className="inline-flex items-center justify-center rounded-3xl bg-indigo-50 p-5 mb-5 border border-indigo-100">
                            <Users size={44} className="text-indigo-500" />
                        </div>
                        <h3 className="text-5xl font-bold text-gray-800 mb-2">{summary.activeCount}</h3>
                        <p className="text-lg font-semibold text-gray-600">Active Substockists</p>
                        <p className="mt-4 text-sm text-gray-500">Live active partner count with current dashboard status.</p>
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
            <div className="bg-white p-6 rounded-3xl shadow-[0px_12px_35px_rgba(15,23,42,0.08)] border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Weekly Revenue Analytics</h3>
                        <p className="mt-1 text-sm text-gray-500">Compare total, paid, and due payments across the selected reporting period.</p>
                    </div>
                    <div className="inline-flex rounded-full bg-gray-100 p-1.5">
                        {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setChartPeriod(period)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${chartPeriod === period
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full min-h-[380px]">
                    <Chart
                        options={chartOptions}
                        series={currentChartData.series.length ? currentChartData.series : [
                            { name: 'Total Payment', data: Array(currentChartData.categories.length).fill(0) },
                            { name: 'Paid Payment', data: Array(currentChartData.categories.length).fill(0) },
                            { name: 'Due Payment', data: Array(currentChartData.categories.length).fill(0) }
                        ]}
                        type="bar"
                        height={380}
                    />
                </div>
            </div>

            {/* Yearly Summary Row */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Yearly Overview</h3>
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