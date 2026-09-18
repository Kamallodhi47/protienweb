import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { settingsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    deliveryCharge: '30',
    gstPercentage: '5',
    storeOpeningTime: '08:00 AM',
    storeClosingTime: '10:00 PM',
    whatsappSupport: '+91 98765 43210',
    supportEmail: 'support@proteinproject.com'
  });

  const { addToast } = useToast();

  useEffect(() => {
    settingsAPI.get().then((res) => {
      if (res.success && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await settingsAPI.update(settings);
      if (res.success) {
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Save failed.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Global Platform Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure delivery fees, tax rates, store timings, support channels, and payment gateway credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" /> Business Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) => setSettings({ ...settings, deliveryCharge: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.gstPercentage}
                onChange={(e) => setSettings({ ...settings, gstPercentage: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Store Opening Time</label>
              <input
                type="text"
                value={settings.storeOpeningTime}
                onChange={(e) => setSettings({ ...settings, storeOpeningTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Store Closing Time</label>
              <input
                type="text"
                value={settings.storeClosingTime}
                onChange={(e) => setSettings({ ...settings, storeClosingTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                value={settings.whatsappSupport}
                onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
          </div>



          <button type="submit" className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Global Settings
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
