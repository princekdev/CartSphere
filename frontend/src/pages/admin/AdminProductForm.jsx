import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, createProduct, updateProduct, clearProduct } from '../../redux/slices/productSlice';
import AdminLayout from '../../components/admin/AdminLayout';
import { CATEGORIES } from '../../utils/helpers';
import { FiUpload, FiX, FiArrowLeft, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', price: '', discountPrice: '',
  category: 'Electronics', brand: '', stock: '', isFeatured: false, tags: ''
};

export default function AdminProductForm() {
  const { id }    = useParams();
  const isEdit    = Boolean(id);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { product, loading } = useSelector((s) => s.products);

  const [form, setForm]         = useState(EMPTY);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);   // { url, existing, public_id? }
  const [submitting, setSub]    = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    if (isEdit) dispatch(fetchProduct(id));
    return () => dispatch(clearProduct());
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        title:        product.title        || '',
        description:  product.description  || '',
        price:        product.price        || '',
        discountPrice:product.discountPrice || '',
        category:     product.category     || 'Electronics',
        brand:        product.brand        || '',
        stock:        product.stock        || '',
        isFeatured:   product.isFeatured   || false,
        tags:         product.tags?.join(', ') || ''
      });
      setPreviews(product.images?.map(img => ({ url: img.url, existing: true, public_id: img.public_id })) || []);
    }
  }, [isEdit, product]);

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title = 'Title is required';
    if (!form.price || form.price <= 0) e.price = 'Valid price is required';
    if (form.stock === '' || form.stock < 0) e.stock = 'Valid stock quantity is required';
    if (!isEdit && newFiles.length === 0 && previews.length === 0) e.images = 'At least one image is required';
    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) {
      e.discountPrice = 'Discount price must be less than original price';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const total = previews.length + files.length;
    if (total > 5) { toast.error('Maximum 5 images allowed'); return; }
    setNewFiles(prev => [...prev, ...files]);
    const newPrevs = files.map(f => ({ url: URL.createObjectURL(f), existing: false }));
    setPreviews(prev => [...prev, ...newPrevs]);
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const removePreview = (idx) => {
    const p = previews[idx];
    if (!p.existing) {
      const fileIdx = previews.slice(0, idx).filter(x => !x.existing).length;
      setNewFiles(prev => prev.filter((_, i) => i !== fileIdx));
    }
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSub(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    newFiles.forEach(f => fd.append('images', f));

    const result = isEdit
      ? await dispatch(updateProduct({ id, formData: fd }))
      : await dispatch(createProduct(fd));

    setSub(false);
    if (result.meta.requestStatus === 'fulfilled') navigate('/admin/products');
  };

  if (isEdit && loading && !product) {
    return (
      <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-40 bg-gray-200 rounded-xl" />
            </div>
            <div className="space-y-3">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const discountPct = form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price)
    ? Math.round(((form.price - form.discountPrice) / form.price) * 100)
    : 0;

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500">{isEdit ? 'Update product details and images' : 'Fill in the details to list a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: details + images ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="font-bold mb-4 text-gray-800">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="e.g. Apple iPhone 15 Pro 256GB"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    placeholder="Detailed product description…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input name="brand" value={form.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Apple" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input name="tags" value={form.tags} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="5g, flagship, ios" />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Images</h2>
                <span className="text-xs text-gray-400">{previews.length}/5 uploaded</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 group">
                    <img src={p.url} alt="" className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removePreview(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <FiX size={10} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-yellow-400 text-gray-900 px-1.5 rounded font-semibold flex items-center gap-0.5">
                        <FiStar size={8} /> Main
                      </span>
                    )}
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all group">
                    <FiUpload size={20} className="text-gray-400 group-hover:text-yellow-500 mb-1 transition-colors" />
                    <span className="text-xs text-gray-400">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                  </label>
                )}
              </div>
              {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}
              <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB each · First image is the main display image</p>
            </div>
          </div>

          {/* ── Right column: pricing, org, submit ── */}
          <div className="space-y-5">
            {/* Pricing */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="0"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sale Price (₹) <span className="text-gray-400 font-normal">— optional</span>
                  </label>
                  <input
                    type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min="0" step="0.01"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.discountPrice ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="0"
                  />
                  {errors.discountPrice && <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>}
                  {discountPct > 0 && (
                    <p className="text-green-600 text-xs mt-1 font-medium">✓ {discountPct}% discount applied</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number" name="stock" value={form.stock} onChange={handleChange} min="0"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors.stock ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Organisation */}
            <div className="bg-white rounded-xl border p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Organisation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Feature on Home Page</p>
                    <p className="text-xs text-gray-500 mt-0.5">Show in the "Featured Products" section</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : (isEdit ? '✓ Save Changes' : '+ Create Product')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
