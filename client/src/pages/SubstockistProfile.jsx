import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Plus, X } from 'lucide-react';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';
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
  const [paymentRecoveryData, setPaymentRecoveryData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [fromDate, setFromDate] = useState(formatDateInput(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [toDate, setToDate] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [recoveryAmount, setRecoveryAmount] = useState('');
  const [recoveryNotes, setRecoveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        setPaymentRecoveryData(response.data.paymentDetails || []);
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

  const isLight = (localStorage.getItem('salesify-theme') || 'dark') === 'light';

  const chartSeries = [
    { name: 'Total', data: history.map((item) => item.total || 0) },
    { name: 'Paid', data: history.map((item) => item.paid || 0) },
    { name: 'Due', data: history.map((item) => item.due || 0) }
  ];

  const chartOptions = {
    chart: {
      toolbar: { show: false }
    },
    colors: isLight ? ['#0284c7', '#10b981', '#f43f5e'] : ['#6366f1', '#10b981', '#f43f5e'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartCategories,
      labels: { style: { colors: isLight ? '#475569' : '#94a3b8' } }
    },
    yaxis: {
      labels: { style: { colors: isLight ? '#475569' : '#94a3b8' }, formatter: (value) => `$${value}` }
    },
    tooltip: {
      theme: isLight ? 'light' : 'dark',
      y: { formatter: (value) => `$${value}` }
    },
    legend: { position: 'top', labels: { colors: isLight ? '#475569' : '#94a3b8' } },
    grid: { show: true, borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)', strokeDashArray: 4 }
  };

  const handleSubmitRecovery = async (e) => {
    e.preventDefault();
    if (!selectedPaymentId || !recoveryAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = parseFloat(recoveryAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/payment/${selectedPaymentId}/recovery`, {
        amount,
        notes: recoveryNotes
      });
      toast.success('Payment recovery recorded successfully!');
      setShowRecoveryForm(false);
      setSelectedPaymentId(null);
      setRecoveryAmount('');
      setRecoveryNotes('');
      // Refresh the payment data
      const response = await api.get(`/api/substockist/${id}`, {
        params: { from: fromDate, to: toDate, period }
      });
      setSummary(response.data.summary || { total: 0, paid: 0, due: 0 });
      setHistory(response.data.history || []);
      setPaymentRecoveryData(response.data.paymentDetails || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment recovery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text)]">Substockist Profile</h2>
          <p className="text-sm text-slate-400 mt-2">Detailed payment history and outstanding amounts for the selected substockist.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/view-substockist"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-alt)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-strong)] transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to list
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[var(--surface)] p-10 text-center text-slate-400 border border-[var(--border)] shadow-none">Loading profile...</div>
      ) : error ? (
        <div className="rounded-3xl bg-[rgba(244,63,94,0.12)] p-10 text-center text-rose-400 border border-[rgba(244,63,94,0.25)] shadow-none">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-8">
            <div className="rounded-3xl bg-[var(--surface)] p-6 shadow-none border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-6">Substockist Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--text)]">
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-2">ID</p>
                  <p className="font-semibold text-[var(--text)]">{substockist.substockistId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-2">Name</p>
                  <p className="font-semibold text-[var(--text)]">{`${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-2">Phone</p>
                  <p className="font-semibold text-[var(--text)]">{substockist.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 mb-2">Email</p>
                  <p className="font-semibold text-[var(--text)]">{substockist.email || 'Not provided'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase text-slate-500 mb-2">Address</p>
                  <p className="font-semibold text-[var(--text)]">{substockist.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--surface)] p-6 shadow-none border border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-6">Payment Summary</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-[var(--primary-light)] border border-[var(--primary-light-border)]">
                  <div className="rounded-2xl bg-[var(--primary)] p-3 text-white"><DollarSign size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-[var(--primary)] font-semibold">Total Amount</p>
                    <p className="text-2xl font-semibold text-[var(--text)]">${summary.total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
                  <div className="rounded-2xl bg-emerald-500 p-3 text-white"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-emerald-400 font-semibold">Paid Amount</p>
                    <p className="text-2xl font-semibold text-[var(--text)]">${summary.paid.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)]">
                  <div className="rounded-2xl bg-rose-500 p-3 text-white"><Clock size={20} /></div>
                  <div>
                    <p className="text-xs uppercase text-rose-400 font-semibold">Due Amount</p>
                    <p className="text-2xl font-semibold text-[var(--text)]">${summary.due.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[var(--surface)] p-6 shadow-none border border-[var(--border)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Date-range analytics</p>
                <h3 className="text-xl font-semibold text-[var(--text)]">Substockist payment history</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm text-slate-400">
                    From
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] px-3 py-2 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] outline-none"
                    />
                  </label>
                  <label className="text-sm text-slate-400">
                    To
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] px-3 py-2 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] outline-none"
                    />
                  </label>
                </div>
                <div className="inline-flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPeriod(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${period === option ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-alt)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-strong)]'}`}
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
              <div className="mt-6 rounded-3xl border border-dashed border-[rgba(255,255,255,0.08)] bg-[#0f172a] p-6 text-center text-slate-400">
                No payments found for the selected date range.
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[var(--surface)] p-6 shadow-none border border-[var(--border)] mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Payment Recovery</p>
                <h3 className="text-xl font-semibold text-[var(--text)]">Payment History & Due Recovery</h3>
              </div>
              <button
                onClick={() => setShowRecoveryForm(!showRecoveryForm)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer"
              >
                <Plus size={16} /> Record Payment
              </button>
            </div>

            {showRecoveryForm && (
              <form onSubmit={handleSubmitRecovery} className="mb-6 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-slate-400">Select Payment</label>
                    <select
                      value={selectedPaymentId || ''}
                      onChange={(e) => setSelectedPaymentId(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3 py-2 focus:border-[var(--primary)] outline-none"
                    >
                      <option value="">Choose a payment...</option>
                      {paymentRecoveryData.map((payment) => (
                        <option key={payment._id} value={payment._id}>
                          {new Date(payment.toDate).toLocaleDateString()} - Due: ${payment.dueAmount}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-slate-400">Recovery Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={recoveryAmount}
                      onChange={(e) => setRecoveryAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3 py-2 focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-slate-400">Notes</label>
                    <input
                      type="text"
                      value={recoveryNotes}
                      onChange={(e) => setRecoveryNotes(e.target.value)}
                      placeholder="Optional notes"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3 py-2 focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowRecoveryForm(false); setRecoveryAmount(''); setRecoveryNotes(''); }}
                    className="px-4 py-2 rounded-xl bg-[var(--surface-strong)] text-[var(--text)] border border-[var(--border)] hover:opacity-90 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            )}

            {paymentRecoveryData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="premium-table w-full">
                  <thead>
                    <tr>
                      <th>Date Range</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Recovery History</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paymentRecoveryData.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          {new Date(payment.fromDate).toLocaleDateString()} -{" "}
                          {new Date(payment.toDate).toLocaleDateString()}
                        </td>

                        <td>
                          ${payment.totalAmount.toLocaleString()}
                        </td>

                        <td className="text-emerald-400">
                          ${payment.paidAmount.toLocaleString()}
                        </td>

                        <td className="text-rose-400">
                          ${payment.dueAmount.toLocaleString()}
                        </td>

                        <td>
                          {payment.paymentRecovery &&
                            payment.paymentRecovery.length > 0 ? (
                            <div className="space-y-1">
                              {payment.paymentRecovery.map(
                                (recovery, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-[var(--text)]"
                                  >
                                    ${recovery.amount} on{" "}
                                    {new Date(
                                      recovery.recoveryDate
                                    ).toLocaleDateString()}

                                    {recovery.notes &&
                                      ` - ${recovery.notes}`}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">
                              No recovery
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[rgba(255,255,255,0.08)] bg-[#0f172a] p-6 text-center text-slate-400">
                No payment records found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubstockistProfile;