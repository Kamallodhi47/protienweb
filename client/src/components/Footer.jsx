import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { newsletterAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Flame,
  Truck,
  Lock,
  Headphones,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  ArrowUpRight
} from 'lucide-react';

export default function Footer() {
  const { addToast } = useToast();
  const [nlEmail, setNlEmail] = useState('');
  const [nlLoading, setNlLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlLoading(true);
    try {
      await newsletterAPI.subscribe(nlEmail.trim());
      addToast('🎉 Successfully subscribed to our newsletter!', 'success');
      setNlEmail('');
    } catch (err) {
      addToast(err.message || 'Failed to subscribe. Please try again.', 'error');
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <>
      {/* Trust Badges Bar */}
      <section className="bg-[#f2f4f1] dark:bg-slate-900 border-t border-b border-gray-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#2f6a35] shadow-xs shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">On-Time Delivery</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fast & reliable delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#2f6a35] shadow-xs shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secure Payment</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">100% safe & secure</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#2f6a35] shadow-xs shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">24/7 Support</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">We are here to help</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#2f6a35] shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">100% Satisfaction</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Customer first always</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dark Green Gradient Footer */}
      <footer className="bg-gradient-to-br from-[#12331f] via-[#1c4a2b] to-[#0f2d1b] text-gray-200 pt-16 pb-8 border-t border-[#2f6b3a]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand & Socials */}
            <div className="lg:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-black tracking-tight text-white">Protein</span>
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-300">PROJECT</span>
                </div>
              </Link>
              <p className="text-xs text-gray-300 leading-relaxed">
                High protein meals, custom made for your goals. Eat clean, stay healthy and live better.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-full border border-emerald-600/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-emerald-600/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-emerald-600/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-emerald-600/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link to="/bowl-builder" className="hover:text-emerald-400 transition-colors">Build Your Bowl</Link></li>
                <li><Link to="/juices" className="hover:text-emerald-400 transition-colors">Juices</Link></li>
                <li><Link to="/subscription" className="hover:text-emerald-400 transition-colors">Subscription</Link></li>
              </ul>
            </div>

            {/* Col 3: Help */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Help</h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>support@proteinproject.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>123, Fitness Street, Healthy City, India</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Newsletter */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Newsletter</h4>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Get updates on new meals, offers and health tips.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  disabled={nlLoading}
                  className="w-full bg-white text-gray-800 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none pr-10 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={nlLoading}
                  className="absolute right-1 top-1 bottom-1 w-8 bg-[#387a3e] hover:bg-[#2d6232] text-white rounded-md flex items-center justify-center transition-colors disabled:opacity-60"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom copyright & payment icons */}
          <div className="border-t border-[#26532d] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <p>© {new Date().getFullYear()} Protein Project. All Rights Reserved.</p>
            <div className="flex items-center gap-4 text-xs font-bold tracking-wider text-gray-300">
              <span className="bg-white/10 px-2.5 py-1 rounded text-white font-serif italic">VISA</span>
              <span className="bg-white/10 px-2.5 py-1 rounded text-amber-400 font-bold">MasterCard</span>
              <span className="bg-white/10 px-2.5 py-1 rounded text-emerald-300 font-extrabold">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
