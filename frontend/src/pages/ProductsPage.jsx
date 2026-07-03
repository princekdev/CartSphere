import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeletons';
import { CATEGORIES } from '../utils/helpers';
import { FiFilter, FiX } from 'react-icons/fi';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination } = useSelector((s) => s.products);
  const [showFilter, setShowFilter] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;

  const loadProducts = useCallback(() => {
    const params = { page, limit: 12 };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    dispatch(fetchProducts(params));
  }, [dispatch, keyword, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Category</h3>
        <div className="space-y-1">
          <button onClick={() => updateParam('category', '')} className={`block w-full text-left px-2 py-1 rounded text-sm ${!category ? 'bg-yellow-100 text-yellow-800 font-medium' : 'hover:bg-gray-100'}`}>All Categories</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => updateParam('category', c)} className={`block w-full text-left px-2 py-1 rounded text-sm ${category === c ? 'bg-yellow-100 text-yellow-800 font-medium' : 'hover:bg-gray-100'}`}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className="input-field text-sm" />
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className="input-field text-sm" />
        </div>
      </div>
      <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear All Filters</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">
            {keyword ? `Results for "${keyword}"` : category || 'All Products'}
          </h1>
          {pagination.total !== undefined && (
            <p className="text-sm text-gray-500">{pagination.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input-field text-sm w-auto">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={() => setShowFilter(!showFilter)} className="md:hidden flex items-center gap-1 px-3 py-2 border rounded-md text-sm">
            <FiFilter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setShowFilter(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">Filters</h3>
                <button onClick={() => setShowFilter(false)}><FiX /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? [...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="mt-4 btn-primary">Clear Filters</button>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', i + 1); setSearchParams(n); }}
                  className={`w-9 h-9 rounded-md text-sm font-medium ${page === i + 1 ? 'bg-yellow-400 text-gray-900' : 'bg-white border hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
