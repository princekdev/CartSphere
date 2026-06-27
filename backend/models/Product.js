const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Grocery', 'Other']
    },
    brand: { type: String, default: '' },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [String]
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

// Update ratings on review
productSchema.methods.updateRatings = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
