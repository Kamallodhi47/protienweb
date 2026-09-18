import React, { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { ordersAPI } from '../../../services/api';
import Badge from '../../../components/Badge';
import OrderInvoiceModal from '../../../components/OrderInvoiceModal';
import { Clock, CheckCircle2, Truck, PackageCheck, FileText, ChevronRight } from 'lucide-react';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

  useEffect(() => {
    ordersAPI.getMyOrders().then((res) => {
      if (res.success) {
        setOrders(res.orders);
        if (res.orders.length > 0) setSelectedOrder(res.orders[0]);
      }
    });
  }, []);

  const timelineSteps = ['PENDING', 'ACCEPTED', 'PREPARING', 'DISPATCH', 'DELIVERED'];

  const getStepIndex = (status) => {
    return timelineSteps.indexOf(String(status).toUpperCase());
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Order Tracking & History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track order timeline status live from kitchen to doorstep.</p>
        </div>

        {/* Selected Order Live Timeline Tracker */}
        {selectedOrder && (
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Status Tracker</span>
                <h3 className="text-xl font-black dark:text-white">Order #{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setInvoiceModalOrder(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold dark:text-white hover:bg-emerald-500 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" /> Download Invoice
              </button>
            </div>

            {/* Timeline Bar */}
            <div className="grid grid-cols-5 gap-2 relative py-4">
              {timelineSteps.map((step, idx) => {
                const currentIdx = getStepIndex(selectedOrder.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="text-center space-y-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-emerald-500 font-black' : isCompleted ? 'dark:text-white' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white">All Past Orders</h3>
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                  selectedOrder?.id === ord.id
                    ? 'bg-emerald-500/10 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base dark:text-white">{ord.orderNumber}</span>
                    <Badge status={ord.status} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(ord.createdAt).toLocaleString()} • {ord.items?.length || 1} Items
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black dark:text-white">₹{ord.totalAmount}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OrderInvoiceModal
        isOpen={Boolean(invoiceModalOrder)}
        onClose={() => setInvoiceModalOrder(null)}
        order={invoiceModalOrder}
      />
    </CustomerLayout>
  );
}
