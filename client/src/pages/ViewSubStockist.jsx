import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Trash2, Eye, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

/* ── Skeleton rows ── */
const SkeletonRow = () => (
    <tr>
        {[1,2,3,4,5,6].map(i => (
            <td key={i} className="py-4 px-4">
                <div className="skeleton h-4 rounded" style={{ width: i === 3 ? 140 : i === 5 ? 160 : 80 }} />
            </td>
        ))}
    </tr>
);

/* ── Empty state ── */
const EmptyState = ({ search }) => (
    <tr>
        <td colSpan={6}>
            <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-alt)' }}>
                    <Users size={26} color="var(--muted)" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {search ? `No results for "${search}"` : 'No substockists yet'}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {search ? 'Try a different search term.' : 'Add your first substockist to get started.'}
                </p>
            </div>
        </td>
    </tr>
);

const ViewSubStockist = () => {
    const [substockists, setSubstockists] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchSubstockists = async (search = '') => {
        setLoading(true);
        try {
            const res = await api.get('/api/substockist', { params: { search, t: Date.now() } });
            setSubstockists(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to load substockists');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubstockists(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchSubstockists(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async id => {
        toast.warn(
            ({ closeToast }) => (
                <div>
                    <p className="text-sm font-semibold mb-2">Delete this substockist and all related payments?</p>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 rounded text-xs font-semibold bg-rose-500 text-white"
                            onClick={async () => {
                                closeToast();
                                setDeletingId(id);
                                try {
                                    await api.delete(`/api/substockist/${id}`);
                                    toast.success('Substockist deleted successfully');
                                    fetchSubstockists(searchTerm);
                                } catch (err) {
                                    toast.error(err.response?.data?.message || 'Unable to delete substockist');
                                } finally {
                                    setDeletingId(null);
                                }
                            }}
                        >Delete</button>
                        <button className="px-3 py-1 rounded text-xs font-semibold bg-slate-600 text-white" onClick={closeToast}>Cancel</button>
                    </div>
                </div>
            ),
            { autoClose: false, closeOnClick: false }
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header mb-8">
                <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Management</p>
                    <h1 className="text-2xl font-bold text-white">View All Substockists</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Browse, search, and manage your registered partners.
                    </p>
                </div>
            </div>

            <div className="card p-6 animate-slide-up">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }} />
                        <input
                            type="text"
                            id="substockist-search"
                            placeholder="Search by ID or name…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
                            style={{ border: '1.5px solid var(--input-border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                            onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-light)'; e.target.style.background='var(--surface-alt)'; }}
                            onBlur={e => { e.target.style.borderColor='var(--input-border)'; e.target.style.boxShadow='none'; e.target.style.background='var(--surface-alt)'; }}
                        />
                    </div>

                    <button
                        type="button"
                        id="refresh-btn"
                        onClick={() => fetchSubstockists(searchTerm)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{ background: 'var(--primary-gradient)', color: '#fff', boxShadow: '0 4px 14px var(--primary-light)' }}
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Summary pill */}
                {!loading && (
                    <div className="mb-4">
                        <span className="badge badge-neutral">
                            {substockists.length} {substockists.length === 1 ? 'partner' : 'partners'} found
                        </span>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="premium-table w-full min-w-[700px]">
                        <thead>
                            <tr>
                                <th>Created At</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                            ) : substockists.length > 0 ? (
                                substockists.map(item => (
                                    <tr key={item._id}>
                                        <td>
                                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                                {new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral">{item.substockistId}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'var(--primary-gradient)', color: '#fff' }}
                                                >
                                                    {item.firstName?.[0]}{item.lastName?.[0]}
                                                </div>
                                                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                                                    {item.firstName} {item.middleName ? item.middleName + ' ' : ''}{item.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text)' }}>{item.phone}</td>
                                        <td style={{ color: 'var(--muted)' }}>{item.email || '—'}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/view-substockist/${item._id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background='var(--primary-light-border)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background='var(--primary-light)'; }}
                                                >
                                                    <Eye size={13} /> View
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                                                    style={{ background: 'rgba(244,63,94,0.12)', color: '#fda4af', cursor: deletingId === item._id ? 'not-allowed' : 'pointer', opacity: deletingId === item._id ? 0.6 : 1 }}
                                                    onMouseEnter={e => { if (deletingId !== item._id) e.currentTarget.style.background='rgba(244,63,94,0.22)'; }}
                                                    onMouseLeave={e => { if (deletingId !== item._id) e.currentTarget.style.background='rgba(244,63,94,0.12)'; }}
                                                >
                                                    <Trash2 size={13} />
                                                    {deletingId === item._id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <EmptyState search={searchTerm} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewSubStockist;
