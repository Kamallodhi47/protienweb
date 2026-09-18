import React, { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { subscriptionsAPI, productsAPI } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  XOctagon, 
  Edit3, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Info,
  CalendarCheck,
  Truck
} from 'lucide-react';

export default function CustomerSubscriptionPage() {
  const { addToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);

  // Calendar States
  const [calendarMeals, setCalendarMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Tomorrow's Meal State
  const [tomorrowMeal, setTomorrowMeal] = useState(null);

  // Customization modal state
  const [showCustomiseModal, setShowCustomiseModal] = useState(false);
  const [customiseTargetMeal, setCustomiseTargetMeal] = useState(null);
  const [customForm, setCustomForm] = useState({
    selected_meal: '',
    selected_addons: 'None',
    removed_items: 'None',
    special_instruction: ''
  });

  // Action modals states
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseForm, setPauseForm] = useState({ pauseFrom: '', resumeOn: '', reason: '' });
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | calendar | history

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load products for customization dropdown
      const prodRes = await productsAPI.getAll();
      if (prodRes.success && prodRes.products) {
        // Filter out only available bowls or all active products
        setAvailableProducts(prodRes.products.filter(p => p.status === 'AVAILABLE'));
      }

      const res = await subscriptionsAPI.getMySubscriptions();
      if (res.success && res.subscriptions) {
        setSubscriptions(res.subscriptions);
        if (res.subscriptions.length > 0) {
          // Pre-select first active subscription or just the first subscription
          const active = res.subscriptions.find(s => s.status === 'ACTIVE' || s.status === 'PAUSED') || res.subscriptions[0];
          setActiveSub(active);
          
          // Load calendar for this sub
          const calRes = await subscriptionsAPI.getCalendar(active.id);
          if (calRes.success && calRes.calendar) {
            setCalendarMeals(calRes.calendar);
            
            // Find tomorrow's meal slot
            const tom = new Date();
            tom.setDate(tom.getDate() + 1);
            const tomStr = tom.toDateString();
            const tomorrowSlot = calRes.calendar.find(m => new Date(m.delivery_date).toDateString() === tomStr);
            setTomorrowMeal(tomorrowSlot || null);
          }
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to load subscription details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const selectSubscription = async (sub) => {
    setActiveSub(sub);
    setLoading(true);
    try {
      const calRes = await subscriptionsAPI.getCalendar(sub.id);
      if (calRes.success && calRes.calendar) {
        setCalendarMeals(calRes.calendar);
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        const tomStr = tom.toDateString();
        const tomorrowSlot = calRes.calendar.find(m => new Date(m.delivery_date).toDateString() === tomStr);
        setTomorrowMeal(tomorrowSlot || null);
      }
    } catch (err) {
      addToast('Failed to load meal calendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pause Action
  const handlePause = async () => {
    if (!pauseForm.pauseFrom || !pauseForm.resumeOn) {
      addToast('Please fill out both pause and resume dates.', 'error');
      return;
    }
    try {
      const res = await subscriptionsAPI.pause(activeSub.id, pauseForm);
      if (res.success) {
        addToast('Subscription successfully paused.', 'success');
        setShowPauseModal(false);
        setPauseForm({ pauseFrom: '', resumeOn: '', reason: '' });
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to pause subscription.', 'error');
    }
  };

  // Resume Action
  const handleResume = async () => {
    if (!window.confirm('Are you sure you want to resume your deliveries now?')) return;
    try {
      const res = await subscriptionsAPI.resume(activeSub.id);
      if (res.success) {
        addToast('Subscription successfully resumed!', 'success');
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to resume subscription.', 'error');
    }
  };

  // Cancel Action
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      addToast('Please enter a cancellation reason.', 'error');
      return;
    }
    try {
      const res = await subscriptionsAPI.cancel(activeSub.id, { reason: cancelReason });
      if (res.success) {
        addToast('Subscription successfully cancelled.', 'success');
        setShowCancelModal(false);
        setCancelReason('');
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel subscription.', 'error');
    }
  };

  // Meal Customization Cutoff Validation
  const checkCustomisationCutoff = (mealDateStr) => {
    const deliveryDate = new Date(mealDateStr);
    const prevDayCutoff = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate() - 1, 20, 0, 0, 0); // 8:00 PM previous day
    return new Date() > prevDayCutoff;
  };

  const openCustomiseModal = (meal) => {
    // Cutoff restriction removed as per user request
    setCustomiseTargetMeal(meal);
    setCustomForm({
      selected_meal: meal.meal_name,
      selected_addons: 'None',
      removed_items: 'None',
      special_instruction: meal.special_instruction || ''
    });
    setShowCustomiseModal(true);
  };

  const handleCustomiseSave = async () => {
    if (!customForm.selected_meal.trim()) {
      addToast('Please enter a custom meal bowl choice.', 'error');
      return;
    }
    try {
      const res = await subscriptionsAPI.customizeMeal(customiseTargetMeal.id, customForm);
      if (res.success) {
        addToast('Tomorrow\'s meal customized successfully!', 'success');
        setShowCustomiseModal(false);
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to customize meal.', 'error');
    }
  };

  // Calendar Helper Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Fill preceding empty slots
    const startOffset = firstDay.getDay();
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // Fill month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const changeMonth = (offset) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(nextMonth);
  };

  // Format Helpers
  const formatCompactDate = (dStr) => {
    return new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c4a2b]">Meal Subscription Dashboard</h1>
            <p className="text-xs text-[#5b6259]">Manage active plans, adjust pauses, and customize daily protein profiles.</p>
          </div>

          {/* Tab Pill Headers */}
          <div className="bg-[#f2f6ee] p-1 rounded-full border border-[#e5e3da] inline-flex items-center text-xs font-bold self-start">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#3f7d40] text-white' : 'text-[#5b6259]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === 'calendar' ? 'bg-[#3f7d40] text-white' : 'text-[#5b6259]'
              }`}
            >
              Meal Calendar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === 'history' ? 'bg-[#3f7d40] text-white' : 'text-[#5b6259]'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center font-bold text-[#5b6259]">Loading dashboard engine...</div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-12 text-center space-y-4">
            <CalendarCheck className="w-16 h-16 mx-auto text-emerald-800" />
            <h3 className="text-xl font-extrabold text-[#1c4a2b]">No Active Meal Plans Found</h3>
            <p className="text-xs text-[#5b6259] max-w-sm mx-auto">
              Automate your daily weighed high-protein meal deliveries with a monthly fitness plan.
            </p>
            <Link to="/subscription" className="btn btn-primary inline-flex justify-center text-xs font-bold">
              View Monthly Subscription Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Plan Switcher Header */}
            {subscriptions.length > 1 && (
              <div className="bg-white rounded-2xl border border-[#e5e3da] p-4 flex items-center gap-3">
                <span className="text-xs font-bold text-[#5b6259]">Active Subscriptions:</span>
                <div className="flex gap-2">
                  {subscriptions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => selectSubscription(s)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                        activeSub?.id === s.id
                          ? 'bg-[#3f7d40] text-white border-[#3f7d40]'
                          : 'bg-white text-[#5b6259] border-[#e5e3da] hover:border-[#3f7d40]'
                      }`}
                    >
                      {s.plan?.name} ({s.subscription_number})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Current Active Plan Status Card */}
                <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-start border-b border-[#e5e3da] pb-4">
                    <div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        activeSub?.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-[#2f6b3a]'
                          : activeSub?.status === 'PAUSED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {activeSub?.status}
                      </span>
                      <h3 className="font-extrabold text-xl text-[#1c4a2b] mt-2">{activeSub?.plan?.name}</h3>
                      <p className="text-[10px] text-[#5b6259] mt-0.5">Subscription Ref: {activeSub?.subscription_number}</p>
                    </div>
                    <div className="text-2xl font-extrabold text-[#3f7d40]">
                      ₹{activeSub?.plan?.monthly_price} <span className="text-xs text-[#5b6259] font-normal">/ month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-[#f2f6ee] rounded-xl">
                      <span className="text-[#5b6259] block text-[10px]">Start Date</span>
                      <span className="font-bold text-[#1c211d]">{formatCompactDate(activeSub?.start_date)}</span>
                    </div>
                    <div className="p-3 bg-[#f2f6ee] rounded-xl">
                      <span className="text-[#5b6259] block text-[10px]">End Date</span>
                      <span className="font-bold text-[#1c211d]">{formatCompactDate(activeSub?.end_date)}</span>
                    </div>
                    <div className="p-3 bg-[#f2f6ee] rounded-xl">
                      <span className="text-[#5b6259] block text-[10px]">Time Slot</span>
                      <span className="font-bold text-[#1c211d]">{activeSub?.delivery_time}</span>
                    </div>
                    <div className="p-3 bg-[#f2f6ee] rounded-xl">
                      <span className="text-[#5b6259] block text-[10px]">Next Billing</span>
                      <span className="font-bold text-[#1c211d]">{formatCompactDate(activeSub?.next_billing_date)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-[#e5e3da] text-xs">
                    {activeSub?.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setShowPauseModal(true)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <Pause className="w-4 h-4" /> Pause Subscription
                      </button>
                    )}
                    
                    {activeSub?.status === 'PAUSED' && (
                      <button
                        type="button"
                        onClick={handleResume}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-4 h-4" /> Resume Subscription
                      </button>
                    )}

                    {activeSub?.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2.5 border border-rose-600/30 text-rose-600 hover:bg-rose-50 font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <XOctagon className="w-4 h-4" /> Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>

                {/* Tomorrow's Meal Feature Box */}
                <div className="bg-[#fcfcfa] rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-[#e5e3da] pb-3">
                    <h4 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#3f7d40]" /> Tomorrow's Meal Details
                    </h4>
                    {tomorrowMeal && (
                      <button
                        onClick={() => openCustomiseModal(tomorrowMeal)}
                        className="text-xs font-bold text-[#3f7d40] hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Customize Tomorrow's Meal
                      </button>
                    )}
                  </div>

                  {tomorrowMeal ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-[#5b6259]">Meal Name</span>
                          <p className="font-extrabold text-sm text-[#1c4a2b]">{tomorrowMeal.meal_name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#5b6259]">Estimated Delivery Slot</span>
                          <p className="font-bold text-[#1c211d]">{tomorrowMeal.delivery_time}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-[#5b6259]">Protein Weight Target</span>
                          <p className="font-bold text-[#3f7d40]">{tomorrowMeal.protein_grams}g Protein</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#5b6259]">Delivery Address</span>
                          <p className="font-semibold text-[#1c211d] truncate" title={tomorrowMeal.address}>
                            {tomorrowMeal.address}
                          </p>
                        </div>
                      </div>

                      {tomorrowMeal.special_instruction && (
                        <div className="md:col-span-2 p-2.5 rounded-lg bg-white border border-[#e5e3da] text-[11px] text-[#5b6259]">
                          <strong>Instructions:</strong> {tomorrowMeal.special_instruction}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#5b6259] text-center py-4 bg-white rounded-xl">
                      No delivery scheduled for tomorrow (deliveries are paused, or subscription ended).
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: MEAL CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1c4a2b]">Weighed Meal Calendar</h3>
                    <p className="text-[10px] text-[#5b6259]">Check daily protein counts, states, and details.</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs font-bold text-[#1c4a2b]">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 border border-[#e5e3da] rounded-lg hover:bg-slate-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="min-w-28 text-center capitalize">
                      {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1.5 border border-[#e5e3da] rounded-lg hover:bg-slate-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {/* Days labels */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="font-bold text-[#5b6259] py-1 border-b border-[#e5e3da]">{d}</div>
                  ))}

                  {/* Date cells */}
                  {getDaysInMonth(currentMonth).map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="py-4"></div>;
                    
                    const dateStr = date.toDateString();
                    const dayNum = date.getDate();
                    
                    // Match calendar meals
                    const matchingMeal = calendarMeals.find(m => new Date(m.delivery_date).toDateString() === dateStr);
                    const isPast = date < new Date().setHours(0,0,0,0);

                    let cellBg = 'bg-white hover:bg-slate-50';
                    let statusBorder = 'border-[#e5e3da]';

                    if (matchingMeal) {
                      if (matchingMeal.status === 'DELIVERED') {
                        cellBg = 'bg-emerald-50 text-[#2f6b3a]';
                        statusBorder = 'border-emerald-500/40';
                      } else if (matchingMeal.status === 'SKIPPED') {
                        cellBg = 'bg-amber-50 text-amber-800';
                        statusBorder = 'border-amber-500/30';
                      } else if (matchingMeal.status === 'CANCELLED') {
                        cellBg = 'bg-rose-50 text-rose-700';
                        statusBorder = 'border-rose-300';
                      } else if (matchingMeal.status === 'UPCOMING') {
                        cellBg = 'bg-[#f2f6ee] text-[#1c4a2b]';
                        statusBorder = 'border-[#3f7d40]/30';
                      }
                    }

                    return (
                      <div
                        key={`date-${dayNum}`}
                        onClick={() => {
                          if (matchingMeal && matchingMeal.status === 'UPCOMING') {
                            openCustomiseModal(matchingMeal);
                          } else if (matchingMeal) {
                            setSelectedMeal(matchingMeal);
                          }
                        }}
                        className={`p-2 rounded-xl border ${statusBorder} ${cellBg} transition-all cursor-pointer flex flex-col justify-between items-center min-h-[70px] group`}
                      >
                        <span className="font-bold text-[10px] self-start">{dayNum}</span>
                        {matchingMeal ? (
                          <div className="w-full text-center mt-1">
                            <p className="text-[9px] font-extrabold truncate max-w-full leading-tight">{matchingMeal.meal_name}</p>
                            <span className="text-[8px] font-semibold opacity-80 block">{matchingMeal.status}</span>
                            {matchingMeal.status === 'UPCOMING' && (
                              <div className="mt-1 bg-white/60 rounded px-1 py-0.5 inline-flex items-center gap-1 text-[8px] font-bold text-[#3f7d40]">
                                <Edit3 className="w-2.5 h-2.5" /> Customize
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[8px] text-[#b3b0a2]">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SUBSCRIPTION HISTORY */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-[#1c4a2b]">Transaction &amp; Renewal History</h3>
                
                {calendarMeals.length > 0 ? (
                  <div className="space-y-3">
                    {/* We'll list historical status info */}
                    <div className="p-4 rounded-xl bg-[#f2f6ee] border text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#1c4a2b]">{activeSub?.plan?.name}</p>
                        <span className="text-[10px] text-[#5b6259]">Payment ID: verified via Secure SSL Gateway</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#3f7d40] block">₹{activeSub?.plan?.monthly_price}</span>
                        <span className="text-[10px] text-[#2f6b3a] font-bold">SUCCESS</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#5b6259] leading-relaxed p-2">
                      * Deliveries are fulfilled daily matching selected slots. Historical order receipts can be requested via whatsapp support setting.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5b6259] text-center py-6">No historical transaction logs found.</p>
                )}
              </div>
            )}

            {/* Delivery Information Card - Moved below main section */}
            <div className="bg-white rounded-[22px] border border-[#e5e3da] p-6 shadow-sm space-y-4 mt-6">
              <h4 className="font-extrabold text-sm text-[#1c4a2b] border-b border-[#e5e3da] pb-3">Delivery Information</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#5b6259] block text-[10px]">Active Destination Address</span>
                  <p className="font-bold text-[#1c211d] leading-snug">{activeSub?.delivery_address}</p>
                </div>
                <div>
                  <span className="text-[#5b6259] block text-[10px]">Expected Slot Range</span>
                  <p className="font-bold text-[#1c211d]">{activeSub?.delivery_time}</p>
                </div>
                <div>
                  <span className="text-[#5b6259] block text-[10px]">Renewal Method</span>
                  <p className="font-bold text-[#1c211d]">{activeSub?.auto_renew ? 'Automatic Billing Cycle' : 'Manual Billing'}</p>
                </div>
              </div>

              <div className="border-t border-[#e5e3da] pt-3 text-[10px] text-[#5b6259] leading-snug flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#3f7d40] shrink-0" />
                Address or slot modifications can be adjusted by the administrator on special request.
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal: Customize Meal */}
      {showCustomiseModal && customiseTargetMeal && (
        <div className="fixed inset-0 bg-[#1c211d]/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-6 max-w-md w-full space-y-5">
            <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-3">
              Customize Meal Box ({formatCompactDate(customiseTargetMeal.delivery_date)})
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Select Alternative Bowl</label>
                <select
                  value={customForm.selected_meal}
                  onChange={(e) => setCustomForm({ ...customForm, selected_meal: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                >
                  <option value={customForm.selected_meal} disabled>{customForm.selected_meal}</option>
                  {availableProducts && availableProducts.filter(p => p.category === 'PRESET' || p.category === 'BOWLS' || p.isPreset).map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} {p.protein ? `(${p.protein}g protein)` : ''}
                    </option>
                  ))}
                  {/* Fallback hardcoded if no products loaded yet */}
                  {availableProducts.length === 0 && (
                    <>
                      <option value="High Protein Paneer Bowl">High Protein Paneer Bowl (42g protein)</option>
                      <option value="Double Protein Paneer & Sprouts Bowl">Double Protein Paneer & Sprouts Bowl (65g protein)</option>
                      <option value="Quinoa Salad Bowl">Quinoa Salad Bowl (38g protein)</option>
                      <option value="Green Chickpea Protein Bowl">Green Chickpea Protein Bowl (40g protein)</option>
                      <option value="Titan Sprouts & Broccoli Bowl">Titan Sprouts & Broccoli Bowl (64g protein)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Add Allowed Addons</label>
                <select
                  value={customForm.selected_addons}
                  onChange={(e) => setCustomForm({ ...customForm, selected_addons: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                >
                  <option value="None">None</option>
                  <option value="Immunity Shot">1 Immunity Shot (Beetroot/Amla)</option>
                  <option value="Whey Smoothie">1 Whey Isolate Smoothie (+₹50)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Remove Ingredients</label>
                <input
                  type="text"
                  placeholder="e.g. No onions, no peanuts"
                  value={customForm.removed_items}
                  onChange={(e) => setCustomForm({ ...customForm, removed_items: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Special Chef Note</label>
                <textarea
                  rows={2}
                  placeholder="Any preparation request..."
                  value={customForm.special_instruction}
                  onChange={(e) => setCustomForm({ ...customForm, special_instruction: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={handleCustomiseSave}
                className="flex-1 py-2.5 bg-[#3f7d40] text-white rounded-xl"
              >
                Save Custom Setup
              </button>
              <button
                type="button"
                onClick={() => setShowCustomiseModal(false)}
                className="flex-1 py-2.5 border text-[#5b6259] rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pause Subscription */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-[#1c211d]/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-2">Pause Plan Schedule</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Pause From *</label>
                <input
                  type="date"
                  value={pauseForm.pauseFrom}
                  onChange={(e) => setPauseForm({ ...pauseForm, pauseFrom: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Resume On *</label>
                <input
                  type="date"
                  value={pauseForm.resumeOn}
                  onChange={(e) => setPauseForm({ ...pauseForm, resumeOn: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Reason for Pause</label>
                <input
                  type="text"
                  placeholder="e.g. Traveling"
                  value={pauseForm.reason}
                  onChange={(e) => setPauseForm({ ...pauseForm, reason: e.target.value })}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={handlePause}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl"
              >
                Confirm Pause
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseForm({ pauseFrom: '', resumeOn: '', reason: '' });
                }}
                className="flex-1 py-2.5 border text-[#5b6259] rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancel Subscription */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-[#1c211d]/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-base text-[#1c4a2b] border-b pb-2 text-rose-600">Cancel Subscription</h3>
            <p className="text-xs text-[#5b6259] leading-relaxed">
              We are sorry to see you go! All upcoming meals will be cancelled. Past transaction records and delivery histories will be preserved.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#5b6259] block mb-1">Please tell us why you are cancelling *</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Feedback helps us improve..."
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#3f7d40]"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl"
              >
                Confirm Cancellation
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 py-2.5 border text-[#5b6259] rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Calendar Meal Details */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-[#1c211d]/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <span className="text-[9px] font-bold text-[#3f7d40] uppercase">Meal Slot Date</span>
                <h4 className="font-extrabold text-base text-[#1c4a2b]">{formatCompactDate(selectedMeal.delivery_date)}</h4>
              </div>
              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                selectedMeal.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-[#2f6b3a]'
                  : selectedMeal.status === 'SKIPPED'
                  ? 'bg-amber-100 text-amber-800'
                  : selectedMeal.status === 'CANCELLED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedMeal.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#5b6259] block text-[10px]">Meal Item</span>
                <p className="font-bold text-[#1c211d]">{selectedMeal.meal_name}</p>
              </div>

              <div>
                <span className="text-[#5b6259] block text-[10px]">Protein Profile</span>
                <p className="font-bold text-[#3f7d40]">{selectedMeal.protein_grams}g Protein Target</p>
              </div>

              <div>
                <span className="text-[#5b6259] block text-[10px]">Delivery Slot</span>
                <p className="font-bold text-[#1c211d]">{selectedMeal.delivery_time}</p>
              </div>

              <div>
                <span className="text-[#5b6259] block text-[10px]">Destination Address</span>
                <p className="font-semibold text-[#1c211d] leading-snug">{selectedMeal.address}</p>
              </div>

              {selectedMeal.special_instruction && (
                <div>
                  <span className="text-[#5b6259] block text-[10px]">Chef Instructions</span>
                  <p className="p-2.5 bg-slate-50 border rounded-lg text-[10px] text-[#5b6259] leading-snug italic">
                    "{selectedMeal.special_instruction}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center flex gap-2">
              {selectedMeal.status === 'UPCOMING' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMeal(null);
                    openCustomiseModal(selectedMeal);
                  }}
                  className="flex-1 py-2 bg-[#3f7d40] hover:bg-[#2f6b3a] text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Customize
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedMeal(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-[#5b6259] font-bold text-xs rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </CustomerLayout>
  );
}
