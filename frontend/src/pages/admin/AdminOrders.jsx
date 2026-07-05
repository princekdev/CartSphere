import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { FiSearch, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUSES = ['processing','confirmed','shipped','out_for_delivery','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPag]    = useState({});
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await API.get(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setPag({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await API.put(`/admin/orders/${orderId}`, { orderStatus: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
    setUpdating(null);
  };

  const displayed = search
    ? orders.filter(o => o._id.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o.user?.email?.toLowerCase().includes(search.toLowerCase()))
    : orders;

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Search order ID or customer…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white" />
        </div>
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
        </select>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 bg-white">
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3">{pagination.total || 0} orders total</p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['','Order','Customer','Date','Total','Payment','Status','Update Status'].map((h,i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_,i) => (
                  <tr key={i} className="border-b animate-pulse">
                    {[...Array(8)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded"/></td>)}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-gray-400">No orders found</td></tr>
              ) : displayed.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <button onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                        className="text-gray-400 hover:text-gray-700 transition-colors">
                        {expanded === order._id ? <FiChevronUp size={15}/> : <FiChevronDown size={15}/>}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-bold">{formatPrice(order.grandTotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.paymentStatus==='paid'    ? 'bg-green-100 text-green-700' :
                        order.paymentStatus==='pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}`}>{order.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                        {order.orderStatus?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id || ['delivered','cancelled'].includes(order.orderStatus)}
                        className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed bg-white">
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === order._id && (
                    <tr className="bg-yellow-50/60 border-b">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Items */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items Ordered</p>
                            <div className="space-y-2">
                              {order.items?.map((item,i) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border">
                                  <img src={item.image||'https://via.placeholder.com/32'} alt="" className="w-9 h-9 object-contain rounded"/>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                  </div>
                                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Address */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shipping Address</p>
                            <div className="bg-white rounded-lg px-4 py-3 border text-sm text-gray-700 space-y-0.5">
                              <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                              <p>{order.shippingAddress?.phone}</p>
                              <p>{order.shippingAddress?.addressLine1}</p>
                              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
                            </div>
                            <div className="mt-3 bg-white rounded-lg px-4 py-3 border text-sm space-y-1">
                              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.totalPrice)}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice===0?'FREE':formatPrice(order.shippingPrice)}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
                              <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
