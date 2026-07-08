export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const getDiscount = (price, discountPrice) =>
  discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

export const truncate = (str, n) => (str.length > n ? str.slice(0, n) + '...' : str);

export const ORDER_STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home & Kitchen',
  'Sports', 'Beauty', 'Toys', 'Automotive', 'Grocery', 'Other'
];
