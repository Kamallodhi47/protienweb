import React, { useState, useEffect } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import { authAPI, customerAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Modal from '../../../components/Modal';
import { User, MapPin, Lock, Plus, Trash2, Check } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, updateProfileState } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dailyProteinGoal, setDailyProteinGoal] = useState(user?.dailyProteinGoal || 120);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', zipCode: '', isDefault: true });

  const loadAddresses = () => {
    customerAPI.getAddresses().then((res) => {
      if (res.success) setAddresses(res.addresses);
    });
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile({ name, phone, dailyProteinGoal });
      if (res.success) {
        updateProfileState(res.user);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Profile update failed.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      if (res.success) {
        addToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Password change failed.', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await customerAPI.addAddress(newAddr);
      if (res.success) {
        addToast('Address added!', 'success');
        setIsAddressModalOpen(false);
        setNewAddr({ street: '', city: '', state: '', zipCode: '', isDefault: true });
        loadAddresses();
      }
    } catch (err) {
      addToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await customerAPI.deleteAddress(id);
      if (res.success) {
        addToast('Address removed!', 'info');
        loadAddresses();
      }
    } catch (err) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black dark:text-white">Profile & Address Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage account information, daily protein goals, and delivery addresses.</p>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" /> Account Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-900 text-slate-500 border-none text-sm font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Daily Protein Target (g)</label>
              <input
                type="number"
                value={dailyProteinGoal}
                onChange={(e) => setDailyProteinGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
          </div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
            Save Profile Changes
          </button>
        </form>

        {/* Addresses Book */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-500" /> Delivery Address Book
            </h3>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm dark:text-white">{addr.street}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{addr.city}, {addr.state} - {addr.zipCode}</div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Password Security Form */}
        <form onSubmit={handleChangePassword} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" /> Password Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
          </div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
            Update Password
          </button>
        </form>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Street Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 42 Fitness Ave"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">City</label>
              <input
                type="text"
                required
                placeholder="Mumbai"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">State</label>
              <input
                type="text"
                required
                placeholder="MH"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Zip Code</label>
              <input
                type="text"
                required
                placeholder="400001"
                value={newAddr.zipCode}
                onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white border-none text-sm font-semibold"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 mt-4">
            Save Address
          </button>
        </form>
      </Modal>
    </CustomerLayout>
  );
}
