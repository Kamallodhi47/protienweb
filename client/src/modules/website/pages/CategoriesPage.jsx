import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { ArrowRight, Leaf, Flame, Sparkles } from 'lucide-react';

export default function CategoriesPage() {
  const categoryCards = [
    {
      title: 'Build Your Own Protein Bowl',
      subtitle: 'Fruit Salad Builder',
      description: 'Choose from a variety of fresh organic fruits, crisp veggies, sprouts, seeds and healthy toppings. We count and weigh the macros live for you.',
      image: '/protein-bowl-card.png',
      path: '/bowl-builder',
      badge: 'Interactive Builder',
      icon: Leaf,
      buttonText: 'Start Building Fruits'
    },
    {
      title: 'Sprouts & Protein Bowl',
      subtitle: 'Dynamic Sprouts Builder',
      description: 'Select dynamic sprouts, premium proteins like tofu and paneer, fresh crunchy veggies, micro-nutrient seeds, and power foods.',
      image: '/sprouts-protein-card.jpg',
      path: '/sprouts-protein',
      badge: 'Dynamic & Macros-Rich',
      icon: Flame,
      buttonText: 'Start Building Sprouts'
    },
    {
      title: 'Fresh & Healthy Juices',
      subtitle: 'Cold-Pressed Detox Juice Bar',
      description: '100% natural, raw cold-pressed functional juices and immunity shots loaded with vitamins, active enzymes, and stamina boosters.',
      image: '/fresh-juices-card.png',
      path: '/juices',
      badge: 'Detox & Hydrate',
      icon: Sparkles,
      buttonText: 'Explore Juices'
    }
  ];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <span className="kit-section-label">Menu Categories</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c4a2b] leading-tight">Choose Your Builder Category</h1>
          <p className="text-[#5b6259] text-base sm:text-lg leading-relaxed font-medium">
            Select from our dynamic bowl builders or explore cold-pressed juices to fit your nutritional goals and lifestyle perfectly.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {categoryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="relative border border-[#e5e3da] rounded-[24px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group min-h-[400px] sm:min-h-[460px] justify-between"
              >
                {/* Background image & overlay - Clickable Link */}
                <Link to={card.path} className="relative h-52 w-full overflow-hidden bg-[#f2f6ee] block cursor-pointer">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  
                  {/* Category Icon Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#e5e3da] text-[10px] font-extrabold text-[#1c4a2b] uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-[#3f7d40]" />
                    {card.badge}
                  </div>
                </Link>

                {/* Content body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3f7d40]">
                      {card.subtitle}
                    </span>
                    <Link to={card.path} className="block hover:text-[#3f7d40] transition-colors">
                      <h3 className="text-xl sm:text-2xl font-black text-[#1c4a2b] leading-snug">
                        {card.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-[#5b6259] leading-relaxed font-medium">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link
                      to={card.path}
                      className="btn btn-primary w-full justify-center text-sm font-extrabold inline-flex items-center gap-2 py-3 rounded-xl transition-all shadow-xs"
                    >
                      {card.buttonText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
