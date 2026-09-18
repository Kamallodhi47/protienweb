import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { subscriptionsAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Check, CalendarCheck, PauseCircle, PlayCircle, Clock } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsAPI.getPlans()
      .then((res) => {
        if (res.success && res.plans) {
          setPlans(res.plans);
        }
      })
      .catch((err) => {
        addToast('Failed to load plans.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (plan) => {
    if (!user) {
      addToast('Please sign in to start a subscription plan.', 'info');
      navigate('/login');
      return;
    }
    navigate(`/subscription/checkout?planId=${plan.id}`);
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="kit-section-label">Hassle-Free Fitness Nutrition</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Subscription Plans</h1>
          <p className="text-[#5b6259] text-base leading-relaxed">
            Get your daily macro-quantified meals delivered fresh every day. Full control to pause, resume, or edit your meal choice anytime.
          </p>
        </div>

        {/* Plan Cards */}
        {loading ? (
          <div className="text-center py-20 font-bold text-[#5b6259]">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => {
              const features = plan.description ? plan.description.split(', ') : [];
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-[22px] border border-[#e5e3da] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
                >
                  <div>
                    {plan.badge && <span className="badge badge-green mb-2">{plan.badge}</span>}
                    <h3 className="font-extrabold text-2xl text-[#1c4a2b] mt-1">{plan.name}</h3>
                    <div className="text-xs font-bold text-[#3f7d40] mt-1">
                      Target: {plan.target_protein} Daily Protein
                    </div>

                    <div className="text-4xl font-extrabold text-[#1c4a2b] my-6">
                      ₹{plan.monthly_price} <span className="text-xs text-[#5b6259] font-normal">/ month</span>
                    </div>

                    <ul className="space-y-3 text-xs text-[#1c211d]">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-[#3f7d40] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    className="btn btn-primary w-full justify-center flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" /> Start Monthly Plan
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pause / Resume Feature Showcase */}
        <div className="cta-band bg-[#12331f] rounded-[22px] p-8 lg:p-12 text-white">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Flexible Pause &amp; Resume Control</h2>
            <p className="text-xs sm:text-sm text-[#c9d6c4] leading-relaxed">
              Traveling or changing your workout routine? Pause your plan with a single tap in your Customer Dashboard and resume whenever you're back.
            </p>
          </div>
          <div className="flex items-center gap-6 justify-center lg:justify-end">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-full text-xs font-bold">
              <PauseCircle className="w-5 h-5 text-amber-400" /> Pause Plan
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-full text-xs font-bold">
              <PlayCircle className="w-5 h-5 text-emerald-400" /> Resume Plan
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
