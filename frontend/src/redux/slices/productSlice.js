import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await API.get(`/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/products/${id}`);
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addReview = createAsyncThunk('products/review', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await API.post(`/products/${id}/reviews`, data);
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], product: null, pagination: {}, loading: false, error: null },
  reducers: { clearProduct: (state) => { state.product = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.products = a.payload.products; s.pagination = a.payload.pagination; })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProduct.pending, (s) => { s.loading = true; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createProduct.fulfilled, (s, a) => { s.products.unshift(a.payload); toast.success('Product created!'); })
      .addCase(createProduct.rejected, (_, a) => toast.error(a.payload || 'Failed'))
      .addCase(updateProduct.fulfilled, (s, a) => {
        const idx = s.products.findIndex(p => p._id === a.payload._id);
        if (idx > -1) s.products[idx] = a.payload;
        s.product = a.payload;
        toast.success('Product updated!');
      })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.products = s.products.filter(p => p._id !== a.payload); toast.success('Product deleted'); })
      .addCase(addReview.fulfilled, (s, a) => { s.product = a.payload; toast.success('Review submitted!'); })
      .addCase(addReview.rejected, (_, a) => toast.error(a.payload || 'Review failed'));
  }
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
