import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function SubscriptionFailurePage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subId = queryParams.get('subId');

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <XCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Payment Failed</h1>
          <p className="text-xs text-[#5b6259]">We couldn't verify your payment. Your subscription remains inactive.</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-left">
          <p className="text-xs text-rose-800 leading-relaxed font-semibold">
            Common reasons for failure:
          </p>
          <ul className="list-disc pl-4 text-[11px] text-rose-700 mt-1 space-y-0.5">
            <li>Incorrect card numbers, expiry dates, or CVV.</li>
            <li>Bank OTP authentication timed out.</li>
            <li>Insufficient funds in the selected account.</li>
            <li>Transaction declined by your issuing card provider.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            to="/subscription"
            className="btn btn-primary justify-center flex items-center gap-1.5 py-3 font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4" /> Try Payment Again
          </Link>
          <Link
            to="/subscription"
            className="w-full py-3 bg-[#f2f6ee] hover:bg-[#e5e3da] text-[#5b6259] font-bold text-xs rounded-full border border-[#e5e3da] flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
