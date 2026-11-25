import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  MessageSquare,
  Package,
  Trash2,
  ChefHat,
  LogOut,
  SlidersHorizontal,
  Store,
  Menu as MenuIcon,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItemCount } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCanteen = user?.role === 'canteen_staff';

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const roleBadge = () => {
    if (user?.role === 'canteen_staff') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] px-2 py-0.5 rounded-md font-medium">
          Canteen Operations
        </span>
      );
    }
    if (user?.role === 'college_staff') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11px] px-2 py-0.5 rounded-md font-medium">
          Faculty Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded-md font-medium">
        Student
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
              <img
                src="/logo.jpg"
                alt="Campus Bites Logo"
                className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white"
              />
              <span className="text-sm font-semibold text-slate-900 tracking-tight">
                Campus Bites
              </span>
            </NavLink>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:block">{roleBadge()}</div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isCanteen ? (
              <>
                <NavLink to="/student/dashboard" className={linkClass}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </NavLink>
                <NavLink to="/student/menu" className={linkClass}>
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Menu
                </NavLink>
                <NavLink to="/student/cart" className={linkClass}>
                  <div className="relative flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Cart</span>
                    {totalItemCount > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {totalItemCount}
                      </span>
                    )}
                  </div>
                </NavLink>
                <NavLink to="/student/orders" className={linkClass}>
                  <Receipt className="w-3.5 h-3.5" />
                  My Orders
                </NavLink>
                <NavLink to="/student/feedback" className={linkClass}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Feedback
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/canteen/dashboard" className={linkClass}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Overview
                </NavLink>
                <NavLink to="/canteen/kitchen" className={linkClass}>
                  <ChefHat className="w-3.5 h-3.5" />
                  Kitchen Queue
                </NavLink>
                <NavLink to="/canteen/menu-management" className={linkClass}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Menu Setup
                </NavLink>
                <NavLink to="/canteen/inventory" className={linkClass}>
                  <Package className="w-3.5 h-3.5" />
                  Inventory
                </NavLink>
                <NavLink to="/canteen/waste" className={linkClass}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Waste Tracking
                </NavLink>
                <NavLink to="/canteen/reviews" className={linkClass}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reviews
                </NavLink>
              </>
            )}
          </nav>

          {/* Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {user?.campusId || user?.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-md transition-colors border border-slate-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1.5 shadow-sm">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.campusId || user?.email}</div>
            </div>
            {roleBadge()}
          </div>

          <div className="pt-1 space-y-1">
            {!isCanteen ? (
              <>
                <NavLink
                  to="/student/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </span>
                </NavLink>
                <NavLink
                  to="/student/menu"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <UtensilsCrossed className="w-3.5 h-3.5" /> Menu Catalog
                  </span>
                </NavLink>
                <NavLink
                  to="/student/cart"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5" /> Pre-Order Cart
                  </span>
                  {totalItemCount > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {totalItemCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/student/orders"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> My Orders
                  </span>
                </NavLink>
                <NavLink
                  to="/student/feedback"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Post Feedback
                  </span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/canteen/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Operations Overview
                  </span>
                </NavLink>
                <NavLink
                  to="/canteen/kitchen"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <ChefHat className="w-3.5 h-3.5" /> Kitchen Queue
                  </span>
                </NavLink>
                <NavLink
                  to="/canteen/menu-management"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Menu Setup
                  </span>
                </NavLink>
                <NavLink
                  to="/canteen/inventory"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Stock & Inventory
                  </span>
                </NavLink>
                <NavLink
                  to="/canteen/waste"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Waste Accounting
                  </span>
                </NavLink>
                <NavLink
                  to="/canteen/reviews"
                  onClick={() => setMobileNavOpen(false)}
                  className={mobileLinkClass}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Customer Reviews
                  </span>
                </NavLink>
              </>
            )}

            <button
              onClick={() => {
                setMobileNavOpen(false);
                handleLogout();
              }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 py-2 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
