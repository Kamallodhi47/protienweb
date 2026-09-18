import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { cmsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { FileText, Save } from 'lucide-react';

export default function AdminCMSPage() {
  const [cms, setCms] = useState({});
  const [selectedKey, setSelectedKey] = useState('hero_banner');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { addToast } = useToast();

  const loadCMS = () => {
    cmsAPI.getAll().then((res) => {
      if (res.success) {
        setCms(res.cms);
        if (res.cms[selectedKey]) {
          setTitle(res.cms[selectedKey].title || selectedKey);
          setContent(typeof res.cms[selectedKey] === 'object' ? JSON.stringify(res.cms[selectedKey], null, 2) : res.cms[selectedKey]);
        }
      }
    });
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const handleKeySelect = (key) => {
    setSelectedKey(key);
    const val = cms[key];
    if (typeof val === 'object') {
      setTitle(val.title || key);
      setContent(val.content || JSON.stringify(val, null, 2));
    } else {
      setTitle(key);
      setContent(String(val || ''));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await cmsAPI.updateKey(selectedKey, { title, content });
      if (res.success) {
        addToast(res.message, 'success');
        loadCMS();
      }
    } catch (err) {
      addToast(err.message || 'Save failed.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Content Management System (CMS)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Edit homepage banners, about text, FAQs, terms, privacy, and testimonials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Keys List */}
          <div className="space-y-2">
            {['hero_banner', 'about_us', 'faq', 'terms', 'privacy'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeySelect(key)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
                  selectedKey === key
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {key.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="md:col-span-3">
            <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-xl dark:text-white uppercase">Editing: {selectedKey}</h3>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Content / JSON</label>
                <textarea
                  rows="10"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold font-mono"
                />
              </div>

              <button type="submit" className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save CMS Content
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
