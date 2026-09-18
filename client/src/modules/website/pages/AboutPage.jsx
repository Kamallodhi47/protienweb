import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { ShieldCheck, Heart, Award, Leaf, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="kit-section-label">Our Story &amp; Mission</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Democratizing Fitness Nutrition</h1>
          <p className="text-[#5b6259] text-base leading-relaxed">
            Protein Project was created with a clear objective: eliminate nutrition guesswork. Every single ingredient in our kitchen is weighed, macro-quantified, and freshly prepared for your goals.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#1c4a2b]">Real Ingredients. Real Macros.</h2>
            <p className="text-sm text-[#5b6259] leading-relaxed font-medium">
              We believe that eating clean shouldn't mean sacrificing flavor or spending hours prepping meals. Our culinary team collaborates directly with sports nutritionists to craft meals that boost muscle recovery, sustain daily energy, and taste incredible.
            </p>
            <div className="space-y-3.5 text-xs font-bold text-[#1c211d]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-bold">
                  <Leaf className="w-4 h-4" />
                </div>
                <span>100% Farm-fresh organic fruits, sprouts, and vegetables</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Gram-accurate live macro calculation per portion</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Express 30-minute delivery in eco-friendly meal boxes</span>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] overflow-hidden shadow-lift border border-[#e5e3da] aspect-[4/3] bg-[#f2f6ee]">
            <img
              src="/about-img.png"
              alt="Protein Project Story & Healthy Couple"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[22px] border border-[#e5e3da] text-center space-y-4 shadow-xs">
            <ShieldCheck className="w-10 h-10 text-[#3f7d40] mx-auto" />
            <h3 className="text-lg font-extrabold text-[#1c4a2b]">100% Macro Accuracy</h3>
            <p className="text-xs text-[#5b6259] leading-relaxed font-medium">
              Digital portion scales ensure exact gram-for-gram protein accuracy in every single order.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[22px] border border-[#e5e3da] text-center space-y-4 shadow-xs">
            <Heart className="w-10 h-10 text-[#3f7d40] mx-auto" />
            <h3 className="text-lg font-extrabold text-[#1c4a2b]">Cleanest Ingredients</h3>
            <p className="text-xs text-[#5b6259] leading-relaxed font-medium">
              Zero refined oils, zero artificial sweeteners, and zero chemical preservatives.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[22px] border border-[#e5e3da] text-center space-y-4 shadow-xs">
            <Award className="w-10 h-10 text-[#3f7d40] mx-auto" />
            <h3 className="text-lg font-extrabold text-[#1c4a2b]">Chef Crafted Taste</h3>
            <p className="text-xs text-[#5b6259] leading-relaxed font-medium">
              Healthy nutrition never means bland taste. Culinary excellence meets sports science.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
