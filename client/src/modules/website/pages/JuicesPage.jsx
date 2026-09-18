import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { productsAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { LANDING_IMAGES } from '../../../constants/images';

export default function JuicesPage() {
  const [juices, setJuices] = useState([]);
  const { addToCart } = useCart();

  const defaultJuices = [
    { id: 'j1', name: 'Green Detox Juice', price: 149, protein: 2.0, calories: 95, carbs: 22, fat: 0.3, image: LANDING_IMAGES.popularPicks.greenDetoxJuice, description: 'Cold-pressed spinach, celery, green apple, cucumber & lemon shot.' },
    { id: 'j2', name: 'Beetroot Boost Juice', price: 149, protein: 3.0, calories: 110, carbs: 25, fat: 0.4, image: LANDING_IMAGES.popularPicks.beetrootBoostJuice, description: 'Pre-workout stamina boost with organic beetroot, pomegranate & pink salt.' },
    { id: 'j3', name: 'Amla Immunity Shot', price: 99, protein: 1.0, calories: 35, carbs: 8, fat: 0.1, image: LANDING_IMAGES.popularPicks.amlaImmunityShot, description: 'Concentrated natural Vitamin C powerhouse shot from wild Indian gooseberries.' },
    { id: 'j4', name: 'Pure Aloe Vera Hydration', price: 79, protein: 0.4, calories: 25, carbs: 6, fat: 0.0, image: LANDING_IMAGES.popularPicks.greenDetoxJuice, description: 'Digestive & skin hydration blend with aloe vera pulp and coconut water.' },
  ];

  useEffect(() => {
    productsAPI
      .getJuices()
      .then((res) => {
        if (res.success && Array.isArray(res.juices)) {
          setJuices(res.juices);
        } else {
          setJuices(defaultJuices);
        }
      })
      .catch(() => {
        setJuices(defaultJuices);
      });
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="kit-section-label">Cold-Pressed Juice Bar</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Organic Juices &amp; Shots</h1>
          <p className="text-[#5b6259] text-base leading-relaxed">
            Raw, 100% cold-pressed functional juices packed with essential vitamins, digestive enzymes, and stamina boosters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {juices.map((juice) => (
            <div
              key={juice.id}
              className="bg-white rounded-[22px] border border-[#e5e3da] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square w-full rounded-[14px] overflow-hidden mb-4 bg-[#f2f6ee]">
                  <img src={juice.image} alt={juice.name} className="w-full h-full object-cover" />
                </div>
                <span className="badge badge-green mb-2">COLD-PRESSED</span>
                <h3 className="font-extrabold text-base text-[#1c4a2b] mt-1">{juice.name}</h3>
                <p className="text-xs text-[#5b6259] mt-1.5 leading-relaxed line-clamp-2">{juice.description}</p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2 py-2.5 my-3 border-y border-[#e5e3da] text-xs text-[#5b6259]">
                  <div><span className="font-bold text-[#1c4a2b]">{juice.protein}g</span> Protein</div>
                  <div><span className="font-bold text-[#1c4a2b]">{juice.calories}</span> kcal</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#1c4a2b]">₹{juice.price}</span>
                  <button
                    onClick={() => addToCart({ ...juice, category: 'JUICE' })}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
