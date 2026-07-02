import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const stored = {
  user:  JSON.parse(localStorage.getItem('user')  || 'null'),
  token: localStorage.getItem('token') || null
};

/* ── thunks ─────────────────────────────────────────────────── */
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return (await API.post('/auth/register', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return (await API.post('/auth/login', data)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try { return (await API.get('/auth/profile')).data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

/* ── slice ──────────────────────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: stored.user, token: stored.token, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    const pending  = (s)    => { s.loading = true; s.error = null; };
    const success  = (s, a) => {
      s.loading = false;
      s.user    = a.payload.user;
      s.token   = a.payload.token;
      localStorage.setItem('user',  JSON.stringify(a.payload.user));
      localStorage.setItem('token', a.payload.token);
    };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; toast.error(a.payload || 'Error'); };

    builder
      .addCase(registerUser.pending,  pending)
      .addCase(registerUser.fulfilled, (s, a) => { success(s, a); toast.success(a.payload.message || 'Account created!'); })
      .addCase(registerUser.rejected,  rejected)
      .addCase(loginUser.pending,     pending)
      .addCase(loginUser.fulfilled,    (s, a) => { success(s, a); toast.success(a.payload.message || 'Welcome back!'); })
      .addCase(loginUser.rejected,     rejected)
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload;
        localStorage.setItem('user', JSON.stringify(a.payload));
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
