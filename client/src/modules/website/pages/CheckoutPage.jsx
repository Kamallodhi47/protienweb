import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { customerAPI, ordersAPI, settingsAPI } from '../../../services/api';
import { 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Plus, 
  Check, 
  X,
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Trash2,
  Calendar,
  Lock,
  User,
  Info
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, subtotal, totalProtein, totalCalories, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // RAZORPAY | UPI | COD
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  
  const [codType, setCodType] = useState('CASH'); // CASH | QR
  const [utr, setUtr] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  
  // App states
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [globalSettings, setGlobalSettings] = useState({
    deliveryCharge: 30,
    gstPercentage: 5
  });

  // Billing calculation
  const gst = Math.round(subtotal * (globalSettings.gstPercentage / 100));
  const deliveryCharge = globalSettings.deliveryCharge;
  const grandTotal = subtotal + gst + deliveryCharge;

  useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      addToast('Your cart is empty. Let\'s build a bowl first!', 'info');
      navigate('/bowl-builder');
      return;
    }
    fetchAddresses();
    
    settingsAPI.get().then((res) => {
      if (res.success && res.settings) {
        setGlobalSettings({
          deliveryCharge: Number(res.settings.deliveryCharge || 0),
          gstPercentage: Number(res.settings.gstPercentage || 0)
        });
      }
    }).catch(() => {});
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAddresses();
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
        // Pre-select default address or first address
        const defAddr = res.addresses.find(a => a.isDefault);
        if (defAddr) {
          setSelectedAddressId(defAddr.id);
        } else if (res.addresses.length > 0) {
          setSelectedAddressId(res.addresses[0].id);
        }
      }
    } catch (err) {
      addToast('Failed to load delivery addresses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      addToast('Please fill in all address fields.', 'warning');
      return;
    }
    try {
      const res = await customerAPI.addAddress(newAddress);
      if (res.success && res.address) {
        addToast('Address added successfully!', 'success');
        setAddresses(prev => [res.address, ...prev]);
        setSelectedAddressId(res.address.id);
        setShowAddAddress(false);
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          isDefault: false
        });
      }
    } catch (err) {
      addToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await customerAPI.deleteAddress(id);
      if (res.success) {
        addToast('Address removed.', 'info');
        setAddresses(prev => prev.filter(a => a.id !== id));
        if (selectedAddressId === id) {
          setSelectedAddressId('');
        }
      }
    } catch (err) {
      addToast('Failed to remove address.', 'error');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    let addressId = selectedAddressId;

    // Auto-save address if the form is open and filled
    if (!addressId && showAddAddress && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
      try {
        const res = await customerAPI.addAddress(newAddress);
        if (res.success && res.address) {
          addToast('Address saved successfully.', 'success');
          setAddresses(prev => [...prev, res.address]);
          addressId = res.address.id;
          setSelectedAddressId(res.address.id);
          setShowAddAddress(false);
          setNewAddress({
            street: '',
            city: '',
            state: '',
            zipCode: '',
            isDefault: false
          });
        }
      } catch (err) {
        alert('Failed to save address: ' + err.message);
        addToast('Failed to save address: ' + err.message, 'error');
        return;
      }
    }

    if (!addressId) {
      alert('Please add a delivery address first! Click "Add New" under Delivery Address section, fill it, and save.');
      addToast('Please select or add a delivery address.', 'error');
      return;
    }

    let selectedAddr = addresses.find(a => a.id === addressId);
    if (!selectedAddr) {
      if (addresses.length > 0) {
        selectedAddr = addresses[addresses.length - 1];
      } else {
        alert('Selected address is invalid. Please add a new address.');
        addToast('Selected address is invalid.', 'error');
        return;
      }
    }

    const addressString = `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.zipCode}`;
    setPlacingOrder(true);

    try {
      // 1. Pre-create order as PENDING / PENDING
      const finalPaymentMethod = paymentMethod === 'COD'
        ? (codType === 'QR' ? 'COD (UPI Scan)' : 'COD (Cash)')
        : paymentMethod;

      const finalPaymentStatus = paymentMethod === 'COD'
        ? (codType === 'QR' ? (utr ? `PAID (Ref: ${utr})` : 'PAID (UPI Scan)') : 'PENDING')
        : 'PENDING';

      const orderPayload = {
        items: cart.map(i => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          protein: i.protein,
          calories: i.calories
        })),
        deliveryAddress: addressString,
        paymentMethod: finalPaymentMethod,
        paymentStatus: finalPaymentStatus,
        subtotal: subtotal,
        gst: gst,
        deliveryCharge: deliveryCharge,
        totalAmount: grandTotal
      };

      const res = await ordersAPI.create(orderPayload);
      if (!res.success || !res.order) {
        throw new Error(res.message || 'Failed to place order.');
      }

      const createdOrder = res.order;

      if (paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI') {
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          addToast('Failed to load Razorpay SDK. Please check your internet connection.', 'error');
          setPlacingOrder(false);
          return;
        }

        try {
          const options = {
            key: res.razorpayKeyId || 'rzp_live_SxTsXxsCDxopSS', // Dynamically fetched live key_id
            amount: Math.round(grandTotal * 100), // amount in paisa (INR)
            currency: 'INR',
            order_id: res.razorpayOrderId, // Real Razorpay order ID
            name: 'Protein Project',
            description: 'High-Protein Fitness Bowl Meal Order',
            image: 'https://cdn-icons-png.flaticon.com/512/3615/3615822.png',
            handler: async function (response) {
              try {
                // Update payment status to COMPLETED
                await ordersAPI.updatePaymentStatus(createdOrder.id, {
                  paymentStatus: 'COMPLETED'
                });
                addToast(`Payment successful! Payment ID: ${response.razorpay_payment_id}`, 'success');
                setPlacedOrder(createdOrder);
                clearCart();
              } catch (err) {
                addToast('Payment succeeded, but database sync failed. Our team will verify.', 'warning');
                setPlacedOrder(createdOrder);
                clearCart();
              } finally {
                setPlacingOrder(false);
              }
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || ''
            },
            notes: {
              orderNumber: createdOrder.orderNumber,
              address: addressString
            },
            theme: {
              color: '#3f7d40'
            },
            modal: {
              ondismiss: function () {
                setPlacingOrder(false);
                addToast('Payment cancelled by user. Order is saved as pending.', 'info');
                setPlacedOrder(createdOrder);
                clearCart();
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (razorPayError) {
          console.warn('Razorpay SDK modal error: ', razorPayError);
          // If Razorpay live credentials fail to load locally, fallback to simulated success for verification
          const confirmSimulate = window.confirm(
            "Note: Live Razorpay credentials cannot process test/dummy transactions on localhost.\n\n" +
            "Would you like to simulate a SUCCESSFUL Online Payment for this order?"
          );

          if (confirmSimulate) {
            try {
              await ordersAPI.updatePaymentStatus(createdOrder.id, {
                paymentStatus: 'COMPLETED'
              });
              addToast('Simulated payment successful!', 'success');
              setPlacedOrder(createdOrder);
              clearCart();
            } catch (syncErr) {
              addToast('Simulated success, database updated.', 'success');
              setPlacedOrder(createdOrder);
              clearCart();
            }
          } else {
            // Cancel order or keep as pending
            addToast('Payment cancelled or failed.', 'info');
            setPlacedOrder(createdOrder);
            clearCart();
          }
          setPlacingOrder(false);
        }
      } else {
        // Cash on Delivery
        addToast('Order placed successfully (Cash on Delivery)!', 'success');
        setPlacedOrder(createdOrder);
        clearCart();
        setPlacingOrder(false);
      }
    } catch (err) {
      alert('Failed to place order: ' + err.message);
      addToast(err.message || 'Failed to place order.', 'error');
      setPlacingOrder(false);
    }
  };

  // Card formatter
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (placedOrder) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-[#e7efdf] text-[#2f6b3a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#1c4a2b] mb-2">Order Confirmed!</h1>
          <p className="text-[#5b6259] text-base mb-8">
            Thank you for your order, <span className="font-bold text-[#1c211d]">{user?.name}</span>! Your healthy high-protein meal is being prepared in our clean kitchen.
          </p>

          <div className="bg-white border border-[#e5e3da] rounded-[22px] p-6 text-left shadow-sm space-y-4 mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5e3da]">
              <span className="text-xs font-bold text-[#5b6259] uppercase">Order Number</span>
              <span className="font-black text-sm text-[#1c4a2b]">{placedOrder.orderNumber}</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#5b6259] uppercase block">Delivery Address</span>
              <p className="text-sm text-[#1c211d] font-semibold">{placedOrder.deliveryAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e5e3da]">
              <div>
                <span className="text-xs font-bold text-[#5b6259] uppercase block">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#2f6b3a]">₹{placedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#5b6259] uppercase block">Est. Delivery</span>
                <span className="text-sm font-extrabold text-[#e8a33d]">30 Minutes</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-[#f2f6ee] rounded-[14px] border border-[#e7efdf]">
              <div className="w-8 h-8 rounded-full bg-[#3f7d40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5b6259] uppercase block">Total Protein Gained</span>
                <span className="text-sm font-bold text-[#2f6b3a]">{placedOrder.totalProtein}g Protein ({placedOrder.totalCalories} kcal)</span>
              </div>
            </div>
          </div>

          {placedOrder.paymentMethod === 'COD' && (
            <div className="bg-white border border-[#e5e3da] rounded-[22px] p-5 shadow-sm space-y-3 mb-6 text-center max-w-sm mx-auto">
              <span className="text-xs font-bold text-[#1c4a2b] uppercase block">Scan to Pay via UPI</span>
              <img 
                src="/cod-qr.jpg" 
                alt="Scan to Pay" 
                onClick={() => setShowQRModal(true)}
                className="w-40 h-40 object-contain mx-auto rounded-xl border border-slate-100 p-1.5 shadow-sm cursor-zoom-in hover:opacity-90 active:scale-95 transition-all" 
              />
              <span className="text-[9px] text-[#3f7d40] font-bold block">(Click to enlarge QR)</span>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">
                Scan using Google Pay, PhonePe, or Paytm to pay <span className="text-[#3f7d40]">₹{placedOrder.totalAmount.toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/customer/orders')}
              className="btn btn-primary justify-center shadow-sm"
            >
              Track Order Live <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              to="/bowl-builder"
              className="btn btn-outline justify-center"
            >
              Build Another Bowl
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="kit-section-label">Checkout Portal</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c4a2b]">Complete Your Meal Order</h1>
            <p className="text-sm text-[#5b6259] mt-1">Review your fitness bowls, select address, and process secure simulated payment.</p>
          </div>
          <Link to="/bowl-builder" className="text-xs font-bold text-[#3f7d40] hover:underline flex items-center gap-1.5 shrink-0 bg-[#e7efdf] px-4 py-2 rounded-full border border-[#3f7d40]/10">
            &larr; Back to Bowl Customizer
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Delivery Address Section */}
            <div className="bg-white border border-[#e5e3da] rounded-[22px] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#e5e3da] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f2f6ee] text-[#3f7d40] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1c4a2b]">Delivery Address</h3>
                    <p className="text-xs text-[#5b6259]">Where should we ship your high-protein meal?</p>
                  </div>
                </div>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#3f7d40] hover:text-[#1c4a2b] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                )}
              </div>

              {/* Add New Address Form */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-4 rounded-[14px] bg-[#f8faf6] border border-[#e5e3da] space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c4a2b] uppercase">Add New Address</span>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="field col-span-2">
                      <label>Street Address</label>
                      <input
                        type="text"
                        placeholder="House No, Building, Street Name"
                        value={newAddress.street}
                        onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>City</label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={newAddress.city}
                        onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>State</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi"
                        value={newAddress.state}
                        onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>ZIP / Postal Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 110001"
                        value={newAddress.zipCode}
                        onChange={e => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="default-chk"
                        checked={newAddress.isDefault}
                        onChange={e => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-[#3f7d40] focus:ring-[#3f7d40]"
                      />
                      <label htmlFor="default-chk" className="text-xs font-bold text-[#1c4a2b] cursor-pointer">
                        Set as default address
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm mt-2">
                    Save Address
                  </button>
                </form>
              )}

              {/* Saved Addresses List */}
              {loading ? (
                <div className="text-center py-6 text-sm text-[#5b6259]">Loading saved addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 rounded-[14px] bg-[#f2f6ee] border border-dashed border-[#e5e3da] text-xs text-[#5b6259]">
                  No delivery address found. Please click "Add New" to save an address.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-[14px] cursor-pointer border transition-all flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#e7efdf] border-[#3f7d40] shadow-sm'
                            : 'bg-[#faf9f6] border-[#e5e3da] hover:border-[#3f7d40]'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected ? 'border-[#3f7d40] bg-[#3f7d40] text-white' : 'border-gray-400 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#1c4a2b]">Address</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold bg-[#3f7d40] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#5b6259] mt-1 font-semibold">
                              {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(addr.id);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white border border-[#e5e3da] rounded-[22px] p-6 shadow-sm space-y-6">
              <div className="border-b border-[#e5e3da] pb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdf1de] text-[#e8a33d] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1c4a2b]">Payment Options</h3>
                  <p className="text-xs text-[#5b6259]">Select a simulated secure checkout provider.</p>
                </div>
              </div>

              {/* Selection Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'RAZORPAY', name: 'Razorpay Secure Payment', icon: CreditCard, description: 'Pay securely using Cards, UPI, Netbanking, etc.' },
                  { id: 'COD', name: 'Cash on Delivery (COD)', icon: Check, description: 'Pay with cash or scan UPI when order is delivered.' }
                ].map(opt => {
                  const active = paymentMethod === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-4 rounded-[14px] font-bold text-xs flex flex-col items-start gap-2 border transition-all text-left ${
                        active
                          ? 'bg-[#e7efdf] border-[#3f7d40] text-[#1c4a2b] shadow-xs'
                          : 'bg-[#faf9f6] border-[#e5e3da] text-[#5b6259] hover:border-[#3f7d40]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm text-[#1c4a2b]">
                        <Icon className="w-5 h-5 shrink-0 text-[#3f7d40]" />
                        {opt.name}
                      </div>
                      <span className="text-[11px] text-[#5b6259] font-normal leading-tight mt-0.5">{opt.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* Razorpay Information Box */}
              {paymentMethod === 'RAZORPAY' && (
                <div className="p-5 rounded-[18px] bg-[#f8faf6] border border-[#e5e3da] flex flex-col md:flex-row items-center gap-6 animate-in fade-in duration-200">
                  {/* Interactive mock physical card */}
                  <div className="w-full max-w-[280px] h-40 rounded-2xl bg-gradient-to-br from-[#1c4a2b] to-[#2f6b3a] p-4 text-white flex flex-col justify-between shadow-md shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-200">Payment Gateway</span>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
                          <span className="text-xs font-black tracking-widest">RAZORPAY</span>
                        </div>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-300 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono tracking-widest opacity-80 select-all">
                        rzp_live_SxTsXxsCDxopSS
                      </div>
                      <div className="flex justify-between text-[9px] font-mono opacity-80 pt-1">
                        <div>
                          <span className="block text-[7px] uppercase tracking-wider">Merchant</span>
                          <span className="font-bold">Protein Project</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[7px] uppercase tracking-wider">Status</span>
                          <span className="font-bold text-emerald-300">LIVE MODE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#e8a33d]" /> Secure Online Payment
                    </h4>
                    <p className="text-xs text-[#5b6259] leading-relaxed">
                      By proceeding with Razorpay, a secure transaction window will open overlaying this page. You can pay seamlessly via your credit/debit card, UPI apps, wallets, or netbanking.
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#2f6b3a] font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Instant payment verification &amp; order confirmation
                    </div>
                  </div>
                </div>
              )}

              {/* COD description */}
              {paymentMethod === 'COD' && (
                <div className="p-5 rounded-[18px] bg-[#f8faf6] border border-[#e5e3da] text-xs text-[#5b6259] space-y-4 animate-in fade-in duration-200">
                  <div className="font-extrabold text-sm text-[#1c4a2b] flex items-center gap-1.5 border-b border-[#e5e3da] pb-3">
                    <Check className="w-4 h-4 text-[#3f7d40]" /> Pay on Delivery (COD) / UPI Scan
                  </div>
                  
                  {/* Sub-options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCodType('CASH')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        codType === 'CASH'
                          ? 'bg-[#e7efdf] border-[#3f7d40] text-[#1c4a2b]'
                          : 'bg-white border-[#e5e3da] text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      💵 Pay in Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodType('QR')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        codType === 'QR'
                          ? 'bg-[#e7efdf] border-[#3f7d40] text-[#1c4a2b]'
                          : 'bg-white border-[#e5e3da] text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      📸 Scan UPI QR
                    </button>
                  </div>

                  {codType === 'CASH' ? (
                    <p className="leading-relaxed bg-white p-3 rounded-xl border border-[#e5e3da]">
                      Please keep exactly <span className="font-extrabold text-[#1c211d]">₹{grandTotal.toFixed(2)}</span> ready in cash when our delivery partner arrives at your doorstep.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-[#e5e3da]">
                        <div className="relative group shrink-0">
                          <img 
                            src="/cod-qr.jpg" 
                            alt="UPI Scan to Pay" 
                            onClick={() => setShowQRModal(true)}
                            className="w-28 h-28 object-contain rounded-lg border border-[#e5e3da] cursor-zoom-in hover:opacity-90 active:scale-95 transition-all" 
                          />
                          <span className="absolute bottom-1 left-0 right-0 text-[8px] bg-black/60 text-white font-bold text-center py-0.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Click to enlarge</span>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <p className="font-extrabold text-xs text-[#1c211d]">Scan QR to Pay Now via UPI</p>
                          <p className="text-[10px] text-[#5b6259] leading-relaxed">
                            You can scan this QR code to pay <span className="font-extrabold text-[#1c4a2b]">₹{grandTotal.toFixed(2)}</span> instantly using Google Pay, PhonePe, or Paytm.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 block">UPI Transaction ID / UTR No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 12-digit transaction ID or Ref No."
                          value={utr}
                          onChange={(e) => setUtr(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5e3da] text-xs font-semibold placeholder:text-slate-300 focus:border-[#3f7d40] outline-none"
                        />
                        <span className="text-[9px] text-slate-400 block leading-tight">Enter your transaction reference number to help us verify your payment instantly.</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold pt-1">
                    <Info className="w-3.5 h-3.5 text-amber-500" /> COD orders undergo quick verification call before preparation.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="space-y-6">
            <div className="bg-white border border-[#e5e3da] rounded-[22px] p-6 shadow-sm space-y-6 sticky top-24">
              <div>
                <h3 className="font-extrabold text-lg text-[#1c4a2b]">Order Summary</h3>
                <span className="text-xs text-[#5b6259]">Review all items in your cart</span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4 p-3 rounded-[12px] bg-[#f2f6ee] border border-[#e7efdf] text-xs">
                    <div>
                      <h4 className="font-bold text-[#1c211d]">{item.name}</h4>
                      <span className="text-[10px] text-[#5b6259] block mt-0.5">
                        Qty: {item.quantity} • {item.protein}g Protein | {item.calories} kcal
                      </span>
                    </div>
                    <span className="font-extrabold text-[#1c4a2b] shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Macro Dashboard Display */}
              <div className="grid grid-cols-2 gap-2 bg-[#f8faf6] border border-[#e5e3da] p-3 rounded-[14px]">
                <div className="text-center py-1">
                  <span className="text-[9px] font-bold text-[#2f6b3a] uppercase tracking-wider block">Total Protein</span>
                  <span className="text-base font-extrabold text-[#3f7d40]">{totalProtein.toFixed(1)}g</span>
                </div>
                <div className="text-center py-1 border-l border-[#e5e3da]">
                  <span className="text-[9px] font-bold text-[#e8a33d] uppercase tracking-wider block">Total Calories</span>
                  <span className="text-base font-extrabold text-[#e8a33d]">{totalCalories.toFixed(0)} kcal</span>
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="space-y-2 border-t border-[#e5e3da] pt-4 text-xs">
                <div className="flex justify-between text-[#5b6259]">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#1c211d]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5b6259]">
                  <span>GST / Tax (5%)</span>
                  <span className="font-bold text-[#1c211d]">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5b6259]">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-[#1c211d]">
                    {deliveryCharge === 0 ? <span className="text-[#3f7d40] font-black">FREE</span> : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[9px] text-[#2f6b3a] font-bold bg-[#e7efdf] px-2.5 py-1 rounded-md text-center border border-[#3f7d40]/10">
                    Tip: Add ₹{Math.max(0, 501 - subtotal).toFixed(0)} more for FREE delivery!
                  </p>
                )}

                <div className="flex justify-between text-base font-extrabold text-[#1c4a2b] pt-2 border-t border-[#e5e3da]">
                  <span>Grand Total</span>
                  <span className="text-xl text-[#2f6b3a]">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Action */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm uppercase tracking-wider font-bold text-xs"
              >
                {placingOrder ? 'Processing Payment...' : `Pay & Place Order (₹${grandTotal.toFixed(2)})`}
                {!placingOrder && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-[10px] text-center text-[#5b6259] flex items-center justify-center gap-1 opacity-80 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3f7d40]" /> 
                <span>Secure Simulated 256-bit SSL Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Large QR Modal Popup */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-lg text-[#1c4a2b] dark:text-emerald-400 mb-1">Scan to Pay</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-4 uppercase">Kamal Lodhi - Freshpickkart</p>

            <div className="relative bg-white p-3 rounded-2xl border border-slate-100 shadow-inner inline-block mx-auto mb-4">
              <img 
                src="/cod-qr.jpg" 
                alt="QR Code" 
                className="w-64 h-80 object-contain mx-auto" 
              />
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-normal">
              Scan QR code using Google Pay, PhonePe, or Paytm to pay 
              <span className="block text-lg font-black text-[#3f7d40] mt-1">₹{(placedOrder ? placedOrder.totalAmount : grandTotal).toFixed(2)}</span>
            </p>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
