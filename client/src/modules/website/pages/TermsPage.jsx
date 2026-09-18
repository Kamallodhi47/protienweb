import React from 'react';
import PublicLayout from '../layouts/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-slate-700 dark:text-slate-300">
        <h1 className="text-4xl font-black dark:text-white">Terms of Service</h1>
        <p className="text-sm leading-relaxed">
          Welcome to Protein Project. By accessing our platform, ordering meal bowls, or subscribing to daily diet packages, you agree to adhere to all terms and conditions set forth herein.
        </p>
        <h3 className="text-xl font-bold dark:text-white">1. Orders & Deliveries</h3>
        <p className="text-sm leading-relaxed">
          Orders placed are processed immediately for fresh kitchen preparation. Deliveries are executed via cold-chain express logistics within designated delivery windows.
        </p>
        <h3 className="text-xl font-bold dark:text-white">2. Subscription Management</h3>
        <p className="text-sm leading-relaxed">
          Subscriptions may be paused or resumed up to 12 hours prior to the next scheduled morning delivery window via your Customer Dashboard.
        </p>
      </div>
    </PublicLayout>
  );
}
