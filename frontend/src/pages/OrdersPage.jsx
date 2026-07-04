import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import { OrderSkeleton } from '../components/common/Skeletons';
import { FiPackage } from 'react-icons/fi';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
 
  useEffect(() => { dispatch(fetchUserOrders()); }, [dispatch]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8">{[...Array(4)].map((_, i) => <OrderSkeleton key={i} />)}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-600">No orders yet</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-500">Order #</p>
                  <p className="font-mono font-semibold">{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
                  {order.orderStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image || 'https://via.placeholder.com/40'} alt={item.title} className="w-12 h-12 object-contain bg-gray-100 rounded" />
                ))}
                {order.items.length > 3 && <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">+{order.items.length - 3}</div>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span className="font-bold">{formatPrice(order.grandTotal)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
