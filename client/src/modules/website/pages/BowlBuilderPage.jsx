import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { ingredientsAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { Flame, Plus, Check, ShoppingBag, RotateCcw, Scale, Zap, Info } from 'lucide-react';
import { LANDING_IMAGES } from '../../../constants/images';

export default function BowlBuilderPage() {
  const [ingredients, setIngredients] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const {
    customBowl,
    bowlMacros,
    toggleIngredientInBowl,
    clearCustomBowl,
    addCustomBowlToCart
  } = useCart();

  // Step names matching user requirement
  const steps = [
    { label: 'All Items', key: 'ALL' },
    { label: 'Step 1: Fruits', key: 'FRUITS' },
    { label: 'Step 2: Sprouts & Protein', key: 'SPROUTS' },
    { label: 'Step 3: Veggies', key: 'VEGETABLES' },
    { label: 'Step 4: Power Seeds', key: 'SEEDS' }
  ];

  const defaultIngredients = [
    { id: 'i1', name: 'Fresh Organic Apple', category: 'FRUITS', price: 40, weight: 100, protein: 0.5, calories: 52, image: LANDING_IMAGES.popularPicks.highProteinBowl },
    { id: 'i2', name: 'Alphonso Mango Slices', category: 'FRUITS', price: 60, weight: 100, protein: 0.8, calories: 60, image: LANDING_IMAGES.popularPicks.paneerPowerBowl },
    { id: 'i3', name: 'Green Moong Sprouts', category: 'SPROUTS', price: 45, weight: 100, protein: 7.2, calories: 105, image: LANDING_IMAGES.popularPicks.quinoaSuperBowl },
    { id: 'i4', name: 'Kala Chana & Paneer', category: 'SPROUTS', price: 55, weight: 100, protein: 12.0, calories: 160, image: LANDING_IMAGES.popularPicks.highProteinBowl },
    { id: 'i5', name: 'Crisp Broccoli & Tomatoes', category: 'VEGETABLES', price: 35, weight: 100, protein: 2.8, calories: 34, image: LANDING_IMAGES.popularPicks.quinoaSuperBowl },
    { id: 'i6', name: 'Chia & Pumpkin Seeds', category: 'SEEDS', price: 50, weight: 50, protein: 6.5, calories: 140, image: LANDING_IMAGES.popularPicks.paneerPowerBowl },
    { id: 'i7', name: 'Fresh Lemon Squeeze (Nimbu)', category: 'SEASONINGS', price: 5, weight: 10, protein: 0.1, calories: 5, image: 'https://images.unsplash.com/photo-1534531141161-e41d1341d1de?w=200' },
    { id: 'i8', name: 'Special Chaat Masala', category: 'SEASONINGS', price: 5, weight: 5, protein: 0.0, calories: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
    { id: 'i9', name: 'Fresh Mint Leaves (Pudina)', category: 'SEASONINGS', price: 5, weight: 10, protein: 0.2, calories: 4, image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200' },
  ];

  useEffect(() => {
    ingredientsAPI
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.ingredients)) {
          setIngredients(res.ingredients);
        } else {
          setIngredients(defaultIngredients);
        }
      })
      .catch(() => {
        setIngredients(defaultIngredients);
      })
      .finally(() => setLoading(false));
  }, []);

  const isSeasoning = (i) => i.category === 'SEASONINGS' || i.name.toLowerCase().includes('nimbu') || i.name.toLowerCase().includes('masala') || i.name.toLowerCase().includes('pudina') || i.name.toLowerCase().includes('lemon') || i.name.toLowerCase().includes('mint');

  const filteredIngredients = (activeCategory === 'ALL'
    ? ingredients
    : ingredients.filter((i) => i.category === activeCategory)
  ).filter((i) => !isSeasoning(i));

  const isSelected = (id) => customBowl.selectedIngredients.some((i) => i.id === id);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="kit-section-label">Interactive Bowl Customizer</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Build Your Custom Bowl</h1>
          <p className="text-[#5b6259] text-base leading-relaxed">
            Step-by-step customizer: Choose your fruits, sprouts, veggies &amp; power seeds. Watch your live price and nutrition calculate instantly in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Ingredient Picker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pb-2">
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

            {/* Ingredient Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredIngredients.map((ing) => {
                const selected = isSelected(ing.id);
                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleIngredientInBowl(ing)}
                    className={`p-4 rounded-[18px] cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                      selected
                        ? 'bg-[#e7efdf] border-[#3f7d40] shadow-sm'
                        : 'bg-white border-[#e5e3da] hover:border-[#3f7d40]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={ing.image || LANDING_IMAGES.popularPicks.highProteinBowl}
                        alt={ing.name}
                        className="w-14 h-14 object-cover rounded-[12px] shrink-0 bg-[#f2f6ee]"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#1c4a2b]">{ing.name}</h4>
                        <div className="text-xs text-[#5b6259] mt-0.5">
                          {ing.weight}g portion
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

            {/* Bottom Section: Taste & Seasonings Add-ons (Nimbu, Masala, Pudina) */}
            <div className="bg-[#faf9f5] rounded-[22px] border border-[#e5e3da] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-[#1c4a2b] flex items-center gap-2">
                    🍋 Taste &amp; Seasonings (Nimbu, Masala, Pudina)
                  </h3>
                  <p className="text-xs text-[#5b6259]">Select flavor enhancers for your fruit bowl</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {ingredients
                  .filter((i) => i.category === 'SEASONINGS' || i.name.toLowerCase().includes('nimbu') || i.name.toLowerCase().includes('masala') || i.name.toLowerCase().includes('pudina') || i.name.toLowerCase().includes('lemon') || i.name.toLowerCase().includes('mint'))
                  .map((ing) => {
                    const selected = isSelected(ing.id);
                    return (
                      <div
                        key={ing.id}
                        onClick={() => toggleIngredientInBowl(ing)}
                        className={`p-3.5 rounded-[16px] cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                          selected
                            ? 'bg-[#e7efdf] border-[#3f7d40] shadow-xs'
                            : 'bg-white border-[#e5e3da] hover:border-[#3f7d40]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#e7efdf] text-[#3f7d40] font-bold text-sm flex items-center justify-center shrink-0">
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
                  onClick={clearCustomBowl}
                  className="p-2 rounded-full text-[#5b6259] hover:text-rose-600 transition-colors"
                  title="Reset Bowl"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Selected Ingredients Pills */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5b6259] block mb-2">
                  Selected Items ({customBowl.selectedIngredients.length}/6)
                </span>
                {customBowl.selectedIngredients.length === 0 ? (
                  <div className="p-3.5 rounded-[14px] bg-[#f2f6ee] text-xs text-[#5b6259] text-center">
                    Tap items on the left to start building your bowl.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {customBowl.selectedIngredients.map((item) => (
                      <span
                        key={item.id}
                        onClick={() => toggleIngredientInBowl(item)}
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
                  <div className="text-2xl font-extrabold text-[#3f7d40] mt-0.5">{bowlMacros.protein.toFixed(1)}g</div>
                </div>

                <div className="p-3.5 rounded-[14px] bg-[#fdf1de] border border-[#e8a33d]/30">
                  <div className="text-[11px] text-[#e8a33d] font-bold uppercase tracking-wider">Total Calories</div>
                  <div className="text-2xl font-extrabold text-[#e8a33d] mt-0.5">{bowlMacros.calories.toFixed(0)} kcal</div>
                </div>

                <div className="p-3 rounded-[14px] bg-[#f2f6ee]">
                  <div className="text-xs text-[#5b6259]">Carbs</div>
                  <div className="text-base font-bold text-[#1c211d]">{bowlMacros.carbs.toFixed(1)}g</div>
                </div>

                <div className="p-3 rounded-[14px] bg-[#f2f6ee]">
                  <div className="text-xs text-[#5b6259]">Healthy Fat</div>
                  <div className="text-base font-bold text-[#1c211d]">{bowlMacros.fat.toFixed(1)}g</div>
                </div>
              </div>

              {/* Total Weight & Price Summary */}
              <div className="border-t border-[#e5e3da] pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5b6259]">
                  <span className="flex items-center gap-1.5"><Scale className="w-4 h-4" /> Total Portion Weight</span>
                  <span className="font-bold text-[#1c211d]">{bowlMacros.weight}g</span>
                </div>
                <div className="flex items-center justify-between text-lg font-extrabold text-[#1c4a2b] pt-1">
                  <span>Custom Bowl Price</span>
                  <span className="text-[#3f7d40]">₹{bowlMacros.price.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={addCustomBowlToCart}
                disabled={customBowl.selectedIngredients.length === 0}
                className="btn btn-primary w-full justify-center disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" /> Add Custom Bowl to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
