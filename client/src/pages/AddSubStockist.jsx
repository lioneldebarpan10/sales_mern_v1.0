import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Calendar, Hash, Users, ArrowRight, CheckCircle, X } from 'lucide-react';
import api from '../services/api';

/* ── Toast ── */
const Toast = ({ toasts, remove }) => (
    <div className="toast-container">
        {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
                {t.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
                <span className="flex-1">{t.message}</span>
                <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', opacity:0.6 }}>
                    <X size={14} />
                </button>
            </div>
        ))}
    </div>
);

/* ── Field ── */
const Field = ({ label, optional, icon, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
            {label} {optional
                ? <span className="normal-case text-xs font-normal" style={{ color: '#94a3b8' }}>(Optional)</span>
                : <span style={{ color: '#f43f5e' }}>*</span>}
        </label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94a3b8' }}>
                {icon}
            </span>
            {children}
        </div>
    </div>
);

const inputCls = 'w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all duration-200 outline-none';
const inputStyle = {
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#1e293b',
    fontFamily: 'Inter,sans-serif',
};

const AddSubStockist = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        stockistId: '', firstName: '', middleName: '', lastName: '',
        address: '', phone: '', email: '',
        creationDate: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const removeToast = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFocus = e => {
        e.target.style.borderColor = '#4f46e5';
        e.target.style.background = '#fff';
        e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
    };
    const handleBlur = e => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.background = '#f8fafc';
        e.target.style.boxShadow = 'none';
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/substockist', {
                substockistId: formData.stockistId,
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
            });
            addToast('Substockist added successfully!', 'success');
            setTimeout(() => navigate('/view-substockist'), 1200);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to create substockist', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Toast toasts={toasts} remove={removeToast} />

            {/* Page header */}
            <div className="page-header mb-8">
                <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Substockist Management
                    </p>
                    <h1 className="text-2xl font-bold text-white">Add New Sub-Stockist</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Fill in the details to register a new partner.
                    </p>
                </div>
            </div>

            {/* Form card */}
            <div className="card p-8 mb-6 animate-slide-up">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

                        {/* ID — full width */}
                        <div className="lg:col-span-3">
                            <Field label="Sub Stockist ID" icon={<Hash size={16} />}>
                                <input
                                    type="text" name="stockistId" id="stockist-id"
                                    value={formData.stockistId} onChange={handleChange} required
                                    placeholder="Enter Unique ID"
                                    className={inputCls} style={inputStyle}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </Field>
                        </div>

                        <Field label="First Name" icon={<User size={16} />}>
                            <input type="text" name="firstName" id="first-name" value={formData.firstName} onChange={handleChange} required placeholder="First Name" className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        <Field label="Middle Name" optional icon={<User size={16} />}>
                            <input type="text" name="middleName" id="middle-name" value={formData.middleName} onChange={handleChange} placeholder="Middle Name" className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        <Field label="Last Name" icon={<User size={16} />}>
                            <input type="text" name="lastName" id="last-name" value={formData.lastName} onChange={handleChange} required placeholder="Last Name" className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        <Field label="Phone Number" icon={<Phone size={16} />}>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        <Field label="Email" optional icon={<Mail size={16} />}>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        <Field label="Date of Creation" icon={<Calendar size={16} />}>
                            <input type="date" name="creationDate" id="creation-date" value={formData.creationDate} onChange={handleChange} required className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </Field>

                        {/* Address — full width */}
                        <div className="lg:col-span-3">
                            <Field label="Sub Stockist Address" optional icon={<MapPin size={16} />}>
                                <textarea
                                    name="address" id="address"
                                    value={formData.address} onChange={handleChange}
                                    rows="3" placeholder="Enter full address"
                                    className={`${inputCls} resize-none`} style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4"
                        style={{ borderTop: '1px solid #f1f5f9' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/view-substockist')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                            style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0' }}
                        >
                            <Users size={16} />
                            View All Substockists
                            <ArrowRight size={15} />
                        </button>

                        <button
                            type="submit"
                            id="add-substockist-submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                            style={{
                                background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.35)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <><User size={16} />Add Substockist</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubStockist;