import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { productsAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { Search, Filter, ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { LANDING_IMAGES } from '../../../constants/images';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('ALL'); // ALL | VEG | NON_VEG
  const [priceSort, setPriceSort] = useState('DEFAULT'); // DEFAULT | LOW_HIGH | HIGH_LOW
  const [proteinMin, setProteinMin] = useState(0);
  const { addToCart } = useCart();

  // Initial products dataset with real items specified in requirement
  const defaultItems = [
    { id: 'm1', name: 'High Protein Bowl', category: 'BOWLS', price: 249, protein: 42, calories: 480, diet: 'VEG', image: LANDING_IMAGES.popularPicks.highProteinBowl, description: 'Quinoa, grilled tofu, chickpeas, avocado, red cabbage & broccoli.' },
    { id: 'm2', name: 'Paneer Power Bowl', category: 'BOWLS', price: 279, protein: 38, calories: 510, diet: 'VEG', image: LANDING_IMAGES.popularPicks.paneerPowerBowl, description: 'Organic paneer cubes, roasted seeds, edamame, bell peppers & brown rice.' },
    { id: 'm3', name: 'Quinoa Super Bowl', category: 'BOWLS', price: 239, protein: 35, calories: 440, diet: 'VEG', image: LANDING_IMAGES.popularPicks.quinoaSuperBowl, description: 'Superfood quinoa with mixed greens, avocado, flax seeds & cherry tomatoes.' },
    { id: 'm4', name: 'Green Detox Juice', category: 'JUICES', price: 149, protein: 2, calories: 95, diet: 'VEG', image: LANDING_IMAGES.popularPicks.greenDetoxJuice, description: 'Cold pressed spinach, celery, green apple, cucumber & lemon shot.' },
    { id: 'm5', name: 'Beetroot Boost Juice', category: 'JUICES', price: 149, protein: 3, calories: 110, diet: 'VEG', image: LANDING_IMAGES.popularPicks.beetrootBoostJuice, description: 'Fresh beetroot, pomegranate, ginger & Himalayan pink salt.' },
    { id: 'm6', name: 'Amla Immunity Shot', category: 'JUICES', price: 99, protein: 1, calories: 35, diet: 'VEG', image: LANDING_IMAGES.popularPicks.amlaImmunityShot, description: 'Concentrated organic Indian gooseberry with black salt & lemon.' },
  ];

  useEffect(() => {
    productsAPI
      .getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products);
        } else {
          setProducts(defaultItems);
        }
      })
      .catch(() => {
        setProducts(defaultItems);
      });
  }, []);

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchDiet = dietFilter === 'ALL' || (p.diet && p.diet === dietFilter) || dietFilter === 'VEG';
      const matchProtein = p.protein >= proteinMin;
      return matchSearch && matchDiet && matchProtein;
    })
    .sort((a, b) => {
      if (priceSort === 'LOW_HIGH') return a.price - b.price;
      if (priceSort === 'HIGH_LOW') return b.price - a.price;
      return 0;
    });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="kit-section-label">Fresh &amp; Healthy Menu</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Fitness Nutrition Menu</h1>
          <p className="text-[#5b6259] text-base">Explore pre-calculated macro-balanced bowls, protein smoothies &amp; cold pressed juices.</p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-[#e5e3da] p-4 rounded-[22px] shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f2f6ee] text-xs font-medium text-[#1c211d] focus:outline-none focus:ring-1 focus:ring-[#3f7d40]"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs font-semibold">
            {/* Diet Filter */}
            <div className="flex items-center bg-[#f2f6ee] p-1 rounded-full border border-[#e5e3da]">
              {['ALL', 'VEG'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDietFilter(type)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    dietFilter === type ? 'bg-[#3f7d40] text-white' : 'text-[#5b6259] hover:text-[#1c4a2b]'
                  }`}
                >
                  {type === 'ALL' ? 'All Meals' : '🌿 100% Veg'}
                </button>
              ))}
            </div>

            {/* Protein Content Range */}
            <div className="flex items-center gap-2 bg-[#f2f6ee] px-3 py-1.5 rounded-full border border-[#e5e3da]">
              <span className="text-[#5b6259]">Min Protein:</span>
              <select
                value={proteinMin}
                onChange={(e) => setProteinMin(Number(e.target.value))}
                className="bg-transparent text-[#1c4a2b] font-bold focus:outline-none"
              >
                <option value={0}>All Protein</option>
                <option value={10}>10g+</option>
                <option value={25}>25g+</option>
                <option value={35}>35g+</option>
              </select>
            </div>

            {/* Price Sort */}
            <div className="flex items-center gap-2 bg-[#f2f6ee] px-3 py-1.5 rounded-full border border-[#e5e3da]">
              <span className="text-[#5b6259]">Sort:</span>
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
                className="bg-transparent text-[#1c4a2b] font-bold focus:outline-none"
              >
                <option value="DEFAULT">Featured</option>
                <option value="LOW_HIGH">Price: Low to High</option>
                <option value="HIGH_LOW">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-[22px] border border-[#e5e3da] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden mb-4 bg-[#f2f6ee]">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-green">{prod.category || 'FRESH'}</span>
                  <span className="text-xs font-bold text-[#3f7d40]">{prod.protein}g Protein</span>
                </div>
                <h3 className="font-extrabold text-lg text-[#1c4a2b]">{prod.name}</h3>
                <p className="text-xs text-[#5b6259] mt-1.5 leading-relaxed line-clamp-2">{prod.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#e5e3da] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5b6259] block">Price</span>
                  <span className="text-xl font-extrabold text-[#1c4a2b]">₹{prod.price}</span>
                </div>
                <button
                  onClick={() => addToCart(prod)}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
