import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AdminLayout title="Dashboard">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-60 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { stats, recentOrders, ordersByStatus, topProducts, monthlyRevenue, lowStockProducts } = data;
  const maxRev = Math.max(...(monthlyRevenue?.map(m => m.revenue) || [1]), 1);

  const statCards = [
    { label: 'Total Users',  value: stats.totalUsers,               icon: FiUsers,       color: 'bg-blue-500',   sub: `+${stats.newUsersThisMonth} this month` },
    { label: 'Products',     value: stats.totalProducts,            icon: FiPackage,     color: 'bg-green-500',  sub: `${lowStockProducts?.length || 0} low stock` },
    { label: 'Total Orders', value: stats.totalOrders,              icon: FiShoppingBag, color: 'bg-purple-500', sub: 'all time' },
    { label: 'Revenue',      value: formatPrice(stats.totalRevenue), icon: FiDollarSign,  color: 'bg-yellow-500', sub: 'paid orders' }
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={19} className="text-white" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-yellow-500" size={18} />
            <h2 className="font-bold">Revenue (last 6 months)</h2>
          </div>
          {monthlyRevenue?.length > 0 ? (
            <div className="flex items-end gap-2 h-36">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400 font-medium">{formatPrice(m.revenue).replace('₹','')}</span>
                  <div
                    className="w-full bg-yellow-400 hover:bg-yellow-500 transition-colors rounded-t-md"
                    style={{ height: `${Math.max(6, (m.revenue / maxRev) * 90)}px` }}
                    title={formatPrice(m.revenue)}
                  />
                  <span className="text-xs text-gray-400">{MONTHS[m._id.month]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h2 className="font-bold mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize w-32 text-center flex-shrink-0 ${ORDER_STATUS_COLORS[_id] || 'bg-gray-100 text-gray-600'}`}>
                  {_id?.replace('_',' ')}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(100,(count/(stats.totalOrders||1))*100)}%` }} />
                </div>
                <span className="text-sm font-semibold w-7 text-right">{count}</span>
              </div>
            ))}
            {!ordersByStatus?.length && <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-yellow-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentOrders?.slice(0,6).map(order => (
              <div key={order._id} className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-mono font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(order.grandTotal)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
            {!recentOrders?.length && <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-orange-500" size={17} />
            <h2 className="font-bold">Low Stock Alerts</h2>
          </div>
          {lowStockProducts?.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">All products well stocked 🎉</div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts?.map(p => (
                <div key={p._id} className="flex items-center justify-between p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-8 h-8 rounded object-contain bg-white flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ml-3 flex-shrink-0 ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/products" className="block text-center text-sm text-yellow-600 hover:underline mt-3 font-medium">
            Manage Products →
          </Link>
        </div>
      </div>

      {/* Top Products */}
      {topProducts?.length > 0 && (
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Top Selling Products</h2>
            <Link to="/admin/products" className="text-sm text-yellow-600 hover:underline font-medium">Manage →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-semibold">#</th>
                  <th className="pb-2 font-semibold">Product</th>
                  <th className="pb-2 font-semibold text-right">Units Sold</th>
                  <th className="pb-2 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="py-2.5 text-gray-400 font-medium">{i+1}</td>
                    <td className="py-2.5 font-medium">{p.title}</td>
                    <td className="py-2.5 text-right">{p.sales}</td>
                    <td className="py-2.5 text-right font-semibold text-green-600">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
