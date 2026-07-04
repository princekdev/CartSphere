import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeletons';
import { CATEGORIES } from '../utils/helpers';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const CATEGORY_ICONS = {
  Electronics: '📱', Clothing: '👕', Books: '📚', 'Home & Kitchen': '🏠',
  Sports: '⚽', Beauty: '💄', Toys: '🧸', Automotive: '🚗', Grocery: '🛒', Other: '📦'
};

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, featured: true }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Shop <span className="text-yellow-400">Everything</span> You Need
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Millions of products. Unbeatable prices. Lightning-fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/products')} className="btn-primary text-lg px-8 py-3">
              Shop Now
            </button>
            <button onClick={() => navigate('/register')} className="border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-gray-900 transition-colors">
              Join Free
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiTruck, label: 'Free Delivery', sub: 'On orders above ₹499' },
            { icon: FiShield, label: 'Secure Payment', sub: '100% secure transactions' },
            { icon: FiRefreshCw, label: 'Easy Returns', sub: '7-day return policy' },
            { icon: FiHeadphones, label: '24/7 Support', sub: 'Always here to help' }
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Icon size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border hover:border-yellow-400 hover:shadow-sm transition-all text-center group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat] || '📦'}
              </span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm font-medium">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🛍️</p>
            <p>No products yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
