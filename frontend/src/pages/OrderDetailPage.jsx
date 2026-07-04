import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../redux/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import { FiCheckCircle, FiTruck, FiPackage, FiXCircle } from 'react-icons/fi';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);

  if (loading || !order) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="skeleton h-96 rounded" /></div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Order Details</h1>
          <p className="text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
          {order.orderStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i <= currentStep ? <FiCheckCircle size={16} /> : i + 1}
                  </div>
                  <span className="text-xs text-center hidden sm:block capitalize">{step.replace('_', ' ')}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold mb-3">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <img src={item.image || 'https://via.placeholder.com/60'} alt={item.title} className="w-14 h-14 object-contain bg-gray-100 rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{item.title}</p>
                <p className="text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Shipping Address */}
        <div className="card p-5">
          <h2 className="font-bold mb-2 flex items-center gap-2"><FiTruck /> Delivery Address</h2>
          <p className="text-sm text-gray-700">
            <strong>{order.shippingAddress.fullName}</strong><br />
            {order.shippingAddress.phone}<br />
            {order.shippingAddress.addressLine1}<br />
            {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="card p-5">
          <h2 className="font-bold mb-2">Payment Info</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize font-medium">{order.paymentStatus}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-1 mt-1"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {!['shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.orderStatus) && (
        <button onClick={() => dispatch(cancelOrder(order._id))} className="w-full py-2 border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
          <FiXCircle /> Cancel Order
        </button>
      )}
    </div>
  );
}
