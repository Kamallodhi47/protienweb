import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminAPI, ordersAPI, contactAPI, newsletterAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShoppingBag, Users, Mail, Bell, TrendingUp } from 'lucide-react';

const sampleChartData = [
  { name: 'Day 1', sales: 12000 },
  { name: 'Day 5', sales: 18500 },
  { name: 'Day 10', sales: 24000 },
  { name: 'Day 15', sales: 31000 },
  { name: 'Day 20', sales: 28000 },
  { name: 'Day 25', sales: 39000 },
  { name: 'Day 30', sales: 45000 },
];

const statusColors = {
  DELIVERED: 'delivered',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  PREPARING: 'pending',
  DISPATCH: 'delivered',
  ACCEPTED: 'delivered'
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [contactCount, setContactCount] = useState(0);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, ordersRes, contactRes, newsletterRes] = await Promise.allSettled([
          adminAPI.getDashboardStats(),
          ordersAPI.getAllAdmin({ limit: 5 }),
          contactAPI.getAll(),
          newsletterAPI.getAll()
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.success) setStats(statsRes.value.stats || statsRes.value);
        if (ordersRes.status === 'fulfilled' && ordersRes.value.success) setRecentOrders((ordersRes.value.orders || []).slice(0, 5));
        if (contactRes.status === 'fulfilled' && contactRes.value.success) setContactCount(contactRes.value.count || 0);
        if (newsletterRes.status === 'fulfilled' && newsletterRes.value.success) setNewsletterCount(newsletterRes.value.count || 0);
      } catch (e) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3da]">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Dashboard Overview</h1>
            <p className="text-xs text-[#5b6259] mt-1">Protein Project Administrative Control Center</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1c4a2b] shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#e7efdf] flex items-center justify-center text-[#3f7d40] font-extrabold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span>{user?.name || 'Admin'}</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5b6259] uppercase tracking-wide">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#3f7d40]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1c4a2b]">{loading ? '—' : (stats?.totalOrders ?? 0)}</div>
            <span className="text-[11px] font-semibold text-[#3f7d40]">▲ All time orders</span>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5b6259] uppercase tracking-wide">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-[#3f7d40]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1c4a2b]">
              ₹{loading ? '—' : ((stats?.todaySales || 0) >= 1000 ? ((stats?.todaySales / 1000).toFixed(1) + 'K') : (stats?.todaySales || 0))}
            </div>
            <span className="text-[11px] font-semibold text-[#3f7d40]">▲ Total revenue earned</span>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5b6259] uppercase tracking-wide">Registered Users</span>
              <Users className="w-4 h-4 text-[#3f7d40]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1c4a2b]">{loading ? '—' : (stats?.activeUsers ?? 0)}</div>
            <span className="text-[11px] font-semibold text-[#3f7d40]">▲ Platform members</span>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5b6259] uppercase tracking-wide">Newsletter Subs</span>
              <Bell className="w-4 h-4 text-[#3f7d40]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1c4a2b]">{loading ? '—' : newsletterCount}</div>
            <span className="text-[11px] font-semibold text-[#3f7d40]">▲ Email subscribers</span>
          </div>
        </div>

        {/* Quick Links: Contact Submissions & Newsletter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <a href="/admin/contact" className="group bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs flex items-center gap-4 hover:border-[#3f7d40] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#e7efdf] flex items-center justify-center text-[#3f7d40] shrink-0 group-hover:bg-[#3f7d40] group-hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#1c4a2b]">Contact Submissions</div>
              <div className="text-xs text-[#5b6259] font-medium">{contactCount} unread message{contactCount !== 1 ? 's' : ''} from customers</div>
            </div>
          </a>

          <a href="/admin/newsletter" className="group bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs flex items-center gap-4 hover:border-[#3f7d40] transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#e7efdf] flex items-center justify-center text-[#3f7d40] shrink-0 group-hover:bg-[#3f7d40] group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#1c4a2b]">Newsletter Subscribers</div>
              <div className="text-xs text-[#5b6259] font-medium">{newsletterCount} active email subscriber{newsletterCount !== 1 ? 's' : ''}</div>
            </div>
          </a>
        </div>

        {/* Revenue Chart Panel */}
        <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-[#1c4a2b]">Revenue Overview</h3>
            <span className="badge badge-outline">Last 30 days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#5b6259" fontSize={11} />
                <YAxis stroke="#5b6259" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#12331f', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3f7d40" fill="#e7efdf" fillOpacity={0.6} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e3da]">
            <h3 className="font-extrabold text-base text-[#1c4a2b]">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs font-bold text-[#3f7d40] hover:underline">View all →</a>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#5b6259] font-medium">No orders yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-bold text-[#5b6259] uppercase border-b border-[#e5e3da]">
                    <th className="py-3 text-left pr-4">Order #</th>
                    <th className="py-3 text-left pr-4">Customer</th>
                    <th className="py-3 text-left pr-4">Amount</th>
                    <th className="py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f6ee]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#faf9f6]">
                      <td className="py-3.5 pr-4 font-extrabold text-xs text-[#1c4a2b]">{ord.orderNumber}</td>
                      <td className="py-3.5 pr-4 text-xs text-[#5b6259] font-medium">{ord.user?.name || '—'}</td>
                      <td className="py-3.5 pr-4 text-xs font-extrabold text-[#1c4a2b]">₹{ord.totalAmount}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${statusColors[ord.status] || 'pending'}`}>{ord.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
