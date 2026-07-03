import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, addReview, clearProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { ProductDetailSkeleton } from '../components/common/Skeletons';
import StarRating from '../components/product/StarRating';
import { formatPrice, getDiscount, formatDate, ORDER_STATUS_COLORS } from '../utils/helpers';
import { FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => dispatch(clearProduct());
  }, [dispatch, id]);

  if (loading || !product) return <ProductDetailSkeleton />;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = getDiscount(product.price, product.discountPrice);

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity }));
    navigate('/cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    setReviewLoading(true);
    await dispatch(addReview({ id: product._id, data: { rating, comment } }));
    setRating(0); setComment('');
    setReviewLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center mb-3 overflow-hidden">
            <img
              src={product.images[selectedImage]?.url || 'https://via.placeholder.com/400'}
              alt={product.title}
              className="max-h-full max-w-full object-contain p-4"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-yellow-400' : 'border-gray-200'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-yellow-600 font-medium mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          {product.brand && <p className="text-gray-500 text-sm mb-3">by <span className="font-medium">{product.brand}</span></p>}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.ratings} />
            <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold">{formatPrice(displayPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-gray-400 line-through text-lg">{formatPrice(product.price)}</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-semibold">{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚡ Only ${product.stock} left!` : '✗ Out of Stock'}
          </p>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium">Qty:</span>
              <div className="flex items-center border rounded-md">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg hover:bg-gray-100">-</button>
                <span className="px-4 py-1 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-1 text-lg hover:bg-gray-100">+</button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 btn-secondary">
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-gray-600 border rounded-lg p-3">
            <div className="flex flex-col items-center gap-1"><FiTruck className="text-yellow-500" size={18} /><span>Free Delivery above ₹499</span></div>
            <div className="flex flex-col items-center gap-1"><FiShield className="text-yellow-500" size={18} /><span>Secure Payment</span></div>
            <div className="flex flex-col items-center gap-1"><FiRefreshCw className="text-yellow-500" size={18} /><span>7-Day Returns</span></div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold mb-3">Product Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-6">Customer Reviews ({product.numReviews})</h2>

        {/* Write Review */}
        {user && (
          <form onSubmit={handleReview} className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Your Rating</label>
              <StarRating rating={rating} onRate={setRating} size={24} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="input-field h-24 resize-none mb-3"
              required
            />
            <button type="submit" disabled={reviewLoading} className="btn-primary">
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {product.reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review._id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{review.name}</span>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating rating={review.rating} size={14} />
                <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
