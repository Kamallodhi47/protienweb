import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  BarChart3,
  User,
  Package,
  Layers,
  FolderTree,
  UtensilsCrossed,
  Users,
  FileText,
  Settings,
  Shield,
  Dumbbell,
  Mail,
  Bell,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ mode = 'customer' }) {
  const location = useLocation();

  const customerSections = [
    {
      title: 'PORTAL',
      items: [
        { label: 'Overview', path: '/customer', icon: LayoutDashboard },
        { label: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
        { label: 'Subscriptions', path: '/customer/subscriptions', icon: CalendarCheck },
        { label: 'Protein Analytics', path: '/customer/analytics', icon: BarChart3 },
        { label: 'My Profile', path: '/customer/profile', icon: User },
      ]
    }
  ];

  const adminSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'CUSTOM BOWL BUILDERS',
      items: [
        { label: 'Fruit Bowl Categories', path: '/admin/fruit-categories', icon: FolderTree },
        { label: 'Fruit Bowl Ingredients', path: '/admin/ingredients', icon: Layers },
        { label: 'Sprouts Categories', path: '/admin/sprouts-categories', icon: FolderTree },
        { label: 'Sprouts Ingredients', path: '/admin/sprouts-ingredients', icon: UtensilsCrossed },
      ]
    },
    {
      title: 'STORE & ORDERS',
      items: [
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Products Catalog', path: '/admin/products', icon: Dumbbell },
        { label: 'Inventory Stock', path: '/admin/inventory', icon: Package },
        { label: 'Subscriptions', path: '/admin/subscriptions', icon: CalendarCheck },
        { label: 'Customers', path: '/admin/customers', icon: Users },
      ]
    },
    {
      title: 'CMS & MESSAGES',
      items: [
        { label: 'CMS Banners', path: '/admin/cms', icon: FileText },
        { label: 'Contact Messages', path: '/admin/contact', icon: Mail },
        { label: 'Newsletter', path: '/admin/newsletter', icon: Bell },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const sections = mode === 'admin' ? adminSections : customerSections;
  const allFlatLinks = sections.flatMap((sec) => sec.items);

  return (
    <>
      {/* Mobile Horizontal Navigation Bar */}
      <div className="md:hidden bg-white border-b border-[#e5e3da] px-4 py-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {allFlatLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-[#3f7d40] text-white shadow-xs'
                  : 'bg-[#f2f6ee] text-[#5b6259] hover:bg-[#e7efdf]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop Vertical Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block min-h-[calc(100vh-80px)] border-r border-[#e5e3da] bg-white p-4 overflow-y-auto">
        {/* Header Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#f2f6ee] border border-[#e5e3da]/60 text-xs font-black text-[#1c4a2b] uppercase tracking-wider mb-5 shadow-2xs">
          {mode === 'admin' ? <Shield className="w-4 h-4 text-rose-600 shrink-0" /> : <Dumbbell className="w-4 h-4 text-[#3f7d40] shrink-0" />}
          <span className="truncate">{mode === 'admin' ? 'Admin Control Center' : 'Customer Portal'}</span>
        </div>

        {/* Grouped Section Navigation */}
        <nav className="space-y-5">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-black text-[#5b6259] uppercase tracking-wider px-3 mb-1.5">
                {section.title}
              </div>

              {section.items.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-[#3f7d40] text-white shadow-sm'
                        : 'text-[#1c211d] hover:bg-[#f2f6ee] hover:text-[#3f7d40]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#5b6259]'}`} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
