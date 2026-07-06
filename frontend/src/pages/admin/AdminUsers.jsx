import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { FiSearch, FiRefreshCw, FiUserCheck, FiUserX, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPag]    = useState({});
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (debounced) params.set('search', debounced);
      const res = await API.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setPag({ total: res.data.total, pages: res.data.pages });
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }, [page, debounced]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (userId, currentActive) => {
    try {
      const res = await API.put(`/admin/users/${userId}/toggle-active`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"/>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 bg-white">
          <FiRefreshCw size={13}/> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-3">{pagination.total || 0} users total</p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['User','Email','Role','Status','Joined','Last Login','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_,i) => (
                  <tr key={i} className="border-b animate-pulse">
                    {[...Array(7)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded"/></td>)}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400">No users found</td></tr>
              ) : users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium truncate max-w-[130px]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium w-fit">
                        <FiShield size={10}/> Admin
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{user.lastLogin ? formatDate(user.lastLogin) : '—'}</td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="text-xs text-gray-400 italic">Admin</span>
                    ) : (
                      <button onClick={() => handleToggle(user._id, user.isActive)} title={user.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        {user.isActive ? <FiUserX size={16}/> : <FiUserCheck size={16}/>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {[...Array(pagination.pages)].map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-9 h-9 rounded-md text-sm font-medium ${page===i+1?'bg-yellow-400 text-gray-900':'bg-gray-100 hover:bg-gray-200'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
