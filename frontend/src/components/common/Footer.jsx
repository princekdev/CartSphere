// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">🛒 ShopEase</h3>
          <p className="text-sm">Your one-stop shop for everything you need, delivered fast.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
            <li><Link to="/products" className="hover:text-yellow-400">Products</Link></li>
            <li><Link to="/cart" className="hover:text-yellow-400">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-yellow-400">Profile</Link></li>
            <li><Link to="/orders" className="hover:text-yellow-400">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-yellow-400">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {['Electronics', 'Clothing', 'Books', 'Sports'].map(c => (
              <li key={c}><Link to={`/products?category=${c}`} className="hover:text-yellow-400">{c}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-center text-sm mt-8 pt-6 border-t border-gray-700">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </div>
    </footer>
  );
}
