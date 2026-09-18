import React, { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { customerAPI, ordersAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { Flame, Trophy, ShoppingBag, RotateCcw } from 'lucide-react';

const statusColors = {
  DELIVERED: 'bg-[#e7efdf] text-[#2f6b3a]',
  PENDING: 'bg-[#fdf1de] text-[#e8a33d]',
  CANCELLED: 'bg-[#fbe7e3] text-[#c0503f]',
  PREPARING: 'bg-[#e7efdf] text-[#1c4a2b]',
  DISPATCH: 'bg-[#e7efdf] text-[#3f7d40]',
  ACCEPTED: 'bg-[#e7efdf] text-[#2f6b3a]'
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    customerAPI.getAnalytics().then((res) => {
      if (res.success) setAnalytics(res);
    }).catch(() => {});

    ordersAPI.getMyOrders().then((res) => {
      if (res.success) setRecentOrders(res.orders.slice(0, 5));
    }).catch(() => {});
  }, []);

  const goal = analytics?.dailyGoal || user?.dailyProteinGoal || 120;
  const todayIntake = analytics?.todayProtein || 0;
  const progressPercent = Math.min(100, Math.round((todayIntake / goal) * 100));

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Welcome back, {user?.name || 'User'}! 👋</h1>
            <p className="text-sm text-[#5b6259] font-medium mt-1">Here is your daily protein intake and fitness overview.</p>
          </div>
        </div>

        {/* Protein Intake Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today Protein */}
          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3f7d40]">Today's Protein Goal</span>
              <div className="w-8 h-8 rounded-full bg-[#e7efdf] flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#3f7d40]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#1c4a2b]">{todayIntake}g</span>
              <span className="text-xs text-[#5b6259] font-semibold">/ {goal}g Goal</span>
            </div>
            <div className="w-full bg-[#e7efdf] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #3f7d40, #5a9455)' }}
              />
            </div>
            <div className="text-xs text-[#5b6259] font-semibold">{progressPercent}% of target achieved today!</div>
          </div>

          {/* Calories */}
          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e8a33d]">Today's Energy</span>
              <div className="w-8 h-8 rounded-full bg-[#fdf1de] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#e8a33d]" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-[#1c4a2b]">
              {analytics?.todayCalories || 0} <span className="text-xs font-semibold text-[#5b6259]">kcal</span>
            </div>
            <div className="text-xs text-[#5b6259] font-medium">Optimal clean calorie burn ratio.</div>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-6 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2f6b3a]">Active Orders</span>
              <div className="w-8 h-8 rounded-full bg-[#e7efdf] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#3f7d40]" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-[#1c4a2b]">
              {recentOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
            </div>
            <div className="text-xs text-[#5b6259] font-medium">Orders currently in prep or dispatch.</div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-[22px] border border-[#e5e3da] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e3da]">
            <h3 className="font-extrabold text-lg text-[#1c4a2b]">Recent Orders</h3>
            <a href="/customer/orders" className="text-xs font-bold text-[#3f7d40] hover:underline">View all →</a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#5b6259] font-medium">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#e5e3da] mb-3" />
              No orders yet. <a href="/bowl-builder" className="text-[#3f7d40] font-bold hover:underline">Build your first bowl →</a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-[#5b6259] uppercase border-b border-[#e5e3da]">
                    <th className="py-3 pr-4">Order #</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Items</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f6ee]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#faf9f6]">
                      <td className="py-3.5 pr-4 font-extrabold text-xs text-[#1c4a2b]">{ord.orderNumber}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${statusColors[ord.status] || 'bg-[#f2f6ee] text-[#5b6259]'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-[#5b6259] font-medium max-w-[160px] truncate">
                        {ord.items?.map(i => i.name).join(', ') || '—'}
                      </td>
                      <td className="py-3.5 pr-4 font-extrabold text-xs text-[#1c4a2b]">₹{ord.totalAmount}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => { if (ord.items?.[0]) addToCart(ord.items[0]); }}
                          className="px-3 py-1.5 rounded-full bg-[#e7efdf] text-[#3f7d40] hover:bg-[#3f7d40] hover:text-white text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
