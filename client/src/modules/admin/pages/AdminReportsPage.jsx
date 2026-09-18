import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminAPI } from '../../../services/api';
import { FileText, Download, Printer } from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('REVENUE');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    adminAPI.getReports(reportType).then((res) => {
      if (res.success) setReportData(res.report);
    });
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const keys = Object.keys(reportData[0]);
    const csvRows = [
      keys.join(','),
      ...reportData.map(row => keys.map(k => `"${row[k] !== undefined ? row[k] : ''}"`).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase()}_report_${Date.now()}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white">Business Analytics & Reports Export</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export official Revenue, Orders, Inventory, and Subscription reports.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="flex flex-wrap gap-3">
          {['REVENUE', 'ORDERS', 'INVENTORY', 'SUBSCRIPTION'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                reportType === type
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>

        {/* Report Table */}
        <div id="printable-report" className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="py-3 px-4">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {Object.keys(row).map((key) => (
                      <td key={key} className="py-4 px-4 font-semibold text-xs dark:text-slate-200">
                        {String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
