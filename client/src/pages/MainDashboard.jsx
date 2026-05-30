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
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/api/analytics/summary');
                setSummary(response.data.data || { total: 0, paid: 0, due: 0 });
            } catch (error) {
                console.error('Failed to load dashboard summary', error);
            }
        };

        fetchSummary();
    }, []);

    // Mock Data for Charts
    const chartData = {
        Weekly: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            series: [
                { name: 'Total Payment', data: [2000, 1500, 3000, 2500, 4000, 3500, 5000] },
                { name: 'Paid Payment', data: [1500, 1000, 2500, 2000, 3500, 3000, 4500] },
                { name: 'Due Payment', data: [500, 500, 500, 500, 500, 500, 500] }
            ]
        },
        Monthly: {
            categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            series: [
                { name: 'Total Payment', data: [12000, 15000, 10000, 18000] },
                { name: 'Paid Payment', data: [10000, 12000, 8000, 15000] },
                { name: 'Due Payment', data: [2000, 3000, 2000, 3000] }
            ]
        },
        Yearly: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
                { name: 'Total Payment', data: [45000, 50000, 48000, 55000, 60000, 58000, 65000, 70000, 75000, 80000, 85000, 90000] },
                { name: 'Paid Payment', data: [40000, 45000, 42000, 50000, 55000, 50000, 60000, 65000, 70000, 75000, 80000, 85000] },
                { name: 'Due Payment', data: [5000, 5000, 6000, 5000, 5000, 8000, 5000, 5000, 5000, 5000, 5000, 5000] }
            ]
        }
    };

    const currentChartData = chartData[chartPeriod];

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
                    <h3 className="text-4xl font-bold text-gray-700 mb-2">20+</h3>
                    <p className="text-gray-500 font-medium text-lg">Active Substockists</p>
                    <div className="mt-8 w-full">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span>Goal</span>
                            <span>85%</span>
                        </div>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
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