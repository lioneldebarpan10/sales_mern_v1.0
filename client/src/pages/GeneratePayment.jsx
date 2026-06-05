import React, { useState, useEffect, useRef } from 'react';
import { User, Hash, Calendar, DollarSign, CreditCard, Wallet, Calculator, Zap, X, CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

/* ── Field ── */
const Field = ({ label, optional, icon, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
            {label}{' '}
            {optional
                ? <span className="normal-case font-normal" style={{ color: '#64748b' }}>(Auto)</span>
                : <span style={{ color: '#f43f5e' }}>*</span>}
        </label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#64748b' }}>{icon}</span>
            {children}
        </div>
    </div>
);

const inputCls = 'w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-200 outline-none';
const inputBase = { border: '1.5px solid var(--input-border)', background: 'var(--surface-alt)', color: 'var(--text)', fontFamily: 'Inter,sans-serif' };
const focusOn  = e => { e.target.style.borderColor='var(--primary)'; e.target.style.background='var(--surface-alt)'; e.target.style.boxShadow='0 0 0 3px var(--primary-light)'; };
const focusOff = e => { e.target.style.borderColor='var(--input-border)'; e.target.style.background='var(--surface-alt)'; e.target.style.boxShadow='none'; };

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
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const dropdownRef = useRef(null);

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
        
        // Trigger search on stockistId change
        if (name === 'stockistId') {
            setShowDropdown(true);
            setIdFound(false);
            setIdLookupError('');
        }
    };

    // Search substockists
    useEffect(() => {
        const timer = setTimeout(async () => {
            const searchTerm = formData.stockistId.trim();
            if (!searchTerm) { 
                setSearchResults([]);
                setShowDropdown(false);
                setIdLookupError('');
                setIdFound(false);
                return;
            }
            
            setSearchLoading(true);
            try {
                const res = await api.get('/api/substockist', { params: { search: searchTerm } });
                setSearchResults(res.data.data || []);
                setShowDropdown(true);
                setIdLookupError('');
            } catch (err) {
                setSearchResults([]);
                setIdLookupError('Failed to search substockists');
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [formData.stockistId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Select substockist from dropdown
    const selectSubstockist = (substockist) => {
        const fullName = `${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`.trim();
        setFormData(prev => ({ 
            ...prev, 
            stockistName: fullName,
            stockistId: substockist.substockistId
        }));
        setIdFound(true);
        setIdLookupError('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!idFound) { toast.error('Please select a valid substockist from the list'); return; }
        if (parseFloat(formData.totalPayment) <= 0) { toast.error('Total payment must be greater than 0'); return; }
        if (!formData.stockistName.trim()) { toast.error('Substockist name is required'); return; }
        if (new Date(formData.fromDate) > new Date(formData.toDate)) { toast.error('From date cannot be after To date'); return; }

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
            toast.success('Payment generated successfully!');
            setFormData(prev => ({ ...prev, stockistName:'', stockistId:'', totalPayment:'', paidPayment:'', duePayment:0 }));
            setIdFound(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate payment');
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
                                    readOnly={idFound}
                                    className={inputCls}
                                    style={{ ...inputBase, background: idFound ? 'rgba(16,185,129,0.1)' : 'var(--surface-alt)', borderColor: idFound ? '#10b981' : 'var(--input-border)', cursor: idFound ? 'not-allowed' : 'auto' }}
                                    onFocus={focusOn} onBlur={focusOff}
                                />
                                {idLookupError && (
                                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#f43f5e' }}>
                                        <X size={11} />{idLookupError}
                                    </p>
                                )}
                                {idFound && (
                                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--paid-color)' }}>
                                        <CheckCircle size={11} />Partner found
                                    </p>
                                )}
                            </Field>

                            {/* ID */}
                            <Field label="Substockist ID" icon={<Hash size={16} />}>
                                <input
                                    type="text" name="stockistId" id="stockist-id"
                                    value={formData.stockistId} onChange={handleChange}
                                    required placeholder="Enter ID or name"
                                    className={inputCls} style={inputBase}
                                    onFocus={focusOn} onBlur={focusOff}
                                    autoComplete="off"
                                />
                                {/* Search Results Dropdown */}
                                {showDropdown && (
                                    <div 
                                        ref={dropdownRef}
                                        className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border shadow-lg"
                                        style={{ 
                                            background: 'var(--surface-alt)',
                                            borderColor: 'var(--input-border)',
                                            maxHeight: '250px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {searchLoading ? (
                                            <div className="p-3 text-center text-sm" style={{ color: '#64748b' }}>
                                                <span className="inline-block animate-spin">⟳</span> Searching...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((substockist, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => selectSubstockist(substockist)}
                                                    className="p-3 cursor-pointer border-b hover:opacity-80 transition-opacity last:border-b-0"
                                                    style={{ 
                                                        borderColor: 'var(--border)',
                                                        color: 'var(--text)'
                                                    }}
                                                >
                                                    <div className="font-medium text-sm">
                                                        {substockist.firstName} {substockist.middleName ? substockist.middleName + ' ' : ''}{substockist.lastName}
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#64748b' }}>
                                                        ID: {substockist.substockistId}
                                                    </div>
                                                </div>
                                            ))
                                        ) : formData.stockistId.trim() ? (
                                            <div className="p-3 text-center text-sm" style={{ color: '#64748b' }}>
                                                No results found
                                            </div>
                                        ) : null}
                                    </div>
                                )}
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
                                    style={{ ...inputBase, background: due > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', borderColor: due > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)', color: due > 0 ? 'var(--due-color)' : 'var(--paid-color)', fontWeight: 700 }}
                                />
                            </Field>
                        </div>

                        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <button
                                type="submit" id="generate-payment-submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                style={{
                                    background: loading ? 'var(--primary-light)' : 'var(--primary-gradient)',
                                    boxShadow: loading ? 'none' : '0 6px 20px var(--primary-light)',
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
                        <Zap size={16} color="var(--primary)" />
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Live Summary</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Total', value: total, style: { color: 'var(--primary)' }, bg: 'var(--primary-light)' },
                            { label: 'Paid',  value: paid,  style: { color: 'var(--paid-color)' }, bg: 'rgba(16,185,129,0.12)' },
                            { label: 'Due',   value: due,   style: { color: 'var(--due-color)' }, bg: 'rgba(244,63,94,0.12)' },
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
                            <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: '#94a3b8' }}>
                                <span>Payment Progress</span>
                                <span>{paidPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-alt)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,var(--primary),#10b981)' }}
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