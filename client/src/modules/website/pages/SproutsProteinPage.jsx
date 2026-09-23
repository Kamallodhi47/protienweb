import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { sproutsAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { Flame, Plus, Check, ShoppingBag, RotateCcw, Scale, Info, Search } from 'lucide-react';
import { LANDING_IMAGES } from '../../../constants/images';

export default function SproutsProteinPage() {
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Local selection state for independent builder
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const { addCustomItemToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      sproutsAPI.getCategories({ isActive: true }),
      sproutsAPI.getIngredients({ isActive: true })
    ])
      .then(([catRes, ingRes]) => {
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
        if (ingRes.success && ingRes.ingredients) {
          setIngredients(ingRes.ingredients);
        }
      })
      .catch((err) => {
        console.error('Error loading sprouts builder data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to identify seasoning items
  const isSeasoning = (ing) => ing.category?.slug === 'seasonings' || ing.name.toLowerCase().includes('nimbu') || ing.name.toLowerCase().includes('masala') || ing.name.toLowerCase().includes('pudina') || ing.name.toLowerCase().includes('lemon') || ing.name.toLowerCase().includes('mint');

  // Filter categories (exclude seasonings from top tabs)
  const steps = [
    { label: 'All Items', key: 'ALL' },
    ...categories.filter(cat => cat.slug !== 'seasonings').map(cat => ({ label: cat.name, key: cat.id }))
  ];

  // Filter ingredients by active category AND search query (and exclude seasonings from main grid)
  const filteredIngredients = ingredients.filter((ing) => {
    if (isSeasoning(ing)) return false;
    const matchesCategory = activeCategory === 'ALL' || ing.categoryId === activeCategory;
    const matchesSearch = searchQuery
      ? ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ing.description && ing.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  const isSelected = (id) => selectedIngredients.some((i) => i.id === id);

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((i) => i.id === ingredient.id);
      if (exists) {
        return prev.filter((i) => i.id !== ingredient.id);
      } else {
        const isSeasoningAddon = isSeasoning(ingredient);
        const mainCount = prev.filter((i) => !isSeasoning(i)).length;

        if (!isSeasoningAddon && mainCount >= 6) {
          addToast('You can select a maximum of 6 main ingredients per bowl. (Seasonings/Add-ons do not count towards this limit).', 'error');
          return prev;
        }
        return [...prev, ingredient];
      }
    });
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
  };

  // Live real-time calculations
  const baseBowlPrice = 99; // Fixed bowl price = 99
  const totals = selectedIngredients.reduce(
    (acc, ing) => {
      acc.protein += Number(ing.protein || 0);
      acc.calories += Number(ing.calories || 0);
      acc.carbs += Number(ing.carbohydrates || 0);
      acc.fat += Number(ing.healthyFat || 0);
      acc.fiber += Number(ing.fiber || 0);
      acc.weight += Number(ing.weight || 0);
      return acc;
    },
    { protein: 0, calories: 0, carbs: 0, fat: 0, fiber: 0, weight: 0, price: baseBowlPrice }
  );

  const handleAddToCart = () => {
    if (selectedIngredients.length === 0) {
      addToast('Please select at least 1 ingredient for your custom bowl.', 'error');
      return;
    }

    const item = {
      id: `custom-sprout-${Date.now()}`,
      name: 'Custom Sprouts & Protein Bowl',
      itemType: 'CUSTOM_BOWL',
      price: totals.price,
      protein: totals.protein,
      calories: totals.calories,
      carbs: totals.carbs,
      fat: totals.fat,
      fiber: totals.fiber,
      quantity: 1,
      image: LANDING_IMAGES.popularPicks.highProteinBowl,
      ingredientDetails: selectedIngredients
    };

    addCustomItemToCart(item);
    clearSelection();
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="kit-section-label">Interactive Sprout Builder</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Build Your Sprouts &amp; Protein Bowl</h1>
          <p className="text-[#5b6259] text-base leading-relaxed">
            Choose your sprouts, protein, healthy toppings &amp; power ingredients. Watch your live price and nutrition calculate instantly in real time.
          </p>
        </div>

        {/* Search bar & Categories filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {steps.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#3f7d40] text-white shadow-sm'
                    : 'bg-white border border-[#e5e3da] text-[#5b6259] hover:bg-[#f2f6ee]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b6259]" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#e5e3da] text-xs font-semibold text-[#1c211d] focus:outline-none focus:border-[#3f7d40] transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-[#5b6259]">
            Loading Sprouts &amp; Protein ingredients...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Ingredient Picker */}
            <div className="lg:col-span-2">
              {filteredIngredients.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#5b6259] bg-white rounded-[22px] border border-[#e5e3da] p-6">
                  No active ingredients found matching filters/search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredIngredients.map((ing) => {
                    const selected = isSelected(ing.id);
                    return (
                      <div
                        key={ing.id}
                        onClick={() => toggleIngredient(ing)}
                        className={`p-4 rounded-[18px] cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                          selected
                            ? 'bg-[#e7efdf] border-[#3f7d40] shadow-sm'
                            : 'bg-white border-[#e5e3da] hover:border-[#3f7d40]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={ing.image || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=100'}
                            alt={ing.name}
                            className="w-14 h-14 object-cover rounded-[12px] shrink-0 bg-[#f2f6ee]"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=100';
                            }}
                          />
                          <div>
                            <h4 className="font-bold text-sm text-[#1c4a2b]">{ing.name}</h4>
                            <div className="text-xs text-[#5b6259] mt-0.5">
                              {ing.portionSize} ({ing.weight}{ing.unit}) portion
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-bold text-[#3f7d40] mt-1">
                              <span>{ing.protein}g Protein</span>
                              <span>·</span>
                              <span>{ing.calories} kcal</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              selected ? 'bg-[#3f7d40] text-white' : 'bg-[#f2f6ee] text-[#5b6259]'
                            }`}
                          >
                            {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Section: Taste & Seasonings Add-ons (Nimbu, Masala, Pudina) */}
              <div className="bg-[#faf9f5] rounded-[22px] border border-[#e5e3da] p-5 shadow-xs space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-[#1c4a2b] flex items-center gap-2">
                      🍋 Taste &amp; Seasonings (Nimbu, Masala, Pudina)
                    </h3>
                    <p className="text-xs text-[#5b6259]">Select flavor enhancers for your sprouts &amp; protein bowl</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {ingredients
                    .filter((i) => i.category?.slug === 'seasonings' || i.name.toLowerCase().includes('nimbu') || i.name.toLowerCase().includes('masala') || i.name.toLowerCase().includes('pudina') || i.name.toLowerCase().includes('lemon') || i.name.toLowerCase().includes('mint'))
                    .map((ing) => {
                      const selected = isSelected(ing.id);
                      return (
                        <div
                          key={ing.id}
                          onClick={() => toggleIngredient(ing)}
                          className={`p-3.5 rounded-[16px] cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                            selected
                              ? 'bg-[#e7efdf] border-[#3f7d40] shadow-xs'
                              : 'bg-white border-[#e5e3da] hover:border-[#3f7d40]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {ing.image ? (
                              <img
                                src={ing.image}
                                alt={ing.name}
                                className="w-9 h-9 rounded-xl object-cover shrink-0 bg-[#e7efdf]"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-9 h-9 rounded-xl bg-[#e7efdf] text-[#3f7d40] font-bold text-sm flex items-center justify-center shrink-0 ${ing.image ? 'hidden' : ''}`}>
                              {ing.name.toLowerCase().includes('nimbu') || ing.name.toLowerCase().includes('lemon') ? '🍋' : ing.name.toLowerCase().includes('pudina') || ing.name.toLowerCase().includes('mint') ? '🌿' : '🧂'}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#1c4a2b]">{ing.name}</h4>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              selected ? 'bg-[#3f7d40] text-white' : 'bg-[#f2f6ee] text-[#5b6259]'
                            }`}
                          >
                            {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Col: Live Real-Time Nutrition Display Panel */}
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#e5e3da] pb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#1c4a2b]">Live Nutrition Engine</h3>
                    <span className="text-xs text-[#5b6259]">Calculates instantly on selection</span>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="p-2 rounded-full text-[#5b6259] hover:text-rose-600 transition-colors"
                    title="Reset Selection"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Ingredients Pills */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5b6259] block mb-2">
                    Selected Items ({selectedIngredients.length}/6)
                  </span>
                  {selectedIngredients.length === 0 ? (
                    <div className="p-3.5 rounded-[14px] bg-[#f2f6ee] text-xs text-[#5b6259] text-center">
                      Tap items on the left to start building your bowl.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {selectedIngredients.map((item) => (
                        <span
                          key={item.id}
                          onClick={() => toggleIngredient(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e7efdf] text-[#2f6b3a] border border-[#3f7d40]/30 text-xs font-bold cursor-pointer hover:bg-rose-100 hover:text-rose-700 transition-all"
                        >
                          {item.name} <Check className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Macro Indicators Display */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-[14px] bg-[#e7efdf] border border-[#3f7d40]/20">
                    <div className="text-[11px] text-[#2f6b3a] font-bold uppercase tracking-wider">Total Protein</div>
                    <div className="text-2xl font-extrabold text-[#3f7d40] mt-0.5">{totals.protein.toFixed(1)}g</div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#fdf1de] border border-[#e8a33d]/30">
                    <div className="text-[11px] text-[#e8a33d] font-bold uppercase tracking-wider">Total Calories</div>
                    <div className="text-2xl font-extrabold text-[#e8a33d] mt-0.5">{totals.calories.toFixed(0)} kcal</div>
                  </div>

                  <div className="p-3 rounded-[14px] bg-[#f2f6ee]">
                    <div className="text-xs text-[#5b6259]">Carbs</div>
                    <div className="text-base font-bold text-[#1c211d]">{totals.carbs.toFixed(1)}g</div>
                  </div>

                  <div className="p-3 rounded-[14px] bg-[#f2f6ee]">
                    <div className="text-xs text-[#5b6259]">Healthy Fat</div>
                    <div className="text-base font-bold text-[#1c211d]">{totals.fat.toFixed(1)}g</div>
                  </div>

                  <div className="p-3 rounded-[14px] bg-[#f2f6ee]">
                    <div className="text-xs text-[#5b6259]">Fiber</div>
                    <div className="text-base font-bold text-[#1c211d]">{totals.fiber.toFixed(1)}g</div>
                  </div>

                  <div className="p-3 rounded-[14px] bg-[#f2f6ee] flex flex-col justify-center">
                    <div className="text-xs text-[#5b6259]">Prep Fee</div>
                    <div className="text-base font-bold text-[#1c211d]">₹99</div>
                  </div>
                </div>

                {/* Total Weight & Price Summary */}
                <div className="border-t border-[#e5e3da] pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5b6259]">
                    <span className="flex items-center gap-1.5"><Scale className="w-4 h-4" /> Total Portion Weight</span>
                    <span className="font-bold text-[#1c211d]">{totals.weight}g</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-extrabold text-[#1c4a2b] pt-1">
                    <span>Custom Bowl Price</span>
                    <span className="text-[#3f7d40]">₹{totals.price.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary w-full justify-center"
                >
                  <ShoppingBag className="w-4 h-4" /> Add Custom Bowl to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
