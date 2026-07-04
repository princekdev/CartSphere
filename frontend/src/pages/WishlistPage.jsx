import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice';
import API from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlist = user?.wishlist || [];

  const handleRemove = async (productId) => {
    try {
      await API.post(`/auth/wishlist/${productId}`);
      dispatch(fetchProfile());
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-600">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <button onClick={() => handleRemove(product._id)} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow text-red-500 hover:bg-red-50">
                <FiHeart size={14} className="fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
