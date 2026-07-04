import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders', data);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchUserOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await API.get(`/orders?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/orders/${id}`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await API.put(`/orders/${id}/cancel`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createPaymentOrder = createAsyncThunk('orders/payment', async (orderId, { rejectWithValue }) => {
  try {
    const res = await API.post('/payment/create-order', { orderId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const verifyPayment = createAsyncThunk('orders/verifyPayment', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/payment/verify', data);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, loading: false, error: null, pagination: {} },
  reducers: { clearOrder: (state) => { state.order = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; toast.success('Order placed!'); })
      .addCase(createOrder.rejected, (s, a) => { s.loading = false; toast.error(a.payload || 'Order failed'); })
      .addCase(fetchUserOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchUserOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.orders; s.pagination = a.payload; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.order = a.payload; })
      .addCase(cancelOrder.fulfilled, (s, a) => {
        s.order = a.payload;
        const idx = s.orders.findIndex(o => o._id === a.payload._id);
        if (idx > -1) s.orders[idx] = a.payload;
        toast.success('Order cancelled');
      })
      .addCase(verifyPayment.fulfilled, (s, a) => { s.order = a.payload; toast.success('Payment successful!'); });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
