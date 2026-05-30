import React, { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, CreditCard, Clock, CheckCircle2, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import Chart from 'react-apexcharts';
import api from '../services/api';

/* ── Animated number ── */
const AnimatedNumber = ({ value, prefix = '' }) => {
    const [display, setDisplay] = useState(0);
    const prevRef = useRef(0);
    useEffect(() => {
        const start = prevRef.current;
        const end = Number(value) || 0;
        if (start === end) return;
        const duration = 800;
        const steps = 40;
        const stepTime = duration / steps;
        let current = start;
        const inc = (end - start) / steps;
        const timer = setInterval(() => {
            current += inc;
            if ((inc > 0 && current >= end) || (inc < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            setDisplay(Math.round(current));
        }, stepTime);
        prevRef.current = end;
        return () => clearInterval(timer);
    }, [value]);
    return <span>{prefix}{display.toLocaleString()}</span>;
};

/* ── Skeleton ── */
const Skeleton = ({ className = '' }) => (
    <div className={`skeleton rounded-xl ${className}`} />
);

/* ── Stat Card ── */
const StatCard = ({ title, value, prefix, icon, gradient, delay = 0, badge }) => (
    <div
        className="card card-lift p-5 animate-slide-up flex flex-col gap-4"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-start justify-between">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: gradient, boxShadow: `0 6px 18px rgba(0,0,0,0.18)` }}
            >
                {icon}
            </div>
            {badge && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    <ArrowUpRight size={11} />{badge}
                </span>
            )}
        </div>
        <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>{title}</p>
            <h4 className="text-2xl font-bold animate-count-up" style={{ color: '#0f172a' }}>
                <AnimatedNumber value={value} prefix={prefix} />
            </h4>
        </div>
    </div>
);

const MainDashboard = () => {
    const [chartPeriod, setChartPeriod] = useState('Weekly');
    const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0, activeCount: 0 });
    const [chartData, setChartData] = useState({ categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], series: [] });
    const [currentIST, setCurrentIST] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);

    useEffect(() => {
        const fmt = () => {
            const f = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
            setCurrentIST(f.format(new Date()));
        };
        fmt();
        const id = setInterval(fmt, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoadingSummary(true);
            try {
                const r = await api.get('/api/analytics/summary');
                setSummary({
                    total:       r.data.data?.total       || 0,
                    paid:        r.data.data?.paid        || 0,
                    due:         r.data.data?.due         || 0,
                    activeCount: r.data.activeCount       || 0,
                });
            } catch (e) { console.error(e); }
            finally { setLoadingSummary(false); }
        };
        fetchSummary();
    }, []);

    useEffect(() => {
        const fetchChart = async () => {
            setLoadingChart(true);
            try {
                const period = chartPeriod.toLowerCase();
                const r = await api.get(`/api/analytics/${period}`);
                const data = r.data.data || [];
                let cats = [], totals, paid, due;

                if (chartPeriod === 'Weekly') {
                    cats = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    totals = Array(7).fill(0); paid = Array(7).fill(0); due = Array(7).fill(0);
                    data.forEach(item => {
                        const i = Number(item._id) - 1;
                        if (i >= 0 && i < 7) { totals[i] = Number(item.total) || 0; paid[i] = Number(item.paid) || 0; due[i] = Number(item.due) || 0; }
                    });
                } else if (chartPeriod === 'Monthly') {
                    cats = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                    totals = Array(5).fill(0); paid = Array(5).fill(0); due = Array(5).fill(0);
                    data.forEach(item => { const i = item._id - 1; if (i >= 0 && i < 5) { totals[i] = item.total || 0; paid[i] = item.paid || 0; due[i] = item.due || 0; } });
                } else {
                    cats = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    totals = Array(12).fill(0); paid = Array(12).fill(0); due = Array(12).fill(0);
                    data.forEach(item => { const i = item._id - 1; if (i >= 0 && i < 12) { totals[i] = item.total || 0; paid[i] = item.paid || 0; due[i] = item.due || 0; } });
                }
                setChartData({ categories: cats, series: [
                    { name: 'Total', data: totals },
                    { name: 'Paid',  data: paid  },
                    { name: 'Due',   data: due   },
                ]});
            } catch (e) {
                const cats = chartPeriod === 'Monthly' ? ['Week 1','Week 2','Week 3','Week 4','Week 5'] : chartPeriod === 'Yearly' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                setChartData({ categories: cats, series: [] });
            } finally { setLoadingChart(false); }
        };
        fetchChart();
    }, [chartPeriod]);

    const chartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter,sans-serif' },
        colors: ['#4f46e5', '#10b981', '#f43f5e'],
        plotOptions: {
            bar: { horizontal: false, columnWidth: '50%', borderRadius: 6, borderRadiusApplication: 'end' },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: chartData.categories,
            labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 } },
            axisBorder: { show: false }, axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 },
                formatter: v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`,
            },
        },
        fill: {
            type: 'gradient',
            gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.15, opacityFrom: 1, opacityTo: 0.85 },
        },
        tooltip: { y: { formatter: val => `$${val.toLocaleString()}` }, theme: 'light' },
        grid: { show: true, borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'right', fontWeight: 600, fontSize: '13px', labels: { colors: '#475569' } },
    };

    const statCards = [
        { title: 'Total Revenue',   value: summary.total,  prefix: '$', gradient: 'linear-gradient(135deg,#4338ca,#4f46e5)', icon: <DollarSign size={22} color="#fff" /> },
        { title: 'Paid Amount',     value: summary.paid,   prefix: '$', gradient: 'linear-gradient(135deg,#059669,#10b981)', icon: <CheckCircle2 size={22} color="#fff" /> },
        { title: 'Due Amount',      value: summary.due,    prefix: '$', gradient: 'linear-gradient(135deg,#e11d48,#f43f5e)', icon: <Clock size={22} color="#fff" /> },
    ];

    return (
        <div className="animate-fade-in">
            {/* ── Page Header ── */}
            <div className="page-header mb-8">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Overview</p>
                        <h1 className="text-2xl font-bold text-white">Main Dashboard</h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Track payments, substockists and weekly revenue analytics.
                        </p>
                    </div>
                    <div
                        className="flex-shrink-0 px-5 py-3 rounded-2xl flex flex-col gap-0.5"
                        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <Calendar size={10} className="inline mr-1" />IST
                        </p>
                        <p className="text-sm font-semibold text-white">{currentIST}</p>
                    </div>
                </div>
            </div>

            {/* ── Top row: big substockist card + 3 stat cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">
                {/* Big substockist card */}
                <div
                    className="xl:col-span-2 card animate-slide-up p-6 flex flex-col justify-between"
                    style={{
                        background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)',
                        border: '1px solid rgba(79,70,229,0.2)',
                        boxShadow: '0 8px 32px rgba(79,70,229,0.15)',
                    }}
                >
                    <div>
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(124,58,237,0.2))', border: '1px solid rgba(79,70,229,0.3)' }}
                        >
                            <Users size={30} color="#818cf8" />
                        </div>
                        <h3
                            className="text-5xl font-bold mb-1 animate-count-up"
                            style={{ background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}
                        >
                            {loadingSummary ? '—' : <AnimatedNumber value={summary.activeCount} />}
                        </h3>
                        <p className="text-base font-semibold" style={{ color: '#c7d2fe' }}>Active Substockists</p>
                        <p className="text-sm mt-3" style={{ color: 'rgba(199,210,254,0.55)' }}>
                            Live partner count with real-time dashboard status.
                        </p>
                    </div>
                    <div className="mt-6 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(79,70,229,0.2)' }}>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium" style={{ color: '#6ee7b7' }}>Live data</span>
                    </div>
                </div>

                {/* Stat cards */}
                {loadingSummary ? (
                    [0,1,2].map(i => (
                        <div key={i} className="card p-5 flex flex-col gap-4">
                            <Skeleton className="w-12 h-12" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-7 w-32" />
                            </div>
                        </div>
                    ))
                ) : (
                    statCards.map((c, i) => (
                        <StatCard key={c.title} {...c} delay={i * 80} />
                    ))
                )}
            </div>

            {/* ── Chart ── */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Analytics</p>
                        <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Revenue Chart</h3>
                    </div>
                    <div className="inline-flex gap-1 p-1 rounded-xl" style={{ background: '#f1f5f9' }}>
                        {['Weekly','Monthly','Yearly'].map(p => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                style={chartPeriod === p
                                    ? { background: '#fff', color: '#4f46e5', boxShadow: '0 2px 8px rgba(79,70,229,0.15)' }
                                    : { background: 'transparent', color: '#64748b' }
                                }
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {loadingChart ? (
                    <div className="w-full" style={{ height: 380 }}>
                        <Skeleton className="w-full h-full" style={{ height: 380 }} />
                    </div>
                ) : (
                    <Chart
                        options={chartOptions}
                        series={chartData.series.length ? chartData.series : [
                            { name: 'Total', data: Array(chartData.categories.length).fill(0) },
                            { name: 'Paid',  data: Array(chartData.categories.length).fill(0) },
                            { name: 'Due',   data: Array(chartData.categories.length).fill(0) },
                        ]}
                        type="bar"
                        height={380}
                    />
                )}
            </div>

            {/* ── Yearly Overview ── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} color="#4f46e5" />
                    <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Yearly Overview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { title: 'Yearly Total',  value: summary.total, prefix: '$', gradient: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', icon: <DollarSign size={22} color="#fff" /> },
                        { title: 'Yearly Paid',   value: summary.paid,  prefix: '$', gradient: 'linear-gradient(135deg,#065f46,#059669)', icon: <CheckCircle2 size={22} color="#fff" /> },
                        { title: 'Yearly Due',    value: summary.due,   prefix: '$', gradient: 'linear-gradient(135deg,#7f1d1d,#b91c1c)', icon: <Clock size={22} color="#fff" /> },
                    ].map((c, i) => (
                        <StatCard key={c.title} {...c} delay={i * 80} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;