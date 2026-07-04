import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiLogOut, FiHome, FiMenu, FiX, FiShield
} from 'react-icons/fi';

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: FiGrid,        exact: true  },
  { to: '/admin/products', label: 'Products',  icon: FiPackage,     exact: false },
  { to: '/admin/orders',   label: 'Orders',    icon: FiShoppingBag, exact: false },
  { to: '/admin/users',    label: 'Users',     icon: FiUsers,       exact: false }
];

export default function AdminLayout({ children, title }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  const isActive = ({ to, exact }) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FiShield size={17} className="text-yellow-400" />
            <span className="font-bold text-base">ShopEase</span>
          </div>
          <span className="text-xs text-gray-500 mt-0.5 block">Admin Panel</span>
        </div>
        {mobile && (
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Admin info */}
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-gray-900 text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive({ to, exact });
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-yellow-400 text-gray-900'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-0.5 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <FiHome size={16} /> View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-950 transition-all"
        >
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-gray-800">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 flex-shrink-0">
            <SidebarContent mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-5 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="md:hidden text-gray-500 hover:text-gray-800">
              <FiMenu size={22} />
            </button>
            {title && <h1 className="text-base font-bold text-gray-800">{title}</h1>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Admin
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
