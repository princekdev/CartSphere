import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItem, removeFromCart } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
 
  const subtotal = items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || 0;
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <FiShoppingBag /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                <img
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                  alt={item.product?.title}
                  className="w-20 h-20 object-contain bg-gray-100 rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-medium text-gray-800 hover:text-yellow-600 line-clamp-2 text-sm">
                  {item.product?.title}
                </Link>
                <p className="text-lg font-bold mt-1">{formatPrice(item.price)}</p>
                {item.product?.stock < 5 && item.product?.stock > 0 && (
                  <p className="text-xs text-orange-500">Only {item.product.stock} left!</p>
                )}
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 />
                </button>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => item.quantity > 1
                      ? dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))
                      : dispatch(removeFromCart(item._id))}
                    className="px-2 py-1 hover:bg-gray-100 text-lg leading-none"
                  >-</button>
                  <span className="px-3 py-1 font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                    disabled={item.quantity >= (item.product?.stock || 0)}
                    className="px-2 py-1 hover:bg-gray-100 text-lg leading-none disabled:opacity-40"
                  >+</button>
                </div>
                <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Add {formatPrice(499 - subtotal)} more for free shipping!
                </p>
              )}
            </div>
            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link to="/products" className="block text-center text-sm text-yellow-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
