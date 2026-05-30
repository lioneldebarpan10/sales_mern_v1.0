import React, { useState, useEffect, useCallback } from 'react';
import { User, Hash, Calendar, DollarSign, CreditCard, Wallet, Calculator, CheckCircle, X, Zap } from 'lucide-react';
import api from '../services/api';

/* ── Toast ── */
const Toast = ({ toasts, remove }) => (
    <div className="toast-container">
        {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
                {t.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                <span className="flex-1">{t.message}</span>
                <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', opacity:0.6 }}><X size={14} /></button>
            </div>
        ))}
    </div>
);

/* ── Field ── */
const Field = ({ label, optional, icon, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
            {label}{' '}
            {optional
                ? <span className="normal-case font-normal" style={{ color: '#94a3b8' }}>(Auto)</span>
                : <span style={{ color: '#f43f5e' }}>*</span>}
        </label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94a3b8' }}>{icon}</span>
            {children}
        </div>
    </div>
);

const inputCls = 'w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-200 outline-none';
const inputBase = { border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter,sans-serif' };
const focusOn  = e => { e.target.style.borderColor='#4f46e5'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 3px rgba(79,70,229,0.1)'; };
const focusOff = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.background='#f8fafc'; e.target.style.boxShadow='none'; };

const GeneratePayment = () => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        stockistName: '', stockistId: '',
        fromDate: today, toDate: today,
        totalPayment: '', paidPayment: '', duePayment: 0,
    });
    const [loading, setLoading] = useState(false);
    const [idLookupError, setIdLookupError] = useState('');
    const [idFound, setIdFound] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

    // Auto-calc due
    useEffect(() => {
        const total = parseFloat(formData.totalPayment) || 0;
        const paid  = parseFloat(formData.paidPayment)  || 0;
        const due   = total - paid;
        setFormData(prev => ({ ...prev, duePayment: due >= 0 ? due : 0 }));
    }, [formData.totalPayment, formData.paidPayment]);

    const handleChange = e => {
        const { name, value } = e.target;
        if ((name === 'totalPayment' || name === 'paidPayment') && parseFloat(value) < 0) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ID lookup
    useEffect(() => {
        const timer = setTimeout(async () => {
            const id = formData.stockistId.trim();
            if (!id) { setIdLookupError(''); setIdFound(false); return; }
            try {
                const res = await api.get(`/api/substockist/${id}`);
                const sub = res.data.substockist;
                const fullName = `${sub.firstName} ${sub.middleName ? sub.middleName + ' ' : ''}${sub.lastName}`.trim();
                setFormData(prev => ({ ...prev, stockistName: fullName }));
                setIdLookupError('');
                setIdFound(true);
            } catch {
                setIdLookupError('Substockist ID not found');
                setIdFound(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [formData.stockistId]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (idLookupError) { addToast(idLookupError, 'error'); return; }
        if (parseFloat(formData.totalPayment) <= 0) { addToast('Total payment must be greater than 0', 'error'); return; }
        if (!formData.stockistName.trim()) { addToast('Substockist name is required', 'error'); return; }
        if (new Date(formData.fromDate) > new Date(formData.toDate)) { addToast('From date cannot be after To date', 'error'); return; }

        setLoading(true);
        try {
            await api.post('/api/payment', {
                stockistName:  formData.stockistName,
                substockistId: formData.stockistId,
                fromDate:      formData.fromDate,
                toDate:        formData.toDate,
                totalAmount:   parseFloat(formData.totalPayment),
                paidAmount:    parseFloat(formData.paidPayment),
            });
            addToast('Payment generated successfully!', 'success');
            setFormData(prev => ({ ...prev, stockistName:'', stockistId:'', totalPayment:'', paidPayment:'', duePayment:0 }));
            setIdFound(false);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to generate payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const total = parseFloat(formData.totalPayment) || 0;
    const paid  = parseFloat(formData.paidPayment)  || 0;
    const due   = formData.duePayment;
    const paidPct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

    return (
        <div className="animate-fade-in">
            <Toast toasts={toasts} remove={removeToast} />

            {/* Header */}
            <div className="page-header mb-8">
                <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Payments</p>
                    <h1 className="text-2xl font-bold text-white">Generate Payment</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Record a payment entry for a substockist.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                {/* Form card */}
                <div className="card p-7 animate-slide-up">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

                            {/* Name */}
                            <Field label="Substockist Name" icon={<User size={16} />}>
                                <input
                                    type="text" name="stockistName" id="stockist-name"
                                    value={formData.stockistName} onChange={handleChange}
                                    required placeholder="Auto-filled from ID"
                                    className={inputCls}
                                    style={{ ...inputBase, background: idFound ? '#f0fdf4' : '#f8fafc', borderColor: idFound ? '#6ee7b7' : '#e2e8f0' }}
                                    onFocus={focusOn} onBlur={focusOff}
                                />
                                {idLookupError && (
                                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#f43f5e' }}>
                                        <X size={11} />{idLookupError}
                                    </p>
                                )}
                                {idFound && (
                                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#059669' }}>
                                        <CheckCircle size={11} />Partner found
                                    </p>
                                )}
                            </Field>

                            {/* ID */}
                            <Field label="Substockist ID" icon={<Hash size={16} />}>
                                <input
                                    type="text" name="stockistId" id="stockist-id"
                                    value={formData.stockistId} onChange={handleChange}
                                    required placeholder="Unique ID"
                                    className={inputCls} style={inputBase}
                                    onFocus={focusOn} onBlur={focusOff}
                                />
                            </Field>

                            {/* From Date */}
                            <Field label="From Date" icon={<Calendar size={16} />}>
                                <input type="date" name="fromDate" id="from-date" value={formData.fromDate} onChange={handleChange} required className={inputCls} style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                            </Field>

                            {/* To Date */}
                            <Field label="To Date" icon={<Calendar size={16} />}>
                                <input type="date" name="toDate" id="to-date" value={formData.toDate} onChange={handleChange} required className={inputCls} style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                            </Field>

                            {/* Total */}
                            <Field label="Total Payment" icon={<DollarSign size={16} />}>
                                <input type="number" name="totalPayment" id="total-payment" value={formData.totalPayment} onChange={handleChange} required min="1" placeholder="0.00" className={inputCls} style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                            </Field>

                            {/* Paid */}
                            <Field label="Paid Payment" icon={<CreditCard size={16} />}>
                                <input type="number" name="paidPayment" id="paid-payment" value={formData.paidPayment} onChange={handleChange} required min="0" placeholder="0.00" className={inputCls} style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                            </Field>

                            {/* Due — read only */}
                            <Field label="Due Payment" optional icon={<Calculator size={16} />}>
                                <input
                                    type="number" name="duePayment" value={formData.duePayment} readOnly
                                    className={inputCls}
                                    style={{ ...inputBase, background: due > 0 ? '#fff1f2' : '#f0fdf4', borderColor: due > 0 ? '#fda4af' : '#6ee7b7', color: due > 0 ? '#be123c' : '#065f46', fontWeight: 700 }}
                                />
                            </Field>
                        </div>

                        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                            <button
                                type="submit" id="generate-payment-submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                style={{
                                    background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                    boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.35)',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : <Wallet size={16} />}
                                {loading ? 'Generating…' : 'Generate Payment'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Live summary card */}
                <div className="card p-6 animate-slide-up h-fit" style={{ animationDelay: '80ms' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <Zap size={16} color="#4f46e5" />
                        <h3 className="text-sm font-bold" style={{ color: '#0f172a' }}>Live Summary</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Total', value: total, style: { color: '#1d4ed8' }, bg: '#eff6ff' },
                            { label: 'Paid',  value: paid,  style: { color: '#065f46' }, bg: '#f0fdf4' },
                            { label: 'Due',   value: due,   style: { color: '#be123c' }, bg: '#fff1f2' },
                        ].map(({ label, value, style, bg }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: bg }}>
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</span>
                                <span className="text-lg font-bold" style={style}>${value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                        <div className="mt-5">
                            <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                                <span>Payment Progress</span>
                                <span>{paidPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,#4f46e5,#10b981)' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneratePayment;