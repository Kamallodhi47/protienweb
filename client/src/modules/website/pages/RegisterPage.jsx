import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../../../context/AuthContext';
import { Dumbbell, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, email, password, phone });
      navigate('/customer');
    } catch (err) {
      // Error toast handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white border border-[#e5e3da] p-8 rounded-[22px] shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#3f7d40] flex items-center justify-center text-white mx-auto shadow-xs">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1c4a2b]">Create Account</h2>
            <p className="text-xs text-[#5b6259] font-medium">Join Protein Project &amp; start tracking your nutrition goals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Rahul Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-email">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-phone">Mobile Number <span className="text-[#5b6259] font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-full justify-center mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#5b6259]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#3f7d40] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
