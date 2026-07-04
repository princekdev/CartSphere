// OrderSuccessPage.jsx
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../redux/slices/orderSlice';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-6">Thank you for your order. We'll notify you when it ships.</p>
      {order && (
        <div className="card p-6 text-left mb-6">
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-lg">{formatPrice(order.grandTotal)}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="capitalize font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Placed on</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary px-6">View Order</Link>
        <Link to="/products" className="btn-secondary px-6">Continue Shopping</Link>
      </div>
    </div>
  );
}
