import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { sproutsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function AdminSproutsCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append('image', file);

    setIsUploading(true);
    try {
      const response = await fetch(`/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataFile
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
        addToast('Image uploaded and converted to WebP!', 'success');
      } else {
        addToast(data.message || 'Image upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      addToast('Error uploading image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true
  });

  const { addToast } = useToast();

  const fetchCategories = () => {
    sproutsAPI.getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await sproutsAPI.updateCategory(editingItem.id, formData);
        if (res.success) addToast(res.message, 'success');
      } else {
        const res = await sproutsAPI.createCategory(formData);
        if (res.success) addToast(res.message, 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All ingredients under this category will lose their link.')) return;
    try {
      const res = await sproutsAPI.deleteCategory(id);
      if (res.success) {
        addToast(res.message, 'info');
        fetchCategories();
      }
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const res = await sproutsAPI.updateCategory(item.id, { isActive: !item.isActive });
      if (res.success) {
        addToast(`Category status updated to ${!item.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchCategories();
      }
    } catch (err) {
      addToast(err.message || 'Update status failed.', 'error');
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      displayOrder: item.displayOrder,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Sprouts Categories</h1>
            <p className="text-sm text-[#5b6259]">Manage steps and categories for the custom Sprouts &amp; Protein bowl customizer.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#e5e3da] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e3da] text-xs font-bold text-[#5b6259] uppercase">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Display Order</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e3da]/60">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#5b6259]">
                      No categories found. Click Add Category to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#f2f6ee]/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#1c4a2b] flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-10 h-10 object-cover rounded-xl shrink-0 bg-[#f2f6ee]"
                        />
                        <div>
                          <div>{cat.name}</div>
                          {cat.description && <div className="text-xs font-normal text-[#5b6259]">{cat.description}</div>}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1c211d]">{cat.displayOrder}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-[#5b6259]">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            cat.isActive
                              ? 'bg-[#e7efdf] text-[#2f6b3a]'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {cat.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button onClick={() => openEdit(cat)} className="p-2 text-[#5b6259] hover:text-[#3f7d40] transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-[#5b6259] hover:text-rose-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              placeholder="e.g. Step 1: Sprouts"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              rows="3"
              placeholder="e.g. Choose organic fiber rich sprouts"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Display Order</label>
              <input
                type="number"
                required
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Active Status</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Upload Image (Optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-2 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm focus:outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#3f7d40] file:text-white hover:file:bg-[#2f6b3a]"
              />
              {isUploading && <span className="text-xs font-bold text-amber-600 self-center">Uploading & Converting...</span>}
            </div>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              placeholder="Or paste URL (https://...)"
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded mt-2 border" />
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#e5e3da]">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
              className="px-5 py-2.5 rounded-xl border border-[#e5e3da] font-bold text-sm text-[#5b6259] hover:bg-[#f2f6ee] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#3f7d40] hover:bg-[#2f6b3a] text-white font-bold text-sm transition-colors disabled:bg-slate-400"
            >
              {editingItem ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
