import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    { q: 'How does live nutrition calculation work?', a: 'As you pick ingredients in the Bowl Builder, our engine calculates protein, calories, carbs, fat, and weight live in real time.' },
    { q: 'Can I pause my monthly diet subscription?', a: 'Yes! You can pause, resume, or edit tomorrow meal configuration anytime directly from your Customer Dashboard.' },
    { q: 'What payment options are supported?', a: 'We accept Razorpay, Credit/Debit Cards, UPI, NetBanking, and Wallet payments.' },
    { q: 'Where do you source your ingredients?', a: 'We partner directly with certified organic farms and high-protein dairy suppliers daily.' }
  ];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 space-y-3">
          <HelpCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h1 className="text-4xl font-black dark:text-white">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-lg dark:text-white">{f.q}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
