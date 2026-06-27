const express = require('express');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, deleteProductImage
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Public reads
router.get('/',   getProducts);
router.get('/:id', getProduct);

// Admin writes (email must match ADMIN_EMAIL)
router.post('/',                        protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id',                      protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id',                   protect, adminOnly, deleteProduct);
router.delete('/:id/image/:public_id',  protect, adminOnly, deleteProductImage);

// User action
router.post('/:id/reviews', protect, addReview);

module.exports = router;
