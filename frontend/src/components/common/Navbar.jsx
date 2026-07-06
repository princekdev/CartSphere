import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLogOut, FiShield } from 'react-icons/fi';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenu] = useState(false);
  const [ddOpen, setDd]     = useState(false);

  const cartCount = items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?keyword=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-yellow-400 font-bold text-xl whitespace-nowrap flex-shrink-0">🛒 ShopEase</Link>

        <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="flex-1 px-4 py-2 text-gray-900 rounded-l-lg text-sm focus:outline-none"/>
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-4 rounded-r-lg text-gray-900 transition-colors">
            <FiSearch size={17}/>
          </button>
        </form>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setDd(!ddOpen)} className="flex items-center gap-1.5 hover:text-yellow-400 text-sm transition-colors">
                <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xs">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
              </button>
              {ddOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl py-1.5 border z-50">
                  <div className="px-4 py-2 border-b mb-1">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full mt-1 font-medium">
                        <FiShield size={9}/> Admin
                      </span>
                    )}
                  </div>
                  {user.isAdmin ? (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 text-sm text-yellow-700 font-semibold" onClick={() => setDd(false)}>
                      <FiShield size={13}/> Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDd(false)}>Profile</Link>
                      <Link to="/orders"  className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDd(false)}>My Orders</Link>
                    </>
                  )}
                  <hr className="my-1"/>
                  <button onClick={() => { dispatch(logout()); setDd(false); navigate('/'); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2">
                    <FiLogOut size={13}/> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-yellow-400 text-sm flex items-center gap-1 transition-colors"><FiUser size={16}/> Login</Link>
          )}
          {!user?.isAdmin && (
            <>
              <Link to="/wishlist" className="hover:text-yellow-400 transition-colors"><FiHeart size={19}/></Link>
              <Link to="/cart" className="relative hover:text-yellow-400 transition-colors">
                <FiShoppingCart size={21}/>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden ml-auto" onClick={() => setMenu(!menuOpen)}>
          {menuOpen ? <FiX size={22}/> : <FiMenu size={22}/>}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-4 pt-2 space-y-2 border-t border-gray-700">
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  {user.isAdmin && <span className="text-xs text-yellow-400">Admin</span>}
                </div>
              </div>
              {user.isAdmin ? (
                <Link to="/admin" className="flex items-center gap-2 py-2 text-yellow-400 font-semibold text-sm" onClick={() => setMenu(false)}>
                  <FiShield size={14}/> Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/profile"  className="block py-2 text-sm hover:text-yellow-400" onClick={() => setMenu(false)}>Profile</Link>
                  <Link to="/orders"   className="block py-2 text-sm hover:text-yellow-400" onClick={() => setMenu(false)}>My Orders</Link>
                  <Link to="/wishlist" className="block py-2 text-sm hover:text-yellow-400" onClick={() => setMenu(false)}>Wishlist</Link>
                  <Link to="/cart"     className="block py-2 text-sm hover:text-yellow-400" onClick={() => setMenu(false)}>Cart ({cartCount})</Link>
                </>
              )}
              <button onClick={() => { dispatch(logout()); setMenu(false); navigate('/'); }} className="block py-2 text-sm text-red-400 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block py-2 text-sm" onClick={() => setMenu(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-sm" onClick={() => setMenu(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
