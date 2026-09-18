import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { ingredientsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Plus, Edit, Trash2, Search, RotateCcw, Check } from 'lucide-react';

export default function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'FRUITS',
    image: '',
    price: 40,
    protein: 1.0,
    calories: 50,
    carbs: 10,
    fat: 0.2,
    weight: 50,
    stock: 100
  });

  const { addToast } = useToast();

  const fetchIngredients = () => {
    ingredientsAPI.getAll({ search: search || undefined, category: category || undefined })
      .then((res) => {
        if (res.success) setIngredients(res.ingredients);
      });
  };

  useEffect(() => {
    fetchIngredients();
  }, [search, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await ingredientsAPI.update(editingItem.id, formData);
        if (res.success) addToast(res.message, 'success');
      } else {
        const res = await ingredientsAPI.create(formData);
        if (res.success) addToast(res.message, 'success');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchIngredients();
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      const res = await ingredientsAPI.delete(id);
      if (res.success) {
        addToast(res.message, 'info');
        fetchIngredients();
      }
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    }
  };

  const openCreate = (defaultCategory = 'FRUITS') => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: defaultCategory,
      image: '',
      price: 5,
      protein: 0.1,
      calories: 5,
      carbs: 1,
      fat: 0.0,
      weight: 10,
      stock: 100
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const isSeasoning = (i) => i.category === 'SEASONINGS' || i.name.toLowerCase().includes('nimbu') || i.name.toLowerCase().includes('masala') || i.name.toLowerCase().includes('pudina') || i.name.toLowerCase().includes('lemon') || i.name.toLowerCase().includes('mint');
  
  const mainIngredients = ingredients.filter((i) => !isSeasoning(i));
  const seasoningIngredients = ingredients.filter((i) => isSeasoning(i));

  return (
    <AdminLayout>
      <div className="space-[#e2e8f0] space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white">Fruit Bowl Ingredients &amp; Seasonings CMS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage custom bowl ingredients, macro profiles, and bottom seasonings (Nimbu, Masala, Pudina).</p>
          </div>
          <button
            onClick={() => openCreate('FRUITS')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> Add Main Ingredient
          </button>
        </div>

        {/* Main Ingredients Table */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-extrabold dark:text-white text-slate-800">
            🥗 Main Ingredients (Fruits, Sprouts, Veggies, Seeds)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Ingredient Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Macros (P / C / F)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mainIngredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-4 font-bold dark:text-white flex items-center gap-3">
                      <img src={ing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999'} alt="" className="w-10 h-10 object-cover rounded-xl shrink-0" />
                      {ing.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500">{ing.category}</td>
                    <td className="py-4 px-4 text-xs font-bold text-emerald-500">
                      {ing.protein}g P | {ing.carbs}g C | {ing.fat}g F ({ing.calories} kcal)
                    </td>
                    <td className="py-4 px-4 font-bold">{ing.stock}</td>
                    <td className="py-4 px-4"><Badge status={ing.status} /></td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button onClick={() => openEdit(ing)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ing.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Dedicated Seasonings & Taste Add-ons Table */}
        <div className="glass-card rounded-3xl p-6 border border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
                🍋 Taste &amp; Seasonings Add-ons (Nimbu, Masala, Pudina)
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                These seasonings appear exclusively in the bottom section of the user fruit bowl builder.
              </p>
            </div>
            <button
              onClick={() => openCreate('SEASONINGS')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Seasoning (Nimbu/Masala/Pudina)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200/60 dark:border-amber-900/60 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">
                  <th className="py-3 px-4">Seasoning Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-amber-900/40">
                {seasoningIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-amber-700 dark:text-amber-400 font-medium">
                      No seasonings added yet. Click "+ Add Seasoning" above to add Nimbu, Masala, Pudina.
                    </td>
                  </tr>
                ) : (
                  seasoningIngredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-amber-100/30 dark:hover:bg-amber-900/20">
                      <td className="py-4 px-4 font-bold text-amber-950 dark:text-amber-100 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
                          {ing.name.toLowerCase().includes('nimbu') || ing.name.toLowerCase().includes('lemon') ? '🍋' : ing.name.toLowerCase().includes('pudina') || ing.name.toLowerCase().includes('mint') ? '🌿' : '🧂'}
                        </span>
                        {ing.name}
                      </td>
                      <td className="py-4 px-4 text-xs font-extrabold text-amber-700">{ing.category}</td>
                      <td className="py-4 px-4 font-bold text-amber-800 dark:text-amber-300">{ing.stock}</td>
                      <td className="py-4 px-4"><Badge status={ing.status} /></td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button onClick={() => openEdit(ing)} className="p-2 text-amber-700 hover:text-amber-900 dark:text-amber-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ing.id)} className="p-2 text-amber-700 hover:text-rose-600 dark:text-amber-400 transition-colors">
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

      {/* Ingredient Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Ingredient' : 'Create Ingredient'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold">
                <option value="FRUITS">FRUITS</option>
                <option value="SPROUTS">SPROUTS</option>
                <option value="VEGETABLES">VEGETABLES</option>
                <option value="SEEDS">SEEDS</option>
                <option value="SEASONINGS">SEASONINGS (Nimbu, Masala, Pudina)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Protein (g)</label>
              <input type="number" step="0.1" required value={formData.protein} onChange={(e) => setFormData({ ...formData, protein: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Calories (kcal)</label>
              <input type="number" required value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Carbs (g)</label>
              <input type="number" step="0.1" value={formData.carbs} onChange={(e) => setFormData({ ...formData, carbs: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Fat (g)</label>
              <input type="number" step="0.1" value={formData.fat} onChange={(e) => setFormData({ ...formData, fat: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Stock Qty</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Image URL</label>
            <input type="text" placeholder="https://..." value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold" />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 mt-4">
            {editingItem ? 'Save Changes' : 'Create Ingredient'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
