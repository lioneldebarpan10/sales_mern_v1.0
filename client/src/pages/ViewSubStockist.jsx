import React, { useState } from 'react';
import { Search, Filter, Trash2, MoreVertical, FileText } from 'lucide-react';

const ViewSubStockist = () => {
    // Mock Data
    const [substockists, setSubstockists] = useState([
        { id: 'SUB001', name: 'John Doe', date: '2023-10-25', totalPayment: 5000, paidPayment: 5000, duePayment: 0 },
        { id: 'SUB002', name: 'Jane Smith', date: '2023-11-01', totalPayment: 12000, paidPayment: 8000, duePayment: 4000 },
        { id: 'SUB003', name: 'Alice Johnson', date: '2023-11-05', totalPayment: 3000, paidPayment: 1000, duePayment: 2000 },
        { id: 'SUB004', name: 'Robert Brown', date: '2023-11-10', totalPayment: 7500, paidPayment: 7500, duePayment: 0 },
        { id: 'SUB005', name: 'Michael Wilson', date: '2023-11-12', totalPayment: 10000, paidPayment: 2000, duePayment: 8000 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter Logic
    const filteredStockists = substockists.filter(stockist => {
        const matchesSearch =
            stockist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stockist.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stockist.date.includes(searchTerm);

        const status = stockist.duePayment > 0 ? 'Due' : 'Paid';
        const matchesFilter = statusFilter === 'All' || status === statusFilter;

        return matchesSearch && matchesFilter;
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this Substockist?')) {
            setSubstockists(substockists.filter(s => s.id !== id));
        }
    };

    const getStatusColor = (due) => {
        return due > 0
            ? 'text-orange-500 bg-orange-50 border border-orange-100'
            : 'text-green-500 bg-green-50 border border-green-100';
    };

    return (
        <div className="p-2">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-700 mb-8">View All Substockists</h2>

            <div className="bg-white p-6 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by ID, Name, Date..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={20} className="text-indigo-500 flex-shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-gray-700 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Due">Due</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar pb-4">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-gray-100 text-left">
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Payment</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStockists.length > 0 ? (
                                filteredStockists.map((item, index) => {
                                    const status = item.duePayment > 0 ? 'Due' : 'Paid';
                                    return (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-navy-700">{item.date}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-indigo-500">#{item.id}</td>
                                            <td className="py-4 px-4 text-sm font-bold text-navy-700 flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                                                    {item.name.charAt(0)}{item.name.split(' ')[1]?.charAt(0)}
                                                </div>
                                                {item.name}
                                            </td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-600">${item.totalPayment}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-green-600 font-bold">${item.paidPayment}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-red-500 font-bold">${item.duePayment}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${getStatusColor(item.duePayment)}`}>
                                                    {status === 'Paid' ? <FileText size={12} /> : <MoreVertical size={12} />}
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group relative"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-10 text-center text-gray-500">
                                        No substockists found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ViewSubStockist;