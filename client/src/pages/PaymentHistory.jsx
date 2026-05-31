import React, { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, CreditCard, TrendingUp, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import api from '../services/api'

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Paid',         value: 'paid' },
  { label: 'Due',          value: 'due'  },
]

/* ── Skeleton rows ── */
const SkeletonRow = () => (
  <tr>
    {[100,80,140,90,90,80,70,70].map((w, i) => (
      <td key={i} className="py-4 px-4">
        <div className="skeleton h-4 rounded" style={{ width: w }} />
      </td>
    ))}
  </tr>
)

/* ── Status Badge ── */
const StatusBadge = ({ due }) =>
  due === 0
    ? <span className="badge badge-paid"><CheckCircle2 size={11} />Paid</span>
    : <span className="badge badge-due"><Clock size={11} />Due</span>

const PaymentHistory = () => {
  const [payments, setPayments]       = useState([])
  const [page, setPage]               = useState(1)
  const [limit]                       = useState(10)
  const [totalPages, setTotalPages]   = useState(1)
  const [totalCount, setTotalCount]   = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [searchTerm, setSearchTerm]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus]           = useState('all')

  const fetchPayments = async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/payment', {
        params: { page: currentPage, limit, search: searchQuery, status }
      })
      setPayments(res.data.data || [])
      setPage(res.data.meta.page || currentPage)
      setTotalPages(res.data.meta.totalPages || 1)
      setTotalCount(res.data.meta.totalCount || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payment history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchTerm.trim()), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => { fetchPayments(1) }, [searchQuery, status])

  /* summary from visible data */
  const totalAmt = payments.reduce((s, p) => s + (p.totalAmount || 0), 0)
  const paidAmt  = payments.reduce((s, p) => s + (p.paidAmount  || 0), 0)
  const dueAmt   = payments.reduce((s, p) => s + (p.dueAmount   || 0), 0)

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Finance
            </p>
            <h1 className="text-2xl font-bold text-white">Payment History</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Filter, search and track all recorded payment transactions.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
            <span className="text-sm font-semibold text-white">{totalCount} records</span>
          </div>
        </div>
      </div>

      {/* ── Mini stat strip ── */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 animate-slide-up">
          {[
            { label:'Page Total',  value: totalAmt, icon:<DollarSign size={16} />,    gradient:'var(--primary-gradient)', text:'var(--strip-total-text)', bg:'var(--primary-light)' },
            { label:'Page Paid',   value: paidAmt,  icon:<CheckCircle2 size={16} />,  gradient:'linear-gradient(135deg,#059669,#10b981)', text:'var(--strip-paid-text)', bg:'rgba(16,185,129,0.12)' },
            { label:'Page Due',    value: dueAmt,   icon:<Clock size={16} />,          gradient:'linear-gradient(135deg,#e11d48,#f43f5e)', text:'var(--strip-due-text)', bg:'rgba(244,63,94,0.12)' },
          ].map(c => (
            <div key={c.label} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: c.gradient }}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.text }}>${c.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main card ── */}
      <div className="card p-6 animate-slide-up">
        {/* Controls row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }} />
            <input
              id="payment-search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID or date…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
              style={{ border: '1.5px solid var(--input-border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
              onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-light)'; e.target.style.background='var(--surface-alt)'; }}
              onBlur={e => { e.target.style.borderColor='var(--input-border)'; e.target.style.boxShadow='none'; e.target.style.background='var(--surface-alt)'; }}
            />
          </div>

          {/* Status filter */}
          <div className="inline-flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-alt)' }}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                id={`status-${opt.value}`}
                onClick={() => setStatus(opt.value)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={status === opt.value
                  ? { background: 'var(--surface-strong)', color: 'var(--primary)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }
                  : { background: 'transparent', color: 'var(--muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {page} / {totalPages}
            </span>
            <button
              id="prev-page"
              onClick={() => page > 1 && fetchPayments(page - 1)}
              disabled={page <= 1 || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                background: page <= 1 || loading ? 'var(--surface-alt)' : 'var(--primary-gradient)',
                color: page <= 1 || loading ? 'var(--muted)' : '#fff',
                border: page <= 1 || loading ? '1px solid var(--border)' : 'none',
                cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              id="next-page"
              onClick={() => page < totalPages && fetchPayments(page + 1)}
              disabled={page >= totalPages || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                background: page >= totalPages || loading ? 'var(--surface-alt)' : 'var(--primary-gradient)',
                color: page >= totalPages || loading ? 'var(--muted)' : '#fff',
                border: page >= totalPages || loading ? '1px solid var(--border)' : 'none',
                cursor: page >= totalPages || loading ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div className="py-3 px-4 rounded-xl mb-4 text-sm animate-fade-in" style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.25)' }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="premium-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>ID</th>
                <th>Name</th>
                <th>From</th>
                <th>To</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-alt)' }}>
                        <CreditCard size={26} color="var(--muted)" />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>No payments recorded yet</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Generated payments will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map(payment => {
                  const sub  = payment.substockist || {}
                  const name = sub.firstName
                    ? `${sub.firstName} ${sub.middleName ? sub.middleName + ' ' : ''}${sub.lastName}`
                    : 'Unknown'
                  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
                  return (
                    <tr key={payment._id}>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{fmt(payment.paymentDate)}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{sub.substockistId || '—'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'var(--primary-gradient)', color: '#fff' }}
                          >
                            {sub.firstName?.[0]}{sub.lastName?.[0]}
                          </div>
                          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{name}</span>
                        </div>
                      </td>
                      <td><span className="text-xs" style={{ color: 'var(--muted)' }}>{fmt(payment.fromDate)}</span></td>
                      <td><span className="text-xs" style={{ color: 'var(--muted)' }}>{fmt(payment.toDate)}</span></td>
                      <td><span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>${payment.totalAmount.toLocaleString()}</span></td>
                      <td><span className="font-semibold text-sm" style={{ color: 'var(--paid-color)' }}>${payment.paidAmount.toLocaleString()}</span></td>
                      <td><span className="font-semibold text-sm" style={{ color: payment.dueAmount > 0 ? 'var(--due-color)' : 'var(--paid-color)' }}>${payment.dueAmount.toLocaleString()}</span></td>
                      <td><StatusBadge due={payment.dueAmount} /></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        {!loading && payments.length > 0 && (
          <div className="mt-4 flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--text)' }}>{payments.length}</span> of{' '}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{totalCount}</span> records
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchPayments(p)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={page === p
                    ? { background: 'var(--primary-gradient)', color: '#fff', border: 'none' }
                    : { background: 'var(--surface-alt)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }
                  }
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-xs" style={{ color: '#94a3b8' }}>…</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory
