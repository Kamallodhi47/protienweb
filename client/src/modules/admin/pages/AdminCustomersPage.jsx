import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminAPI } from '../../../services/api';
import { Users, Mail, Phone, ShoppingBag, IndianRupee } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    adminAPI.getCustomers().then((res) => {
      if (res.success) setCustomers(res.customers);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Customer Roster Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View registered customers, total lifetime spend, order history counts, and active diet plan subscriptions.</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-4 font-bold dark:text-white">{c.name}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">{c.email}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">{c.phone || 'N/A'}</td>
                    <td className="py-4 px-4 font-bold">{c.orderCount}</td>
                    <td className="py-4 px-4 font-black text-emerald-500">₹{c.totalSpent}</td>
                    <td className="py-4 px-4 text-xs font-bold text-teal-500">{c.subscriptionStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
