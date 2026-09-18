import React, { useState } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { contactAPI } from '../../../services/api';

export default function ContactPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      addToast('Thank you! Your message has been received. We will get back to you soon.', 'success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      addToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="kit-section-label">We Are Here To Help</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1c4a2b]">Get in Touch</h1>
          <p className="text-[#5b6259] text-base leading-relaxed font-medium">
            Have questions about our protein bowls, custom diet subscriptions, or corporate catering? Drop us a line anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          {/* Left: Contact Info & Social Media Buttons */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-6">
              <h3 className="font-extrabold text-xl text-[#1c4a2b]">Contact Details</h3>
              <div className="space-y-4 text-xs font-semibold text-[#1c211d]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#5b6259] block text-[11px] font-medium">Phone Support</span>
                    <span className="text-sm font-extrabold text-[#1c4a2b]">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#5b6259] block text-[11px] font-medium">Email Address</span>
                    <span className="text-sm font-extrabold text-[#1c4a2b]">support@proteinproject.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#5b6259] block text-[11px] font-medium">Kitchen &amp; HQ Office</span>
                    <span className="text-sm font-extrabold text-[#1c4a2b]">123, Fitness Street, Healthy City, India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media & Instant Support Channels */}
            <div className="bg-[#f2f6ee] rounded-[22px] border border-[#e5e3da] p-8 text-center space-y-4 shadow-xs">
              <h4 className="font-extrabold text-base text-[#1c4a2b]">Connect &amp; Chat With Us</h4>
              <p className="text-xs text-[#5b6259] font-medium">Stay updated with daily high-protein meal recipes, health tips &amp; special discounts!</p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold text-xs shadow-xs hover:scale-105 transition-all"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1877f2] text-white font-bold text-xs shadow-xs hover:scale-105 transition-all"
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-xs hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[22px] border border-[#e5e3da] shadow-xs space-y-4">
            <h3 className="font-extrabold text-xl text-[#1c4a2b] mb-2">Send Us a Message</h3>

            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                required
                type="text"
                placeholder="Rahul Mehta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="phoneNum">Phone Number</label>
              <input
                id="phoneNum"
                required
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="emailAddr">Email Address</label>
              <input
                id="emailAddr"
                required
                type="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="userMsg">Your Message</label>
              <textarea
                id="userMsg"
                required
                rows={4}
                placeholder="Tell us about your fitness goal or meal preference..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center shadow-xs disabled:opacity-60">
              <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
