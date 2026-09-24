import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { productsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: 199,
    protein: 30,
    calories: 350,
    carbs: 25,
    fat: 8,
    category: 'PRESET_BOWL',
    stock: 50
  });

  const { addToast } = useToast();

  const fetchProducts = () => {
    productsAPI.getAll().then((res) => {
      if (res.success) setProducts(res.products);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await productsAPI.update(editingItem.id, formData);
        if (res.success) addToast(res.message, 'success');
      } else {
        const res = await productsAPI.create(formData);
        if (res.success) addToast(res.message, 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchProducts();
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this catalog product?')) return;
    try {
      const res = await productsAPI.delete(id);
      if (res.success) {
        addToast(res.message, 'info');
        fetchProducts();
      }
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      price: 199,
      protein: 30,
      calories: 350,
      carbs: 25,
      fat: 8,
      category: 'PRESET_BOWL',
      stock: 50
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white">Product Catalog Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage preset fitness bowls, protein smoothies, shakes, and juices.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> Add Catalog Product
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Macros</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-4 font-bold dark:text-white flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                      <div>
                        <div>{p.name}</div>
                        <div className="text-xs text-slate-400 font-normal line-clamp-1">{p.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{p.category}</td>
                    <td className="py-4 px-4 text-xs font-bold text-emerald-500">{p.protein}g Protein | {p.calories} kcal</td>
                    <td className="py-4 px-4 font-black dark:text-white">₹{p.price}</td>
                    <td className="py-4 px-4 font-bold">{p.stock}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Product' : 'Create Catalog Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Product Title</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Description</label>
            <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold">
                <option value="PRESET_BOWL">PRESET BOWL</option>
                <option value="SMOOTHIE">SMOOTHIE</option>
                <option value="PROTEIN_SHAKE">PROTEIN SHAKE</option>
                <option value="JUICE">JUICE</option>
                <option value="PACKAGE">PACKAGE</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Price (₹)</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Protein (g)</label>
              <input type="number" step="0.1" value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Calories (kcal)</label>
              <input type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Image URL</label>
            <input type="text" placeholder="https://..." value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 mt-4">
            {editingItem ? 'Save Changes' : 'Create Catalog Product'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
