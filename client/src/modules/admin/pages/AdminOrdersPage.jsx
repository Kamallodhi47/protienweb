import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { ordersAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Badge from '../../../components/Badge';
import OrderInvoiceModal from '../../../components/OrderInvoiceModal';
import { 
  Search, 
  FileText, 
  Check, 
  X, 
  Truck, 
  Package, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  User, 
  Tag, 
  CreditCard,
  UtensilsCrossed,
  Activity
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const { addToast } = useToast();

  const fetchOrders = () => {
    ordersAPI.getAllAdmin({ status: statusFilter || undefined, search: search || undefined })
      .then((res) => {
        if (res.success) setOrders(res.orders);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await ordersAPI.updateStatus(id, status);
      if (res.success) {
        addToast(res.message, 'success');
        fetchOrders();
      }
    } catch (err) {
      addToast(err.message || 'Status update failed.', 'error');
    }
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper stats
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const activeTotal = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1c4a2b] dark:text-white">Order Operations Workflow</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Process live kitchen orders, update dispatch status, and manage customer invoices.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#f2f6ee] dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-[#e2edd7] dark:border-slate-700">
            <Activity className="w-4 h-4 text-[#3f7d40]" />
            <span className="text-xs font-extrabold text-[#1c4a2b] dark:text-slate-200">
              Active Value: ₹{activeTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold block">Pending Acceptance</span>
              <span className="text-2xl font-black text-amber-900 dark:text-amber-300">{pendingCount} Orders</span>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-purple-700 dark:text-purple-400 font-bold block">Kitchen Preparing</span>
              <span className="text-2xl font-black text-purple-900 dark:text-purple-300">{preparingCount} Orders</span>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">Total Live Processed</span>
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{orders.length} Orders</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="relative w-full xl:w-96">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order Number, Address, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 text-sm font-semibold dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full xl:w-auto">
            {['', 'PENDING', 'ACCEPTED', 'PREPARING', 'DISPATCH', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  statusFilter === st
                    ? 'bg-[#3f7d40] text-white shadow-md shadow-emerald-700/10'
                    : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {st || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-card rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/10">
                  <th className="py-3.5 px-5 w-10"></th>
                  <th className="py-3.5 px-4">Order Number & Customer</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Workflow Actions</th>
                  <th className="py-3.5 px-4 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 font-bold">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => {
                    const isExpanded = expandedOrders[ord.id];
                    return (
                      <React.Fragment key={ord.id}>
                        {/* Main Row */}
                        <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isExpanded ? 'bg-[#f8faf6]/40 dark:bg-slate-800/20' : ''}`}>
                          <td className="py-4 px-5 text-center">
                            <button 
                              onClick={() => toggleOrderExpand(ord.id)}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-[#1c211d] dark:text-white flex items-center gap-1.5">
                              {ord.orderNumber}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3 text-[#3f7d40]" />
                              {ord.user ? `${ord.user.name} (${ord.user.email})` : 'Guest User'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#f2f6ee] dark:bg-slate-800 text-[#1c4a2b] dark:text-slate-200 uppercase border border-[#e2edd7] dark:border-slate-700">
                              <CreditCard className="w-3 h-3 text-[#3f7d40]" />
                              {ord.paymentMethod || 'COD'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge status={ord.status} />
                          </td>
                          <td className="py-4 px-4 font-black text-[#1c4a2b] dark:text-emerald-400 text-base">
                            ₹{ord.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {ord.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (ord.paymentMethod === 'RAZORPAY' && ord.paymentStatus !== 'COMPLETED') {
                                        addToast('Cannot accept order. Payment is not completed.', 'error');
                                        return;
                                      }
                                      handleUpdateStatus(ord.id, 'ACCEPTED');
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all ${
                                      ord.paymentMethod === 'RAZORPAY' && ord.paymentStatus !== 'COMPLETED'
                                      ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                      : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                    title={ord.paymentMethod === 'RAZORPAY' && ord.paymentStatus !== 'COMPLETED' ? 'Payment must be COMPLETED to accept this order' : 'Accept Order'}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {ord.status === 'ACCEPTED' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm transition-all flex items-center gap-1"
                                >
                                  <UtensilsCrossed className="w-3.5 h-3.5" /> Start Preparing
                                </button>
                              )}
                              {ord.status === 'PREPARING' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'DISPATCH')}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Dispatch Order
                                </button>
                              )}
                              {ord.status === 'DISPATCH' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Mark Delivered
                                </button>
                              )}
                              {ord.status === 'DELIVERED' && (
                                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                                  <Check className="w-4 h-4 stroke-[3]" /> Completed
                                </span>
                              )}
                              {ord.status === 'CANCELLED' && (
                                <span className="text-xs font-extrabold text-rose-500 flex items-center gap-1">
                                  <X className="w-4 h-4 stroke-[3]" /> Cancelled
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              className="p-2 text-slate-400 hover:text-[#3f7d40] hover:bg-[#f2f6ee] dark:hover:bg-slate-800 rounded-xl transition-all inline-block"
                              title="View Invoice"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isExpanded && (
                          <tr className="bg-[#fcfdfa]/80 dark:bg-slate-800/10">
                            <td colSpan="8" className="py-5 px-8">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Items list */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#3f7d40]" /> Ordered Items
                                  </h4>
                                  <div className="space-y-2">
                                    {ord.items && ord.items.map((item) => (
                                      <div key={item.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex justify-between items-center text-xs">
                                        <div className="space-y-1 pr-4 max-w-[80%]">
                                          <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.name}</p>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                            <span>Protein: {item.protein}g</span>
                                            <span>•</span>
                                            <span>Calories: {item.calories} kcal</span>
                                          </div>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                          <p className="font-extrabold text-[#1c211d] dark:text-white">₹{item.price.toFixed(2)}</p>
                                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Address and Order Details */}
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-2">
                                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Delivery Address
                                    </h4>
                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                                      {ord.deliveryAddress || 'No delivery address provided.'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex-1 p-3 rounded-2xl bg-[#f2f6ee] dark:bg-slate-800/50 border border-[#e2edd7] dark:border-slate-700 text-center">
                                      <span className="text-[10px] text-[#3f7d40] block uppercase mb-0.5">Payment Method</span>
                                      <span className="text-[#1c4a2b] dark:text-slate-200">
                                        {ord.paymentMethod}
                                      </span>
                                    </div>
                                    <div className="flex-1 p-3 rounded-2xl bg-[#f2f6ee] dark:bg-slate-800/50 border border-[#e2edd7] dark:border-slate-700 text-center">
                                      <span className="text-[10px] text-[#3f7d40] block uppercase mb-0.5">Payment Status</span>
                                      <span className="text-[#1c4a2b] dark:text-slate-200">
                                        {ord.paymentStatus}
                                      </span>
                                    </div>
                                    {ord.user?.phone && (
                                      <div className="flex-1 p-3 rounded-2xl bg-[#f2f6ee] dark:bg-slate-800/50 border border-[#e2edd7] dark:border-slate-700 text-center">
                                        <span className="text-[10px] text-[#3f7d40] block uppercase mb-0.5">Contact Number</span>
                                        <span className="text-[#1c4a2b] dark:text-slate-200">{ord.user.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderInvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />
    </AdminLayout>
  );
}
