import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu as MenuIcon,
  X,
  Flame
} from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart, subtotal, totalProtein, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isCurrent = (path) => location.pathname === path;

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Subscription', path: '/subscription' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e5e3da] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#2f6a35] flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight text-[#2f6a35]">
                Protein
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#1c211d]">
                PROJECT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#1c211d]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors hover:text-[#2f6a35] ${
                  isCurrent(item.path) ? 'text-[#2f6a35] font-bold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Voice Assistant Widget */}
            <div className="hidden sm:block">
              <VoiceAssistant />
            </div>

            {/* User Account / Dashboard trigger */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors"
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                ) : (
                  <Link
                    to="/customer"
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#e7efdf] border border-[#3f7d40]/30 text-[#2f6b3a] font-bold text-xs hover:bg-[#d8e7cb] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-[#3f7d40] hover:bg-[#1c4a2b] text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Login / Register
              </Link>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#1c211d] hover:text-[#3f7d40] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-1 -right-1.5 w-5 h-5 rounded-full bg-[#3f7d40] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                {totalItemsCount}
              </span>
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1c211d] hover:text-[#3f7d40] transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#e5e3da] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-2 font-semibold text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg transition-colors ${
                    isCurrent(item.path)
                      ? 'bg-[#e7efdf] text-[#2f6b3a] font-bold'
                      : 'text-[#1c211d] hover:bg-[#f2f6ee]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {!user && (
              <div className="pt-2 border-t border-[#e5e3da]">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#3f7d40] hover:bg-[#1c4a2b] text-white font-bold text-sm text-center block shadow-xs"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-[#e5e3da]">
            <div>
              <div className="p-6 border-b border-[#e5e3da] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-[#3f7d40]" />
                  <h2 className="text-xl font-extrabold text-[#1c4a2b]">Your Nutrition Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full text-[#5b6259] hover:text-[#1c211d]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto text-[#e5e3da] mb-4" />
                    <p className="text-[#5b6259] font-medium text-sm">Your cart is currently empty.</p>
                    <Link
                      to="/bowl-builder"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-block mt-4 text-xs font-bold text-[#3f7d40] hover:underline"
                    >
                      Build Your Bowl Now &rarr;
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-[14px] bg-[#f2f6ee] border border-[#e5e3da]"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-[#1c211d]">{item.name}</h4>
                        <div className="text-xs text-[#3f7d40] font-semibold mt-1">
                          {item.protein}g Protein | {item.calories} kcal
                        </div>
                        <div className="text-sm font-extrabold text-[#1c4a2b] mt-1">₹{item.price}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#e5e3da] bg-[#f2f6ee] space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#5b6259]">
                    <span>Total Protein</span>
                    <span className="font-bold text-[#3f7d40]">{totalProtein.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#1c4a2b]">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate(user ? '/checkout' : '/login?redirect=/checkout');
                  }}
                  className="btn btn-primary w-full justify-center"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
