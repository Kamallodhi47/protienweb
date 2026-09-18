import React from 'react';
import Modal from './Modal';
import { Printer, Download, Dumbbell } from 'lucide-react';

export default function OrderInvoiceModal({ isOpen, onClose, order }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice - ${order.orderNumber}`}>
      <div id="printable-invoice" className="space-y-6 text-slate-800 dark:text-slate-200">
        {/* Invoice Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-500">PROTEIN PROJECT</h2>
              <span className="text-xs text-slate-500">Official Nutrition Tax Invoice</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">Invoice #{order.orderNumber}</div>
            <div className="text-xs text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivered To</span>
            <div className="font-bold">{order.deliveryAddress}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</span>
            <div className="font-bold">{order.paymentMethod} ({order.paymentStatus})</div>
          </div>
        </div>

        {/* Order Items Table */}
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase">
              <th className="py-2">Item Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-3 font-semibold">
                  {item.name}
                  <span className="block text-xs text-emerald-500">{item.protein}g Protein | {item.calories} kcal</span>
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">₹{item.price}</td>
                <td className="py-3 text-right font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>GST (5%)</span>
            <span>₹{order.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-emerald-500 border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Grand Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}
