import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatPrice } from '../../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector((s) => s.products);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [page, setPage]             = useState(1);
  const [confirmDelete, setConfirm] = useState(null);
  const [catFilter, setCat]         = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(fetchProducts({
      limit: 15,
      page,
      ...(debouncedSearch && { keyword: debouncedSearch }),
      ...(catFilter && { category: catFilter })
    }));
  }, [dispatch, page, debouncedSearch, catFilter]);

  const handleDelete = async (id) => {
    await dispatch(deleteProduct(id));
    setConfirm(null);
  };

  const CATEGORIES = ['Electronics','Clothing','Books','Home & Kitchen','Sports','Beauty','Toys','Automotive','Grocery','Other'];

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCat(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => dispatch(fetchProducts({ limit: 15, page }))}
          className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 bg-white"
        >
          <FiRefreshCw size={13} />
        </button>
        <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg text-sm transition-colors">
          <FiPlus size={15} /> Add Product
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-3">{pagination?.total || 0} products total</p>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded" /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">
                    No products found.{' '}
                    <Link to="/admin/products/new" className="text-yellow-600 hover:underline">Add one →</Link>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]?.url || 'https://via.placeholder.com/40'}
                          alt={p.title}
                          className="w-10 h-10 object-contain bg-gray-100 rounded flex-shrink-0"
                        />
                        <span className="font-medium line-clamp-2 max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}
                      {p.discountPrice > 0 && (
                        <div className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 font-semibold text-sm ${
                        p.stock === 0       ? 'text-red-500'    :
                        p.stock < 5         ? 'text-orange-500' :
                        'text-green-600'
                      }`}>
                        {p.stock < 5 && p.stock > 0 && <FiAlertTriangle size={12} />}
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-yellow-500">★</span> {p.ratings} <span className="text-gray-400">({p.numReviews})</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.isFeatured
                        ? <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Yes</span>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </Link>
                        <button
                          onClick={() => setConfirm(p)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination?.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-md text-sm font-medium ${page === i + 1 ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiTrash2 className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="font-bold">Delete Product?</h3>
                <p className="text-sm text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-5 line-clamp-2">
              {confirmDelete.title}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 border border-gray-300 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
