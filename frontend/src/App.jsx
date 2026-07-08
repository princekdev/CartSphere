import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from './redux/slices/authSlice';
import { fetchCart } from './redux/slices/cartSlice';

// Guards
import Navbar       from './components/common/Navbar';
import Footer       from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute   from './components/common/AdminRoute';

// Store pages
import HomePage          from './pages/HomePage';
import ProductsPage      from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import OrderSuccessPage  from './pages/OrderSuccessPage';
import OrdersPage        from './pages/OrdersPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import ProfilePage       from './pages/ProfilePage';
import WishlistPage      from './pages/WishlistPage';
import NotFoundPage      from './pages/NotFoundPage';

// Admin pages (own full-screen layout — no Navbar/Footer)
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';

// Storefront wrapper
function StoreShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const dispatch        = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile());
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* ── Admin panel (full-screen, no store navbar/footer) ── */}
        <Route element={<AdminRoute />}>
          <Route path="/admin"                   element={<AdminDashboard />} />
          <Route path="/admin/products"          element={<AdminProducts />} />
          <Route path="/admin/products/new"      element={<AdminProductForm />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
          <Route path="/admin/orders"            element={<AdminOrders />} />
          <Route path="/admin/users"             element={<AdminUsers />} />
        </Route>

        {/* ── Storefront ── */}
        <Route path="/*" element={
          <StoreShell>
            <Routes>
              <Route path="/"             element={<HomePage />} />
              <Route path="/products"     element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login"        element={<LoginPage />} />
              <Route path="/register"     element={<RegisterPage />} />

              <Route element={<PrivateRoute />}>
                <Route path="/cart"              element={<CartPage />} />
                <Route path="/checkout"          element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/orders"            element={<OrdersPage />} />
                <Route path="/orders/:id"        element={<OrderDetailPage />} />
                <Route path="/profile"           element={<ProfilePage />} />
                <Route path="/wishlist"          element={<WishlistPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </StoreShell>
        } />
      </Routes>
    </Router>
  );
}
