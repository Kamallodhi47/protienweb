import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../../../context/AuthContext';
import { Flame, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirect || '/customer');
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white border border-[#e5e3da] p-8 rounded-[22px] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#3f7d40] flex items-center justify-center text-white mx-auto shadow-xs">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1c4a2b]">Welcome Back</h2>
            <p className="text-xs text-[#5b6259]">Sign in to manage your nutrition dashboard &amp; orders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="field">
              <label>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#5b6259]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Demo Accounts */}
            <div className="p-3 rounded-[14px] bg-[#f2f6ee] border border-[#e5e3da] text-xs space-y-1 text-[#5b6259]">
              <div className="font-bold text-[#3f7d40]">Quick Demo Login:</div>
              <div>Customer: alex@example.com / admin123</div>
              <div>Admin: admin@protein.com / admin123</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-full justify-center"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#5b6259]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#3f7d40] hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
