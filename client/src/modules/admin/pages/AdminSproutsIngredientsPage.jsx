import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { sproutsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import { Plus, Edit, Trash2, Check, X, Search } from 'lucide-react';

export default function AdminSproutsIngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
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
    categoryId: '',
    description: '',
    image: '',
    portionSize: '50g',
    unit: 'g',
    price: 0,
    protein: 0,
    calories: 0,
    carbohydrates: 0,
    healthyFat: 0,
    fiber: 0,
    weight: 50,
    displayOrder: 0,
    isActive: true,
    isFeatured: false
  });

  const { addToast } = useToast();

  const fetchIngredients = () => {
    sproutsAPI.getIngredients({
      search: search || undefined,
      categoryId: filterCategory || undefined
    })
      .then((res) => {
        if (res.success) setIngredients(res.ingredients);
      })
      .catch((err) => {
        console.error('Error fetching ingredients:', err);
      });
  };

  const fetchCategories = () => {
    sproutsAPI.getCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.categories);
          // Set default category for form if none set
          if (res.categories.length > 0 && !formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: res.categories[0].id }));
          }
        }
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [search, filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name) return addToast('Ingredient name is required.', 'error');
    if (!formData.categoryId) return addToast('Category is required.', 'error');
    if (Number(formData.protein) < 0) return addToast('Protein cannot be negative.', 'error');
    if (Number(formData.calories) < 0) return addToast('Calories cannot be negative.', 'error');
    if (Number(formData.carbohydrates) < 0) return addToast('Carbohydrates cannot be negative.', 'error');
    if (Number(formData.healthyFat) < 0) return addToast('Healthy Fat cannot be negative.', 'error');
    if (Number(formData.fiber) < 0) return addToast('Fiber cannot be negative.', 'error');
    if (Number(formData.weight) < 0) return addToast('Weight cannot be negative.', 'error');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        protein: Number(formData.protein),
        calories: Number(formData.calories),
        carbohydrates: Number(formData.carbohydrates),
        healthyFat: Number(formData.healthyFat),
        fiber: Number(formData.fiber),
        weight: Number(formData.weight),
        displayOrder: Number(formData.displayOrder)
      };

      if (editingItem) {
        const res = await sproutsAPI.updateIngredient(editingItem.id, payload);
        if (res.success) addToast(res.message, 'success');
      } else {
        const res = await sproutsAPI.createIngredient(payload);
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
      const res = await sproutsAPI.deleteIngredient(id);
      if (res.success) {
        addToast(res.message, 'info');
        fetchIngredients();
      }
    } catch (err) {
      addToast(err.message || 'Delete failed.', 'error');
    }
  };

  const toggleStatus = async (item) => {
    try {
      const res = await sproutsAPI.updateIngredient(item.id, { isActive: !item.isActive });
      if (res.success) {
        addToast(`Ingredient status updated to ${!item.isActive ? 'Active' : 'Inactive'}`, 'success');
        fetchIngredients();
      }
    } catch (err) {
      addToast(err.message || 'Update status failed.', 'error');
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      description: '',
      image: '',
      portionSize: '50g',
      unit: 'g',
      price: 0,
      protein: 0,
      calories: 0,
      carbohydrates: 0,
      healthyFat: 0,
      fiber: 0,
      weight: 50,
      displayOrder: ingredients.length + 1,
      isActive: true,
      isFeatured: false
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || '',
      image: item.image || '',
      portionSize: item.portionSize,
      unit: item.unit || 'g',
      price: item.price,
      protein: item.protein,
      calories: item.calories,
      carbohydrates: item.carbohydrates || 0,
      healthyFat: item.healthyFat || 0,
      fiber: item.fiber || 0,
      weight: item.weight || 50,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      isFeatured: item.isFeatured || false
    });
    setIsModalOpen(true);
  };

  const openCreateForSeasoning = () => {
    const seasoningCat = categories.find((c) => c.slug === 'seasonings');
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: seasoningCat ? seasoningCat.id : (categories.length > 0 ? categories[0].id : ''),
      description: '',
      image: '',
      portionSize: '1 Portion',
      unit: 'g',
      price: 5,
      protein: 0.1,
      calories: 5,
      carbohydrates: 1,
      healthyFat: 0,
      fiber: 0.1,
      weight: 10,
      displayOrder: ingredients.length + 1,
      isActive: true,
      isFeatured: false
    });
    setIsModalOpen(true);
  };

  const isSeasoning = (i) => i.category?.slug === 'seasonings' || i.name.toLowerCase().includes('nimbu') || i.name.toLowerCase().includes('masala') || i.name.toLowerCase().includes('pudina') || i.name.toLowerCase().includes('lemon') || i.name.toLowerCase().includes('mint');

  const mainSproutsIngredients = ingredients.filter((i) => !isSeasoning(i));
  const seasoningSproutsIngredients = ingredients.filter((i) => isSeasoning(i));

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Sprouts &amp; Protein Ingredients CMS</h1>
            <p className="text-sm text-[#5b6259]">Manage dynamic custom bowl ingredients, macro profiles, and bottom seasonings (Nimbu, Masala, Pudina).</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> Add Main Ingredient
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b6259]" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#e5e3da] text-xs font-semibold text-[#1c211d] focus:outline-none focus:border-[#3f7d40]"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#e5e3da] text-xs font-semibold text-[#1c211d] focus:outline-none focus:border-[#3f7d40]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Sprouts Ingredients Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#e5e3da] shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-[#1c4a2b]">🌱 Main Sprouts &amp; Protein Ingredients</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e3da] text-xs font-bold text-[#5b6259] uppercase">
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Portion / Wt</th>
                  <th className="py-3 px-4">Macros (P/Cal)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e3da]/60">
                {mainSproutsIngredients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#5b6259]">
                      No main ingredients found. Click Add Main Ingredient above to create one.
                    </td>
                  </tr>
                ) : (
                  mainSproutsIngredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-[#f2f6ee]/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#1c4a2b] flex items-center gap-3">
                        <img
                          src={ing.image}
                          alt={ing.name}
                          className="w-10 h-10 object-cover rounded-xl shrink-0 bg-[#f2f6ee]"
                        />
                        <div>
                          <div>{ing.name}</div>
                          {ing.isFeatured && (
                            <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-[#fdf1de] text-[#e8a33d] font-extrabold uppercase rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-[#5b6259]">
                        {ing.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#1c211d]">
                        {ing.portionSize} ({ing.weight}{ing.unit})
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-[#3f7d40]">
                        {ing.protein}g Protein · {ing.calories} kcal
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleStatus(ing)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            ing.isActive
                              ? 'bg-[#e7efdf] text-[#2f6b3a]'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {ing.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {ing.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button onClick={() => openEdit(ing)} className="p-2 text-[#5b6259] hover:text-[#3f7d40] transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ing.id)} className="p-2 text-[#5b6259] hover:text-rose-600 transition-colors" title="Delete">
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

        {/* Bottom Dedicated Seasonings & Taste Add-ons Table */}
        <div className="bg-[#faf7f0] rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-amber-900 flex items-center gap-2">
                🍋 Taste &amp; Seasonings Add-ons (Nimbu, Masala, Pudina)
              </h2>
              <p className="text-xs text-amber-700">
                These seasonings appear exclusively in the bottom section of the user sprouts &amp; protein builder.
              </p>
            </div>
            <button
              onClick={openCreateForSeasoning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Seasoning (Nimbu/Masala/Pudina)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-xs font-bold text-amber-800 uppercase">
                  <th className="py-3 px-4">Seasoning</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Portion / Wt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60">
                {seasoningSproutsIngredients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-xs text-amber-700 font-medium">
                      No seasonings found. Click "+ Add Seasoning" above to create Nimbu, Masala, Pudina.
                    </td>
                  </tr>
                ) : (
                  seasoningSproutsIngredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-amber-100/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-amber-950 flex items-center gap-3">
                        {ing.image ? (
                          <img
                            src={ing.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover shrink-0 bg-[#e7efdf]"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={`w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center ${ing.image ? 'hidden' : ''}`}>
                          {ing.name.toLowerCase().includes('nimbu') || ing.name.toLowerCase().includes('lemon') ? '🍋' : ing.name.toLowerCase().includes('pudina') || ing.name.toLowerCase().includes('mint') ? '🌿' : '🧂'}
                        </span>
                        {ing.name}
                      </td>
                      <td className="py-4 px-4 text-xs font-extrabold text-amber-700">
                        {ing.category?.name || 'Step 6: Taste & Dressing'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-amber-900">
                        {ing.portionSize} ({ing.weight}{ing.unit})
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleStatus(ing)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            ing.isActive
                              ? 'bg-amber-200/80 text-amber-900'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {ing.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {ing.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button onClick={() => openEdit(ing)} className="p-2 text-amber-800 hover:text-amber-950 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ing.id)} className="p-2 text-amber-800 hover:text-rose-600 transition-colors" title="Delete">
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
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={editingItem ? 'Edit Ingredient' : 'Create Ingredient'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Ingredient Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
                placeholder="e.g. Organic Moong Sprouts"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              rows="2"
              placeholder="e.g. Nutrient rich sprouts loaded with Vitamin B"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Portion Size *</label>
              <input
                type="text"
                required
                value={formData.portionSize}
                onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
                placeholder="e.g. 50g"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Weight (g) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-[#5b6259] block mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                className="w-full px-2.5 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-xs font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#5b6259] block mb-1">Calories</label>
              <input
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-2.5 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-xs font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#5b6259] block mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.carbohydrates}
                onChange={(e) => setFormData({ ...formData, carbohydrates: e.target.value })}
                className="w-full px-2.5 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-xs font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#5b6259] block mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.healthyFat}
                onChange={(e) => setFormData({ ...formData, healthyFat: e.target.value })}
                className="w-full px-2.5 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-xs font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[#5b6259] block mb-1">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.fiber}
                onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                className="w-full px-2.5 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-xs font-semibold focus:outline-none focus:border-[#3f7d40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Status</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#5b6259] block mb-1">Featured</label>
              <select
                value={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === 'true' })}
                className="w-full px-4 py-3 rounded-xl bg-[#f2f6ee]/50 text-[#1c211d] border border-[#e5e3da] text-sm font-semibold focus:outline-none focus:border-[#3f7d40]"
              >
                <option value="false">No</option>
                <option value="true">Featured</option>
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
              {editingItem ? 'Save Changes' : 'Create Ingredient'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
