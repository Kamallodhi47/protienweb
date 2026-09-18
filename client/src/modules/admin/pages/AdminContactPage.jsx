import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { contactAPI } from '../../../services/api';
import { Mail, Trash2, Phone, User, RefreshCw } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function AdminContactPage() {
  const { addToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    contactAPI.getAll()
      .then((res) => {
        if (res.success) setContacts(res.contacts || []);
      })
      .catch(() => addToast('Failed to load contact submissions.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact submission?')) return;
    try {
      await contactAPI.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      addToast('Contact submission deleted.', 'success');
    } catch {
      addToast('Failed to delete submission.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3da]">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Contact Submissions</h1>
            <p className="text-xs text-[#5b6259] mt-1">Messages sent by visitors via the Contact page</p>
          </div>
          <button onClick={fetchContacts} className="btn btn-outline btn-sm flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e7efdf] flex items-center justify-center text-[#3f7d40] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-[#1c4a2b]">{contacts.length} Total Submission{contacts.length !== 1 ? 's' : ''}</div>
            <div className="text-xs text-[#5b6259] font-medium">All contact form entries from customers</div>
          </div>
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div className="py-16 text-center text-sm text-[#5b6259] font-medium">Loading submissions...</div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-[22px] border border-[#e5e3da] py-16 text-center space-y-3">
            <Mail className="w-12 h-12 mx-auto text-[#e5e3da]" />
            <p className="text-sm text-[#5b6259] font-medium">No contact submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((c) => (
              <div key={c.id} className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-extrabold text-sm">
                      {c.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {c.name}
                        </span>
                        <span className="text-xs text-[#5b6259] flex items-center gap-1 font-medium">
                          <Mail className="w-3 h-3" /> {c.email}
                        </span>
                        {c.phone && (
                          <span className="text-xs text-[#5b6259] flex items-center gap-1 font-medium">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#1c211d] leading-relaxed font-medium">{c.message}</p>
                      <p className="text-[11px] text-[#5b6259]">{new Date(c.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete"
                    className="shrink-0 w-8 h-8 rounded-full bg-[#fbe7e3] text-[#c0503f] flex items-center justify-center hover:bg-[#c0503f] hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
