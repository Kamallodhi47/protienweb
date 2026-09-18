import React from 'react';

export default function Badge({ status }) {
  const getColors = () => {
    switch (String(status).toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'ACCEPTED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'PREPARING':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'DISPATCH':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
      case 'DELIVERED':
      case 'ACTIVE':
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'CANCELLED':
      case 'OUT_OF_STOCK':
      case 'EXPIRED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'PAUSED':
      case 'LOW_STOCK':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getColors()}`}
    >
      {status}
    </span>
  );
}
