import React, { useState, useEffect } from 'react';
import { User, Hash, Calendar, DollarSign, CreditCard, Wallet, Calculator } from 'lucide-react';
import api from '../services/api';

const GeneratePayment = () => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        stockistName: '',
        stockistId: '',
        fromDate: today,
        toDate: today,
        totalPayment: '',
        paidPayment: '',
        duePayment: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idLookupError, setIdLookupError] = useState('');

    // Auto-calculate Due Payment whenever Total or Paid changes
    useEffect(() => {
        const total = parseFloat(formData.totalPayment) || 0;
        const paid = parseFloat(formData.paidPayment) || 0;
        const due = total - paid;
        setFormData(prev => ({ ...prev, duePayment: due >= 0 ? due : 0 }));
    }, [formData.totalPayment, formData.paidPayment]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent negative numbers for payments
        if ((name === 'totalPayment' || name === 'paidPayment') && parseFloat(value) < 0) {
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            const id = formData.stockistId.trim();
            if (!id) {
                setIdLookupError('');
                return;
            }

            try {
                const response = await api.get(`/api/substockist/${id}`);
                const substockist = response.data.substockist;
                const fullName = `${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`.trim();
                setFormData(prev => ({ ...prev, stockistName: fullName }));
                setIdLookupError('');
            } catch (err) {
                setIdLookupError('Substockist ID not found');
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.stockistId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (idLookupError) {
            setError(idLookupError);
            return;
        }

        if (parseFloat(formData.totalPayment) <= 0) {
            setError('Total payment must be greater than 0');
            return;
        }

        if (!formData.stockistName.trim()) {
            setError('Substockist name is required');
            return;
        }

        setLoading(true);
        try {
            if (new Date(formData.fromDate) > new Date(formData.toDate)) {
                setError('From date cannot be after To date');
                setLoading(false);
                return;
            }

            await api.post('/api/payment', {
                stockistName: formData.stockistName,
                substockistId: formData.stockistId,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                totalAmount: parseFloat(formData.totalPayment),
                paidAmount: parseFloat(formData.paidPayment)
            });

            alert('Payment generated successfully!');
            setFormData(prev => ({
                ...prev,
                stockistName: '',
                stockistId: '',
                totalPayment: '',
                paidPayment: '',
                duePayment: 0
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-700 mb-8">Generate Payment</h2>

            <div className="bg-white p-8 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                        {/* Sub Stockist Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Substockist Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="stockistName"
                                    value={formData.stockistName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                    placeholder="Enter Name"
                                />
                        {idLookupError && (
                            <p className="text-xs text-red-600 mt-2">{idLookupError}</p>
                        )}
                            </div>
                        </div>

                        {/* Sub Stockist ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Substockist ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="stockistId"
                                    value={formData.stockistId}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                    placeholder="Unique ID"
                                />
                            </div>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                From Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Total Payment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Payment <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="totalPayment"
                                    value={formData.totalPayment}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Paid Payment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paid Payment <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="paidPayment"
                                    value={formData.paidPayment}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Due Payment (Read Only / Auto-filled) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Payment <span className="text-gray-400 font-normal">(Auto-calculated)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calculator size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="duePayment"
                                    value={formData.duePayment}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold outline-none"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                        >
                            <Wallet size={18} />
                            {loading ? 'Generating...' : 'Generate Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GeneratePayment;