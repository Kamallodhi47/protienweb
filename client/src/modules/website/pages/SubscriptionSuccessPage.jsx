import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { subscriptionsAPI } from '../../../services/api';
import { CheckCircle2, Calendar, Clock, ArrowRight, Home } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subId = queryParams.get('subId');

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subId) {
      navigate('/');
      return;
    }

    subscriptionsAPI.getById(subId)
      .then(res => {
        if (res.success && res.subscription) {
          setSubscription(res.subscription);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="py-20 text-center font-bold text-[#5b6259]">
          Verifying activation status...
        </div>
      </PublicLayout>
    );
  }

  const startDateStr = subscription?.start_date
    ? new Date(subscription.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Tomorrow';

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-12 h-12 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1c4a2b]">🎉 Subscription Activated!</h1>
          <p className="text-xs text-[#5b6259]">Your premium fitness nutrition schedule is now online.</p>
        </div>

        <div className="bg-[#f2f6ee] rounded-2xl border border-[#e5e3da] p-6 text-left space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3f7d40]">Active Plan</span>
            <h4 className="font-extrabold text-sm text-[#1c4a2b]">{subscription?.plan?.name}</h4>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5b6259] flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#3f7d40]" /> Starts Date</span>
            <span className="font-bold text-[#1c211d]">{startDateStr}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-[#e5e3da] pt-2.5">
            <span className="text-[#5b6259] flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#3f7d40]" /> Delivery Slot</span>
            <span className="font-bold text-[#1c211d]">{subscription?.delivery_time}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            to="/customer/subscriptions"
            className="btn btn-primary justify-center flex items-center gap-1.5 py-3 font-bold text-xs"
          >
            View My Subscription <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/customer/subscriptions?tab=calendar"
            className="w-full py-3 bg-[#e7efdf] hover:bg-[#dce9d2] text-[#2f6b3a] font-bold text-xs rounded-full border border-[#3f7d40]/20 flex items-center justify-center gap-1.5"
          >
            View Meal Calendar
          </Link>
          <Link
            to="/customer/subscriptions"
            className="w-full py-3 text-[#5b6259] hover:text-[#1c211d] text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
