import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import Chart from 'react-apexcharts';
import api from '../services/api';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatDateInput = (date) => date.toISOString().split('T')[0];

const SubstockistProfile = () => {
  const { id } = useParams();
  const [substockist, setSubstockist] = useState(null);
  const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [fromDate, setFromDate] = useState(formatDateInput(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [toDate, setToDate] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/substockist/${id}`, {
          params: {
            from: fromDate,
            to: toDate,
            period
          }
        });

        setSubstockist(response.data.substockist);
        setSummary(response.data.summary || { total: 0, paid: 0, due: 0 });
        setHistory(response.data.history || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load substockist profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, period, fromDate, toDate]);

  const chartCategories = history.map((item) => {
    if (!item._id) return '';

    if (period === 'daily') {
      return item._id.date || item._id;
    }

    if (period === 'monthly') {
      const monthIndex = item._id.month - 1;
      return `${monthNames[monthIndex] || 'Month'} ${item._id.year}`;
    }

    return item._id.week ? `W${item._id.week} ${item._id.year}` : item._id;
  });

  const chartSeries = [
    { name: 'Total', data: history.map((item) => item.total || 0) },
    { name: 'Paid', data: history.map((item) => item.paid || 0) },
    { name: 'Due', data: history.map((item) => item.due || 0) }
  ];

  const chartOptions = {
    chart: {
      toolbar: { show: false }
    },
    colors: ['#2563eb', '#10b981', '#ef4444'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartCategories,
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { formatter: (value) => `$${value}` }
    },
    tooltip: {
      y: { formatter: (value) => `$${value}` }
    },
    legend: { position: 'top' }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-700">Substockist Profile</h2>
          <p className="text-sm text-gray-500 mt-2">Detailed payment history and outstanding amounts for the selected substockist.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/view-substockist"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
          >
            <ArrowLeft size={16} /> Back to list
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-[0px_3px_14px_rgba(226,225,249,0.98)]">Loading profile...</div>
      ) : error ? (
        <div className="rounded-3xl bg-white p-10 text-center text-red-600 shadow-[0px_3px_14px_rgba(226,225,249,0.98)]">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-8">
            <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">Substockist Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2">ID</p>
                  <p className="font-semibold text-gray-800">{substockist.substockistId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2">Name</p>
                  <p className="font-semibold text-gray-800">{`${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2">Phone</p>
                  <p className="font-semibold text-gray-800">{substockist.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400 mb-2">Email</p>
                  <p className="font-semibold text-gray-800">{substockist.email || 'Not provided'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase text-gray-400 mb-2">Address</p>
                  <p className="font-semibold text-gray-800">{substockist.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-6">Payment Summary</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-blue-50 border border-blue-100">
                  <div className="rounded-2xl bg-blue-500 p-3 text-white"><DollarSign size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-blue-600">Total Amount</p>
                    <p className="text-2xl font-semibold text-blue-900">${summary.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <div className="rounded-2xl bg-emerald-500 p-3 text-white"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-emerald-600">Paid Amount</p>
                    <p className="text-2xl font-semibold text-emerald-900">${summary.paid.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-rose-50 border border-rose-100">
                  <div className="rounded-2xl bg-rose-500 p-3 text-white"><Clock size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-rose-600">Due Amount</p>
                    <p className="text-2xl font-semibold text-rose-900">${summary.due.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">Date-range analytics</p>
                <h3 className="text-xl font-semibold text-gray-700">Substockist payment history</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm text-gray-500">
                    From
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </label>
                  <label className="text-sm text-gray-500">
                    To
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </label>
                </div>
                <div className="inline-flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPeriod(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${period === option ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={360}
            />

            {history.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                No payments found for the selected date range.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubstockistProfile;
