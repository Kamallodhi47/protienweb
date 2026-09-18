import React, { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { customerAPI } from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Flame, Trophy, Award, Heart } from 'lucide-react';

export default function CustomerAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    customerAPI.getAnalytics().then((res) => {
      if (res.success) setData(res);
    });
  }, []);

  return (
    <CustomerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Protein & Fitness Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Detailed breakdown of weekly/monthly protein intake and favorite meals.</p>
        </div>

        {/* Weekly Protein vs Goal Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-500" /> Weekly Protein Intake vs Goal (Grams)
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Bar dataKey="protein" fill="#10b981" radius={[8, 8, 0, 0]} name="Protein (g)" />
                <Bar dataKey="goal" fill="#334155" radius={[8, 8, 0, 0]} name="Goal (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calorie Trend Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Monthly Calorie Progression
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={3} name="Weekly Protein" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Favorite Meals Roster */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Most Frequently Ordered Meals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data?.favoriteMeals?.map((meal, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm dark:text-white">{meal.name}</h4>
                <div className="text-xs text-emerald-500 font-semibold mt-1">
                  Ordered {meal.count} times • {meal.protein}g Protein
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
