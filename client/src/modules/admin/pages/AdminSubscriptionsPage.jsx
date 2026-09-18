import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { subscriptionsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { 
  Users, 
  Calendar, 
  Truck, 
  TrendingUp, 
  Search, 
  Settings, 
  Edit, 
  Trash, 
  Utensils, 
  CheckSquare, 
  Clock, 
  MapPin, 
  FileText 
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const { addToast } = useToast();
  
  // Data States
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('subscriptions'); // subscriptions | calendar | kitchen | delivery | plans

  // Subscriptions Tab Filtering & Search
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('ALL');
  
  // Selected Subscription Details Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');

  // Plan Form State (Create / Edit)
  const [planForm, setPlanForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    target_protein: '',
    monthly_price: '',
    badge: 'MOST POPULAR',
    billing_cycle: 'MONTHLY'
  });
  const [editingPlanMode, setEditingPlanMode] = useState(false);

  // Meal Calendar Filters
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMeals, setCalendarMeals] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'kitchen' || activeTab === 'delivery') {
      loadCalendarMeals();
    }
  }, [activeTab, calendarDate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const subRes = await subscriptionsAPI.getAllAdmin();
      if (subRes.success && subRes.subscriptions) {
        setSubscriptions(subRes.subscriptions);
      }

      const planRes = await subscriptionsAPI.getPlans();
      if (planRes.success && planRes.plans) {
        setPlans(planRes.plans);
      }
    } catch (err) {
      addToast(err.message || 'Error fetching admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarMeals = async () => {
    try {
      const mealRes = await subscriptionsAPI.getAdminMeals({ date: calendarDate });
      if (mealRes.success && mealRes.meals) {
        setCalendarMeals(mealRes.meals);
      }
    } catch (err) {
      addToast('Error loading scheduled meals.', 'error');
    }
  };

  // Subscription Actions
  const handleUpdateSub = async () => {
    try {
      const res = await subscriptionsAPI.updateAdminSubscription(selectedSub.id, {
        delivery_address: editAddress,
        delivery_time: editTimeSlot
      });
      if (res.success) {
        addToast('Subscription delivery configuration updated successfully!', 'success');
        setSelectedSub(null);
        loadAllData();
      }
    } catch (err) {
      addToast(err.message || 'Update failed.', 'error');
    }
  };

  const handleAdminPause = async (subId) => {
    if (!window.confirm('Pause this subscription for tomorrow?')) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + 7); // Default 7 days pause
    
    try {
      const res = await subscriptionsAPI.pause(subId, {
        pauseFrom: tomorrow.toISOString().split('T')[0],
        resumeOn: resumeDate.toISOString().split('T')[0],
        reason: 'Admin manual pause'
      });
      if (res.success) {
        addToast('Subscription paused by admin.', 'success');
        loadAllData();
      }
    } catch (err) {
      addToast(err.message || 'Pause failed.', 'error');
    }
  };

  const handleAdminResume = async (subId) => {
    try {
      const res = await subscriptionsAPI.resume(subId);
      if (res.success) {
        addToast('Subscription resumed by admin.', 'success');
        loadAllData();
      }
    } catch (err) {
      addToast(err.message || 'Resume failed.', 'error');
    }
  };

  const handleAdminCancel = async (subId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      const res = await subscriptionsAPI.cancel(subId, { reason: 'Admin cancelled' });
      if (res.success) {
        addToast('Subscription cancelled successfully.', 'success');
        loadAllData();
      }
    } catch (err) {
      addToast(err.message || 'Cancellation failed.', 'error');
    }
  };

  // Plans CRUD Actions
  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.name || !planForm.slug || !planForm.monthly_price) {
      addToast('Name, Slug, and Price are required.', 'error');
      return;
    }

    try {
      if (editingPlanMode) {
        const res = await subscriptionsAPI.updatePlan(planForm.id, planForm);
        if (res.success) {
          addToast('Plan updated successfully!', 'success');
          loadAllData();
          resetPlanForm();
        }
      } else {
        const res = await subscriptionsAPI.createPlan(planForm);
        if (res.success) {
          addToast('Plan created successfully!', 'success');
          loadAllData();
          resetPlanForm();
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save plan.', 'error');
    }
  };

  const handleEditPlanClick = (plan) => {
    setPlanForm({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      target_protein: plan.target_protein || '',
      monthly_price: plan.monthly_price,
      badge: plan.badge || 'MOST POPULAR',
      billing_cycle: plan.billing_cycle || 'MONTHLY'
    });
    setEditingPlanMode(true);
    setActiveTab('plans');
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to deactivate this plan?')) return;
    try {
      const res = await subscriptionsAPI.deletePlan(planId);
      if (res.success) {
        addToast('Plan deactivated successfully.', 'success');
        loadAllData();
      }
    } catch (err) {
      addToast('Deactivation failed.', 'error');
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      id: '',
      name: '',
      slug: '',
      description: '',
      target_protein: '',
      monthly_price: '',
      badge: 'MOST POPULAR',
      billing_cycle: 'MONTHLY'
    });
    setEditingPlanMode(false);
  };

  // Meal Calendar status toggle
  const handleMealStatusChange = async (mealId, newStatus) => {
    try {
      const res = await subscriptionsAPI.updateMealStatus(mealId, newStatus);
      if (res.success) {
        addToast(`Meal status updated to ${newStatus}!`, 'success');
        loadCalendarMeals();
      }
    } catch (err) {
      addToast('Failed to update meal status.', 'error');
    }
  };

  // Filtering calculations
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.subscription_number.toLowerCase().includes(subSearch.toLowerCase()) ||
      (sub.user?.name && sub.user.name.toLowerCase().includes(subSearch.toLowerCase())) ||
      (sub.user?.email && sub.user.email.toLowerCase().includes(subSearch.toLowerCase()));
    
    const matchesStatus = subStatusFilter === 'ALL' || sub.status === subStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Statistics calculations
  const totalSubCount = subscriptions.length;
  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const pausedCount = subscriptions.filter(s => s.status === 'PAUSED').length;
  const cancelledCount = subscriptions.filter(s => s.status === 'CANCELLED').length;
  
  const estimatedRevenue = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.plan?.monthly_price || 0), 0);

  // Daily Kitchen calculations
  const leanMealsToday = calendarMeals.filter(m => m.subscription?.planId === 'plan-lean').length;
  const beastMealsToday = calendarMeals.filter(m => m.subscription?.planId === 'plan-beast').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black dark:text-white">Meal Subscriptions Operations</h1>
            <p className="text-sm text-[#5b6259]">System-wide control dashboard for plans, schedules, kitchen, and payment gateway status.</p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#f2f6ee] p-1 rounded-full border border-[#e5e3da] text-xs font-bold self-start">
            {[
              { id: 'subscriptions', label: 'Subscriptions Log' },
              { id: 'calendar', label: 'Meal Calendar' },
              { id: 'kitchen', label: 'Daily Kitchen View' },
              { id: 'delivery', label: 'Delivery Manager' },
              { id: 'plans', label: 'Plans Management' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeTab === tab.id ? 'bg-[#3f7d40] text-white' : 'text-[#5b6259]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && activeTab === 'subscriptions' ? (
          <div className="py-20 text-center font-bold text-[#5b6259]">Loading operations logs...</div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI OVERVIEW (Shown on Subscriptions Log) */}
            {activeTab === 'subscriptions' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#e5e3da] shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#5b6259]">Total Subscriptions</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-2xl font-extrabold text-[#1c4a2b]">{totalSubCount}</span>
                    <Users className="w-5 h-5 text-[#3f7d40] opacity-40" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#e5e3da] shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#5b6259]">Active Plans</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-2xl font-extrabold text-[#3f7d40]">{activeCount}</span>
                    <Calendar className="w-5 h-5 text-emerald-600 opacity-40" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#e5e3da] shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#5b6259]">Paused Plans</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-2xl font-extrabold text-amber-600">{pausedCount}</span>
                    <Clock className="w-5 h-5 text-amber-500 opacity-40" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#e5e3da] shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#5b6259]">Cancelled Plans</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-2xl font-extrabold text-rose-600">{cancelledCount}</span>
                    <Clock className="w-5 h-5 text-rose-500 opacity-40" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#e5e3da] shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-[#5b6259]">Monthly Revenue</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xl font-extrabold text-[#1c4a2b]">₹{estimatedRevenue}</span>
                    <TrendingUp className="w-5 h-5 text-emerald-800 opacity-40" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: SUBSCRIPTIONS LOG */}
            {activeTab === 'subscriptions' && (
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b6259]" />
                    <input
                      type="text"
                      placeholder="Search sub number, customer name..."
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fcfcfa] border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center text-xs font-bold text-[#5b6259]">
                    <span>Status Filter:</span>
                    <select
                      value={subStatusFilter}
                      onChange={(e) => setSubStatusFilter(e.target.value)}
                      className="p-2 border rounded-lg focus:outline-none focus:border-[#3f7d40] bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e5e3da] text-[10px] font-bold text-[#5b6259] uppercase tracking-wider">
                        <th className="py-3 px-4">Sub Number</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">Plan & Amount</th>
                        <th className="py-3 px-4">Schedule Range</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3da]">
                      {filteredSubs.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-bold text-[#1c4a2b]">{sub.subscription_number}</td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#1c211d]">{sub.user?.name || 'N/A'}</div>
                            <div className="text-[10px] text-[#5b6259]">{sub.user?.phone || sub.user?.email || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#1c4a2b]">
                            <div>{sub.plan?.name || sub.planId}</div>
                            <span className="text-[10px] text-[#3f7d40]">₹{sub.plan?.monthly_price || sub.price}</span>
                          </td>
                          <td className="py-4 px-4 text-[#5b6259]">
                            {new Date(sub.start_date).toLocaleDateString('en-IN')} - {new Date(sub.end_date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-[#2f6b3a]'
                                : sub.status === 'PAUSED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSub(sub);
                                setEditAddress(sub.delivery_address);
                                setEditTimeSlot(sub.delivery_time);
                              }}
                              className="px-2 py-1 text-[10px] font-bold border border-[#e5e3da] text-[#5b6259] rounded-lg hover:border-[#3f7d40]"
                            >
                              Config
                            </button>
                            {sub.status === 'ACTIVE' ? (
                              <button onClick={() => handleAdminPause(sub.id)} className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-white rounded-lg">Pause</button>
                            ) : sub.status === 'PAUSED' ? (
                              <button onClick={() => handleAdminResume(sub.id)} className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-lg">Resume</button>
                            ) : null}
                            {sub.status !== 'CANCELLED' && (
                              <button onClick={() => handleAdminCancel(sub.id)} className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded-lg">Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MEAL CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1c4a2b]">Oversight Calendar</h3>
                    <p className="text-[10px] text-[#5b6259]">Deliveries schedule list for selected day.</p>
                  </div>
                  <input
                    type="date"
                    value={calendarDate}
                    onChange={(e) => setCalendarDate(e.target.value)}
                    className="p-2 border rounded-xl focus:outline-none focus:border-[#3f7d40] text-xs font-semibold"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e5e3da] text-[10px] font-bold text-[#5b6259] uppercase tracking-wider">
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Plan & Meal Box</th>
                        <th className="py-3 px-4">Delivery Slot & Address</th>
                        <th className="py-3 px-4">State</th>
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3da]">
                      {calendarMeals.map((meal) => (
                        <tr key={meal.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1c211d]">{meal.user?.name}</div>
                            <div className="text-[10px] text-[#5b6259]">{meal.user?.phone}</div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#1c4a2b]">
                            <div>{meal.subscription?.plan?.name}</div>
                            <div className="text-[10px] text-[#3f7d40] font-semibold">{meal.meal_name} ({meal.protein_grams}g Pro)</div>
                          </td>
                          <td className="py-4 px-4 text-[#5b6259]">
                            <div className="font-semibold text-[#1c211d] flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#3f7d40]" /> {meal.delivery_time}</div>
                            <div className="text-[10px] truncate max-w-sm mt-0.5" title={meal.address}><MapPin className="w-3.5 h-3.5 text-[#3f7d40] inline mr-0.5" /> {meal.address}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                              meal.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-[#2f6b3a]'
                                : meal.status === 'SKIPPED'
                                ? 'bg-amber-100 text-amber-800'
                                : meal.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {meal.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <select
                              value={meal.status}
                              onChange={(e) => handleMealStatusChange(meal.id, e.target.value)}
                              className="p-1 border rounded-lg text-[10px] font-bold text-[#5b6259] bg-white focus:outline-none focus:border-[#3f7d40]"
                            >
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="SKIPPED">SKIPPED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DAILY KITCHEN VIEW */}
            {activeTab === 'kitchen' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* aggregates summary */}
                <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-3 flex items-center gap-1.5">
                    <Utensils className="w-5 h-5 text-[#3f7d40]" /> Today's Kitchen Summary
                  </h3>
                  
                  <div className="space-y-3.5 text-xs text-[#5b6259]">
                    <div className="flex justify-between items-center p-3 bg-[#f2f6ee] rounded-xl text-[#1c4a2b] font-bold">
                      <span>Total Bowl Prep Slots Required</span>
                      <span className="text-lg">{calendarMeals.length}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Lean Muscle Bowl</span>
                        <span className="font-bold text-[#1c211d]">{leanMealsToday} Box</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Athlete Beast Bowl</span>
                        <span className="font-bold text-[#1c211d]">{beastMealsToday} Box</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* detailed instructions list */}
                <div className="lg:col-span-2 bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-[#1c4a2b]">Specific Preparation Instructions</h3>
                  
                  <div className="space-y-3">
                    {calendarMeals.filter(m => m.special_instruction).length > 0 ? (
                      calendarMeals.filter(m => m.special_instruction).map(meal => (
                        <div key={meal.id} className="p-3 bg-[#fdf1de] border border-[#e8a33d]/30 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-[#1c4a2b]">
                            <span>{meal.user?.name} ({meal.subscription?.subscription_number})</span>
                            <span className="text-[10px] text-[#e8a33d]">{meal.meal_name}</span>
                          </div>
                          <p className="text-[11px] text-[#5b6259]">
                            <strong>Chef instruction:</strong> "{meal.special_instruction}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#5b6259] text-center py-6">No custom preparation requests for today's deliveries.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: DELIVERY MANAGER */}
            {activeTab === 'delivery' && (
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="font-extrabold text-base text-[#1c4a2b]">Delivery Manager</h3>
                  <input
                    type="date"
                    value={calendarDate}
                    onChange={(e) => setCalendarDate(e.target.value)}
                    className="p-2 border rounded-xl focus:outline-none focus:border-[#3f7d40] text-xs font-semibold"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#e5e3da] text-[10px] font-bold text-[#5b6259] uppercase tracking-wider">
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Delivery address</th>
                        <th className="py-3 px-4">Time range</th>
                        <th className="py-3 px-4">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3da]">
                      {calendarMeals.map((meal) => (
                        <tr key={meal.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-bold text-[#1c211d]">{meal.user?.name}</td>
                          <td className="py-4 px-4 font-semibold text-[#5b6259]">{meal.user?.phone || 'N/A'}</td>
                          <td className="py-4 px-4 text-[10px] text-[#5b6259] max-w-sm truncate" title={meal.address}>{meal.address}</td>
                          <td className="py-4 px-4 font-bold text-[#1c4a2b]">{meal.delivery_time}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold text-[8px] ${
                              meal.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-[#2f6b3a]'
                                : meal.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {meal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: PLANS MANAGEMENT */}
            {activeTab === 'plans' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Form to Create/Edit Plan */}
                <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-3">
                    {editingPlanMode ? 'Edit Plan Structure' : 'Create Subscription Plan'}
                  </h3>

                  <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Plan Name *</label>
                      <input
                        type="text"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        placeholder="e.g. Lean Muscle Plan"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Slug *</label>
                      <input
                        type="text"
                        value={planForm.slug}
                        onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                        placeholder="e.g. lean-muscle-plan"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Description (Features, comma separated) *</label>
                      <textarea
                        rows={3}
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        placeholder="e.g. Weighed Bowl, 1 Cold Pressed Juice, Free Delivery"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Target Protein (Daily) *</label>
                      <input
                        type="text"
                        value={planForm.target_protein}
                        onChange={(e) => setPlanForm({ ...planForm, target_protein: e.target.value })}
                        placeholder="e.g. 35g - 45g"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Monthly Price *</label>
                      <input
                        type="number"
                        value={planForm.monthly_price}
                        onChange={(e) => setPlanForm({ ...planForm, monthly_price: e.target.value })}
                        placeholder="e.g. 4999"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Card Badge</label>
                      <input
                        type="text"
                        value={planForm.badge}
                        onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                        placeholder="e.g. MOST POPULAR"
                        className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                      />
                    </div>

                    <div className="flex gap-2 font-bold pt-2">
                      <button type="submit" className="flex-1 py-2.5 bg-[#3f7d40] text-white rounded-xl">
                        Save Plan
                      </button>
                      {editingPlanMode && (
                        <button type="button" onClick={resetPlanForm} className="flex-1 py-2.5 border text-[#5b6259] rounded-xl">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List of current Plans */}
                <div className="lg:col-span-2 bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-[#1c4a2b]">Active Plans List</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#e5e3da] text-[10px] font-bold text-[#5b6259] uppercase tracking-wider">
                          <th className="py-3 px-4">Plan Info</th>
                          <th className="py-3 px-4">Macros</th>
                          <th className="py-3 px-4">Pricing</th>
                          <th className="py-3 px-4 text-right">Oversight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e3da]">
                        {plans.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-4 font-bold text-[#1c4a2b]">
                              <div>{p.name}</div>
                              <span className="text-[10px] font-semibold text-[#5b6259] block max-w-xs truncate">{p.description}</span>
                            </td>
                            <td className="py-4 px-4 text-[#5b6259]">{p.target_protein} Target</td>
                            <td className="py-4 px-4 font-extrabold text-[#3f7d40]">₹{p.monthly_price}</td>
                            <td className="py-4 px-4 text-right space-x-1.5">
                              <button onClick={() => handleEditPlanClick(p)} className="text-[#3f7d40] hover:underline font-bold">Edit</button>
                              <span>|</span>
                              <button onClick={() => handleDeletePlan(p.id)} className="text-rose-600 hover:underline font-bold">Deactivate</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* Modal: Selected Subscription Config Details */}
      {selectedSub && (
        <div className="fixed inset-0 bg-[#1c211d]/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-6 max-w-md w-full space-y-4">
            <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-2">
              Edit Subscription Config ({selectedSub.subscription_number})
            </h3>

            <div className="space-y-3.5 text-xs text-[#5b6259]">
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Destination Delivery Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40] text-[#1c211d] font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Expected Delivery Slot Range</label>
                <select
                  value={editTimeSlot}
                  onChange={(e) => setEditTimeSlot(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white focus:outline-none focus:border-[#3f7d40] text-[#1c211d] font-semibold"
                >
                  <option value="08:00 AM - 08:30 AM">08:00 AM - 08:30 AM</option>
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                  <option value="12:30 PM - 01:00 PM">12:30 PM - 01:00 PM</option>
                  <option value="08:00 PM - 08:30 PM">08:00 PM - 08:30 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={handleUpdateSub}
                className="flex-1 py-2.5 bg-[#3f7d40] text-white rounded-xl"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="flex-1 py-2.5 border text-[#5b6259] rounded-xl hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
