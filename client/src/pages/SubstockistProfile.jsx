import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import Chart from 'react-apexcharts';
import api from '../services/api';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const SubstockistProfile = () => {
  const { id } = useParams();
  const [substockist, setSubstockist] = useState(null);
  const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/substockist/${id}`);
        setSubstockist(response.data.substockist);
        setSummary(response.data.summary || { total: 0, paid: 0, due: 0 });
        setWeeklyHistory(response.data.weeklyHistory || []);
        setMonthlyHistory(response.data.monthlyHistory || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load substockist profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const weekCount = 52;
  const weeklyCategories = Array.from({ length: weekCount }, (_, index) => `Week ${index + 1}`);
  const weeklyTotals = Array(weekCount).fill(0);
  const weeklyPaid = Array(weekCount).fill(0);
  const weeklyDue = Array(weekCount).fill(0);

  weeklyHistory.forEach((item) => {
    const idx = item._id - 1;
    if (idx >= 0 && idx < weekCount) {
      weeklyTotals[idx] = item.total || 0;
      weeklyPaid[idx] = item.paid || 0;
      weeklyDue[idx] = item.due || 0;
    }
  });

  const monthCategories = monthNames;
  const monthlyTotals = Array(12).fill(0);
  const monthlyPaid = Array(12).fill(0);
  const monthlyDue = Array(12).fill(0);
  monthlyHistory.forEach((item) => {
    const idx = item._id - 1;
    if (idx >= 0 && idx < 12) {
      monthlyTotals[idx] = item.total || 0;
      monthlyPaid[idx] = item.paid || 0;
      monthlyDue[idx] = item.due || 0;
    }
  });

  const lineChartOptions = {
    chart: {
      toolbar: { show: false }
    },
    colors: ['#2563eb', '#10b981', '#ef4444'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: weeklyCategories,
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

  const areaChartOptions = {
    chart: {
      toolbar: { show: false }
    },
    colors: ['#2563eb', '#10b981', '#ef4444'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: monthCategories,
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

          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">Weekly payment history</p>
                  <h3 className="text-xl font-semibold text-gray-700">Current year week summary</h3>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <Users size={18} />
                  Week by week
                </div>
              </div>
              <Chart
                options={lineChartOptions}
                series={[
                  { name: 'Total', data: weeklyTotals },
                  { name: 'Paid', data: weeklyPaid },
                  { name: 'Due', data: weeklyDue }
                ]}
                type="line"
                height={320}
              />
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">Monthly payment history</p>
                  <h3 className="text-xl font-semibold text-gray-700">Current year monthly overview</h3>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign size={18} />
                  Month by month
                </div>
              </div>
              <Chart
                options={areaChartOptions}
                series={[
                  { name: 'Total', data: monthlyTotals },
                  { name: 'Paid', data: monthlyPaid },
                  { name: 'Due', data: monthlyDue }
                ]}
                type="area"
                height={320}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubstockistProfile;
