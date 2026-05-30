import React, { useEffect, useState } from 'react'
import { Search, ArrowLeft, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Due', value: 'due' }
]

const PaymentHistory = () => {
  const [payments, setPayments] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('all')

  const fetchPayments = async (currentPage = 1) => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/payment', {
        params: {
          page: currentPage,
          limit,
          search: searchQuery,
          status
        }
      })

      setPayments(response.data.data || [])
      setPage(response.data.meta.page || currentPage)
      setTotalPages(response.data.meta.totalPages || 1)
      setTotalCount(response.data.meta.totalCount || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payment history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchPayments(1)
  }, [searchQuery, status])

  const handlePrev = () => {
    if (page > 1) {
      fetchPayments(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      fetchPayments(page + 1)
    }
  }

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-700">Payment History</h2>
          <p className="text-sm text-gray-500 mt-2">Filter by status or search by name, ID, or payment date.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
        <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr_1fr] items-end mb-6">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by substockist name, ID, or payment date"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block text-sm text-slate-600">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="inline-flex gap-2">
              <button
                onClick={handlePrev}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading payments...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">{error}</div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No payments have been recorded yet.</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Substockist ID</th>
                  <th className="py-4 px-4">Substockist Name</th>
                  <th className="py-4 px-4">From</th>
                  <th className="py-4 px-4">To</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Paid</th>
                  <th className="py-4 px-4">Due</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const sub = payment.substockist || {}
                  const name = sub.firstName
                    ? `${sub.firstName} ${sub.middleName ? `${sub.middleName} ` : ''}${sub.lastName}`
                    : 'Unknown'
                  return (
                    <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-700">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-indigo-600">{sub.substockistId || '—'}</td>
                      <td className="py-4 px-4 text-sm text-slate-700">{name}</td>
                      <td className="py-4 px-4 text-sm text-slate-700">{new Date(payment.fromDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm text-slate-700">{new Date(payment.toDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-900">${payment.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-emerald-700">${payment.paidAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-rose-700">${payment.dueAmount.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory
