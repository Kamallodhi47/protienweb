import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { subscriptionsAPI, customerAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Calendar, Clock, MapPin, ShieldCheck, CreditCard, ChevronRight, User, AlertCircle } from 'lucide-react';

export default function SubscriptionCheckoutPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Query parameter parsing
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('planId');

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Form Fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    startDate: getTomorrowDateString(),
    deliveryTime: '08:00 AM - 08:30 AM',
    foodPreference: 'Veg',
    allergyInfo: '',
    specialInstructions: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulatedOrderInfo, setSimulatedOrderInfo] = useState(null);

  // Time Slots list
  const timeSlots = [
    '08:00 AM - 08:30 AM',
    '10:00 AM - 10:30 AM',
    '12:30 PM - 01:00 PM',
    '08:00 PM - 08:30 PM'
  ];

  useEffect(() => {
    if (!planId) {
      addToast('No subscription plan selected.', 'error');
      navigate('/subscription');
      return;
    }

    // Load Plan Info
    subscriptionsAPI.getPlans()
      .then(res => {
        if (res.success && res.plans) {
          const found = res.plans.find(p => p.id === planId);
          if (found) {
            setPlan(found);
          } else {
            addToast('Selected plan could not be found.', 'error');
            navigate('/subscription');
          }
        }
      })
      .catch(() => addToast('Error fetching plan details.', 'error'))
      .finally(() => setLoadingPlan(false));

    // Load User Addresses
    fetchAddresses();

    // Dynamically load Razorpay SDK script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [planId]);

  const fetchAddresses = () => {
    customerAPI.getAddresses()
      .then(res => {
        if (res.success && res.addresses) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (res.addresses.length > 0) {
            setSelectedAddressId(res.addresses[0].id);
          }
        }
      })
      .catch(() => {});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const saveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      addToast('Please fill out all address fields.', 'error');
      return;
    }
    try {
      const res = await customerAPI.addAddress(newAddress);
      if (res.success && res.address) {
        addToast('Address added successfully!', 'success');
        setAddresses(prev => [...prev, res.address]);
        setSelectedAddressId(res.address.id);
        setShowNewAddressForm(false);
        setNewAddress({ street: '', city: '', state: '', zipCode: '', isDefault: false });
      }
    } catch (err) {
      addToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const validateForm = (addrId = selectedAddressId) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.phone.trim()) errors.phone = 'Mobile number is required.';
    if (!/^\d{10}$/.test(formData.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) errors.email = 'Enter a valid email address.';
    if (!formData.startDate) errors.startDate = 'Subscription start date is required.';
    if (!addrId) errors.address = 'Please select or add a delivery address.';

    // Check that start date is in the future or today
    if (formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selDate = new Date(formData.startDate);
      if (selDate < today) {
        errors.startDate = 'Start date must be today or in the future.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    let currentAddressId = selectedAddressId;

    // Auto-save address if fields are filled and not yet saved
    if (showNewAddressForm && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
      try {
        const res = await customerAPI.addAddress(newAddress);
        if (res.success && res.address) {
          setAddresses(prev => [...prev, res.address]);
          currentAddressId = res.address.id;
          setSelectedAddressId(res.address.id);
          setShowNewAddressForm(false);
          setNewAddress({ street: '', city: '', state: '', zipCode: '', isDefault: false });
        }
      } catch (err) {
        addToast('Failed to auto-save address.', 'error');
        return;
      }
    }

    if (!validateForm(currentAddressId)) {
      addToast('Please resolve the errors in the form.', 'error');
      return;
    }

    setProcessingPayment(true);

    const activeAddress = addresses.find(a => a.id === currentAddressId) || 
      (addresses.length > 0 ? addresses[addresses.length - 1] : null);

    if (!activeAddress) {
      addToast('No active delivery address found.', 'error');
      setProcessingPayment(false);
      return;
    }

    const fullAddressString = `${activeAddress.street}, ${activeAddress.city}, ${activeAddress.state} - ${activeAddress.zipCode}`;

    try {
      // Create payment order
      const orderPayload = {
        planId: plan.id,
        deliveryAddress: fullAddressString,
        deliveryTime: formData.deliveryTime,
        start_date: formData.startDate,
        personalInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          foodPreference: formData.foodPreference,
          allergyInfo: formData.allergyInfo,
          specialInstructions: formData.specialInstructions
        }
      };

      const res = await subscriptionsAPI.createPaymentOrder(orderPayload);
      
      if (res.success) {
        try {
          const options = {
            key: 'rzp_live_SxTsXxsCDxopSS', // User's live key ID from CheckoutPage.jsx
            amount: Math.round(total * 100), // In paise
            currency: 'INR',
            name: 'Protein Project',
            description: `${plan.name} - Monthly Subscription`,
            image: 'https://cdn-icons-png.flaticon.com/512/3615/3615822.png',
            handler: async function (response) {
              try {
                const verifyRes = await subscriptionsAPI.verifyPayment({
                  subscriptionId: res.subscriptionId,
                  rzpPaymentId: response.razorpay_payment_id
                });

                if (verifyRes.success) {
                  addToast('Payment successful and subscription activated!', 'success');
                  navigate(`/subscription/success?subId=${res.subscriptionId}`);
                } else {
                  navigate(`/subscription/failure?subId=${res.subscriptionId}`);
                }
              } catch (err) {
                navigate(`/subscription/failure?subId=${res.subscriptionId}`);
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: '#3f7d40'
            },
            modal: {
              ondismiss: function () {
                setProcessingPayment(false);
                addToast('Payment cancelled by user.', 'info');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (razorPayError) {
          console.warn('Razorpay SDK modal error: ', razorPayError);
          setSimulatedOrderInfo(res);
          setShowSimulateModal(true);
        }
      } else {
        addToast(res.message || 'Failed to initialize payment order.', 'error');
        setProcessingPayment(false);
      }
    } catch (err) {
      addToast(err.message || 'Error executing checkout.', 'error');
      setProcessingPayment(false);
    }
  };

  const handleSimulatedPayment = async (success) => {
    setShowSimulateModal(false);
    if (success) {
      try {
        const verifyRes = await subscriptionsAPI.verifyPayment({
          subscriptionId: simulatedOrderInfo.subscriptionId,
          simulateSuccess: true
        });

        if (verifyRes.success) {
          addToast('Simulated payment successful!', 'success');
          navigate(`/subscription/success?subId=${simulatedOrderInfo.subscriptionId}`);
        } else {
          navigate(`/subscription/failure?subId=${simulatedOrderInfo.subscriptionId}`);
        }
      } catch (err) {
        navigate(`/subscription/failure?subId=${simulatedOrderInfo.subscriptionId}`);
      }
    } else {
      navigate(`/subscription/failure?subId=${simulatedOrderInfo.subscriptionId}`);
    }
    setProcessingPayment(false);
  };

  if (loadingPlan) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-[#5b6259]">
          Verifying plan structure...
        </div>
      </PublicLayout>
    );
  }

  // Calculating Checkout Summaries
  const subtotal = plan?.monthly_price || 0;
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const delivery = 0; // Free express delivery for subscribers
  const total = subtotal + gst + delivery;

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-[#1c4a2b] mb-2">Checkout Subscription</h1>
        <p className="text-xs text-[#5b6259] mb-8">Confirm details and activate your nutrition schedule.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-[#e5e3da] p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-2 border-b border-[#e5e3da] pb-3">
                <User className="w-4 h-4" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#5b6259] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    placeholder="Enter your name"
                  />
                  {validationErrors.name && <p className="text-rose-600 text-[10px] mt-1">{validationErrors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5b6259] block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    placeholder="10-digit mobile number"
                  />
                  {validationErrors.phone && <p className="text-rose-600 text-[10px] mt-1">{validationErrors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#5b6259] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    placeholder="Enter your email"
                  />
                  {validationErrors.email && <p className="text-rose-600 text-[10px] mt-1">{validationErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-[#e5e3da] p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-2 border-b border-[#e5e3da] pb-3">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setValidationErrors(prev => ({ ...prev, address: '' }));
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[#3f7d40] bg-[#e7efdf]'
                          : 'border-[#e5e3da] hover:border-[#3f7d40]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#1c4a2b] mb-1">
                        Address {addr.isDefault && <span className="text-[10px] text-[#3f7d40] bg-white px-2 py-0.5 rounded-full border">Default</span>}
                      </p>
                      <p className="text-[11px] text-[#5b6259] leading-tight">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5b6259]">No delivery addresses configured yet. Please add one below.</p>
              )}

              {validationErrors.address && <p className="text-rose-600 text-[10px]">{validationErrors.address}</p>}

              {!showNewAddressForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-[#3f7d40] flex items-center gap-1 hover:underline"
                >
                  + Add New Address
                </button>
              ) : (
                <div className="border border-dashed border-[#e5e3da] p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-[#1c4a2b]">New Address Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="street"
                        value={newAddress.street}
                        onChange={handleNewAddressChange}
                        className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:border-[#3f7d40]"
                        placeholder="Flat, House No., Building, Street Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleNewAddressChange}
                        className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:border-[#3f7d40]"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={handleNewAddressChange}
                        className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:border-[#3f7d40]"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleNewAddressChange}
                        className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:border-[#3f7d40]"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveNewAddress}
                      className="px-4 py-2 bg-[#3f7d40] text-white text-xs font-bold rounded-lg"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 border text-[#5b6259] text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Date & Time */}
            <div className="bg-white rounded-2xl border border-[#e5e3da] p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-2 border-b border-[#e5e3da] pb-3">
                <Calendar className="w-4 h-4" /> Schedule Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#5b6259] block mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                  />
                  {validationErrors.startDate && <p className="text-rose-600 text-[10px] mt-1">{validationErrors.startDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#5b6259] block mb-1">Preferred Delivery Slot *</label>
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] bg-white focus:outline-none focus:border-[#3f7d40]"
                  >
                    {timeSlots.map((ts, idx) => (
                      <option key={idx} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences & Dietary Info */}
            <div className="bg-white rounded-2xl border border-[#e5e3da] p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-2 border-b border-[#e5e3da] pb-3">
                <Clock className="w-4 h-4" /> Dietary Preferences & Allergy Info
              </h3>
              <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#5b6259] block mb-1">Allergy Information</label>
                    <input
                      type="text"
                      name="allergyInfo"
                      value={formData.allergyInfo}
                      onChange={handleInputChange}
                      placeholder="e.g. Peanuts, Gluten (leave blank if none)"
                      className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5b6259] block mb-1">Special Delivery Instructions</label>
                    <input
                      type="text"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      placeholder="e.g. Leave with security guard"
                      className="w-full text-xs p-3 rounded-xl border border-[#e5e3da] focus:outline-none focus:border-[#3f7d40]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Checkout Card Side */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#e5e3da] p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#1c4a2b] border-b border-[#e5e3da] pb-3">Subscription Summary</h3>
              
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#3f7d40] tracking-wider">{plan?.badge || 'MONTHLY PLAN'}</span>
                <h4 className="font-extrabold text-base text-[#1c4a2b]">{plan?.name}</h4>
                <p className="text-[11px] text-[#5b6259] leading-snug">{plan?.target_protein} target protein per day.</p>
              </div>

              <div className="border-t border-b border-[#e5e3da] py-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#5b6259]">
                  <span>Subtotal Price</span>
                  <span className="font-semibold text-[#1c211d]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5b6259]">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-[#1c211d]">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5b6259]">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#3f7d40]">FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-[#1c4a2b] font-extrabold text-base pt-1">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={processingPayment}
                  className="btn btn-primary w-full justify-center py-3 text-sm flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {processingPayment ? 'Processing Secure Checkout...' : 'Verify & Make Payment'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#5b6259] justify-center mt-3">
                <CreditCard className="w-3.5 h-3.5 text-[#3f7d40]" /> Secure SSL Gateway Verification
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Local Payment Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-[#1c211d]/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e3da] p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#1c4a2b]">Simulate Test Payment</h3>
              <p className="text-xs text-[#5b6259] mt-2 leading-relaxed">
                We couldn't detect active Razorpay live credentials. Would you like to simulate a successful checkout for subscription: <strong>{simulatedOrderInfo?.subNumber}</strong>?
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSimulatedPayment(true)}
                className="w-full py-2.5 bg-[#3f7d40] text-white text-xs font-bold rounded-xl"
              >
                Simulate Payment SUCCESS
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedPayment(false)}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Simulate Payment FAILURE
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
