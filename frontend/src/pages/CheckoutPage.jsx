import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, createPaymentOrder, verifyPayment } from '../redux/slices/orderSlice';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const INITIAL_ADDRESS = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };
 
export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { loading } = useSelector((s) => s.orders);
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(1);

  const subtotal = items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || 0;
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const grandTotal = subtotal + shipping + tax;

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    return required.every((f) => address[f].trim());
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) { toast.error('Please fill all required fields'); return; }

    const result = await dispatch(createOrder({ shippingAddress: address, paymentMethod }));
    if (result.meta.requestStatus !== 'fulfilled') return;
    const order = result.payload;

    if (paymentMethod === 'razorpay') {
      const payResult = await dispatch(createPaymentOrder(order._id));
      if (payResult.meta.requestStatus !== 'fulfilled') return;
      const { orderId, amount, currency, key } = payResult.payload;

      const options = {
        key,
        amount,
        currency,
        name: 'ShopEase',
        description: `Order #${order._id.slice(-6).toUpperCase()}`,
        order_id: orderId,
        handler: async (response) => {
          const verifyResult = await dispatch(verifyPayment({ ...response, orderId: order._id }));
          if (verifyResult.meta.requestStatus === 'fulfilled') {
            navigate(`/order-success/${order._id}`);
          }
        },
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#F59E0B' }
      };

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
        script.onload = () => new window.Razorpay(options).open();
      } else {
        new window.Razorpay(options).open();
      }
    } else {
      navigate(`/order-success/${order._id}`);
    }
  };

  if (!items?.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, label: 'Address' }, { n: 2, label: 'Review & Pay' }].map(({ n, label }) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 ${step >= n ? 'text-yellow-600' : 'text-gray-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200'}`}>{n}</span>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {n < 2 && <div className={`flex-1 h-0.5 ${step >= n + 1 ? 'bg-yellow-400' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Full Name *', placeholder: 'John Doe', col: 2 },
                  { name: 'phone', label: 'Phone Number *', placeholder: '10-digit mobile number', col: 1 },
                  { name: 'addressLine1', label: 'Address Line 1 *', placeholder: 'House No, Street', col: 2 },
                  { name: 'addressLine2', label: 'Address Line 2', placeholder: 'Landmark (optional)', col: 2 },
                  { name: 'city', label: 'City *', placeholder: 'City', col: 1 },
                  { name: 'state', label: 'State *', placeholder: 'State', col: 1 },
                  { name: 'pincode', label: 'Pincode *', placeholder: '6-digit pincode', col: 1 }
                ].map(({ name, label, placeholder, col }) => (
                  <div key={name} className={col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input name={name} value={address[name]} onChange={handleAddressChange} placeholder={placeholder} className="input-field" />
                  </div>
                ))}
              </div>
              <button onClick={() => validateAddress() ? setStep(2) : toast.error('Fill all required fields')} className="btn-primary mt-6 px-8">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-lg">Delivery Address</h2>
                  <button onClick={() => setStep(1)} className="text-yellow-600 text-sm hover:underline">Change</button>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>{address.fullName}</strong> · {address.phone}<br />
                  {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}<br />
                  {address.city}, {address.state} – {address.pincode}
                </p>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: '💵 Cash on Delivery', sub: 'Pay when your order arrives' },
                    { value: 'razorpay', label: '💳 Pay Online (Razorpay)', sub: 'UPI, Cards, Net Banking, Wallets' }
                  ].map(({ value, label, sub }) => (
                    <label key={value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === value ? 'border-yellow-400 bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mt-1 accent-yellow-500" />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-gray-500">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Placing Order...' : `Place Order · ${formatPrice(grandTotal)}`}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-72">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex gap-2 text-sm">
                  <img src={item.product?.images?.[0]?.url} alt="" className="w-12 h-12 object-contain bg-gray-100 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-2 text-xs text-gray-700">{item.product?.title}</p>
                    <p className="font-semibold">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tax (18%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
