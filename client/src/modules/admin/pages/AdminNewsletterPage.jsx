import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { newsletterAPI } from '../../../services/api';
import { Bell, Trash2, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function AdminNewsletterPage() {
  const { addToast } = useToast();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = () => {
    setLoading(true);
    newsletterAPI.getAll()
      .then((res) => {
        if (res.success) setSubscribers(res.subscribers || []);
      })
      .catch(() => addToast('Failed to load newsletter subscribers.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await newsletterAPI.delete(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      addToast('Subscriber removed.', 'success');
    } catch {
      addToast('Failed to remove subscriber.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3da]">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Newsletter Subscribers</h1>
            <p className="text-xs text-[#5b6259] mt-1">Email addresses subscribed via the homepage newsletter section</p>
          </div>
          <button onClick={fetchSubscribers} className="btn btn-outline btn-sm flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e7efdf] flex items-center justify-center text-[#3f7d40] shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-[#1c4a2b]">{subscribers.length} Active Subscriber{subscribers.length !== 1 ? 's' : ''}</div>
            <div className="text-xs text-[#5b6259] font-medium">People who opted in to receive updates &amp; offers</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-sm text-[#5b6259] font-medium">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="bg-white rounded-[22px] border border-[#e5e3da] py-16 text-center space-y-3">
            <Bell className="w-12 h-12 mx-auto text-[#e5e3da]" />
            <p className="text-sm text-[#5b6259] font-medium">No subscribers yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[22px] border border-[#e5e3da] shadow-xs overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-[#e5e3da] bg-[#f2f6ee]">
                <tr className="text-xs font-bold text-[#5b6259] uppercase">
                  <th className="py-3 px-6 text-left">#</th>
                  <th className="py-3 px-6 text-left">Email Address</th>
                  <th className="py-3 px-6 text-left">Subscribed On</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f6ee]">
                {subscribers.map((s, index) => (
                  <tr key={s.id} className="hover:bg-[#faf9f6]">
                    <td className="py-3.5 px-6 text-xs font-bold text-[#5b6259]">{index + 1}</td>
                    <td className="py-3.5 px-6">
                      <span className="flex items-center gap-2 text-xs font-bold text-[#1c4a2b]">
                        <Mail className="w-3.5 h-3.5 text-[#3f7d40]" /> {s.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#5b6259] font-medium">
                      {new Date(s.subscribedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Remove"
                        className="w-7 h-7 rounded-full bg-[#fbe7e3] text-[#c0503f] flex items-center justify-center hover:bg-[#c0503f] hover:text-white transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
