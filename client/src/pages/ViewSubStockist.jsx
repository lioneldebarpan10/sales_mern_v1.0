import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';

const ViewSubStockist = () => {
  const [substockists, setSubstockists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSubstockists = async (search = '') => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/substockist', {
        params: { search }
      });
      setSubstockists(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load substockists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstockists();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSubstockists(searchTerm);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <div className="p-2">
      <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-700 mb-8">View All Substockists</h2>

      <div className="bg-white p-6 rounded-3xl shadow-[0px_3px_14px_rgba(226,225,249,0.98)] border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading substockists...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="py-4 px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody>
                {substockists.length > 0 ? (
                  substockists.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-navy-700">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm font-bold text-indigo-500">{item.substockistId}</td>
                      <td className="py-4 px-4 text-sm font-bold text-navy-700">{`${item.firstName} ${item.middleName ? item.middleName + ' ' : ''}${item.lastName}`}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-600">{item.phone}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-600">{item.email || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      No substockists found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubStockist;
