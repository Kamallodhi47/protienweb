import React from 'react';
import PublicLayout from '../layouts/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-slate-700 dark:text-slate-300">
        <h1 className="text-4xl font-black dark:text-white">Privacy Policy</h1>
        <p className="text-sm leading-relaxed">
          At Protein Project, your privacy and personal data security are paramount. We collect essential information strictly for order fulfillment, macro tracking personalization, and customer support.
        </p>
        <h3 className="text-xl font-bold dark:text-white">Data Protection & Encryption</h3>
        <p className="text-sm leading-relaxed">
          All passwords are hashed using Bcrypt encryption, and network communication is secured over standard SSL/TLS protocols.
        </p>
      </div>
    </PublicLayout>
  );
}
