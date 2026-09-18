import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { ingredientsAPI, adminAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Package, RefreshCw, AlertTriangle, Plus, History } from 'lucide-react';

export default function AdminInventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refillModalItem, setRefillModalItem] = useState(null);
  const [refillQty, setRefillQty] = useState(50);
  const [refillNote, setRefillNote] = useState('Fresh stock received');

  const { addToast } = useToast();

  const loadData = () => {
    ingredientsAPI.getAll().then((res) => {
      if (res.success) setIngredients(res.ingredients);
    });
    adminAPI.getInventoryLogs().then((res) => {
      if (res.success) setLogs(res.logs);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefillSubmit = async (e) => {
    e.preventDefault();
    if (!refillModalItem) return;
    try {
      const res = await ingredientsAPI.refill({
        ingredientId: refillModalItem.id,
        quantity: refillQty,
        note: refillNote
      });
      if (res.success) {
        addToast(res.message, 'success');
        setRefillModalItem(null);
        loadData();
      }
    } catch (err) {
      addToast(err.message || 'Refill failed.', 'error');
    }
  };

  const lowStockItems = ingredients.filter((i) => i.stock < 20 || i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Inventory Control & Stock Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor stock levels, issue instant refills, and inspect automated audit history.</p>
        </div>

        {/* Low Stock Banner */}
        {lowStockItems.length > 0 && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h4 className="font-bold text-base text-rose-500">Low Stock Alert</h4>
                <p className="text-xs text-rose-400 font-medium">
                  {lowStockItems.length} ingredients require immediate stock replenishment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stock Roster */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" /> Stock Quantity Control
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ing) => (
              <div key={ing.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm dark:text-white">{ing.name}</h4>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Stock: {ing.stock} units</div>
                  <div className="mt-1"><Badge status={ing.status} /></div>
                </div>
                <button
                  onClick={() => setRefillModalItem(ing)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refill
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stock History Audit Log Table */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-500" /> Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-4 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-xs"><Badge status={log.actionType} /></td>
                    <td className="py-3 px-4 font-black dark:text-white">+{log.quantity}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{log.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refill Modal */}
      <Modal isOpen={Boolean(refillModalItem)} onClose={() => setRefillModalItem(null)} title={`Refill Stock - ${refillModalItem?.name}`}>
        <form onSubmit={handleRefillSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Refill Quantity Units</label>
            <input
              type="number"
              required
              min="1"
              value={refillQty}
              onChange={(e) => setRefillQty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Refill Note / Vendor Batch</label>
            <input
              type="text"
              value={refillNote}
              onChange={(e) => setRefillNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
            />
          </div>
          <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 mt-4">
            Confirm Stock Refill
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
