import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public Website Pages
import HomePage from './modules/website/pages/HomePage';
import BowlBuilderPage from './modules/website/pages/BowlBuilderPage';
import JuicesPage from './modules/website/pages/JuicesPage';
import SubscriptionPage from './modules/website/pages/SubscriptionPage';
import AboutPage from './modules/website/pages/AboutPage';
import ContactPage from './modules/website/pages/ContactPage';
import FAQPage from './modules/website/pages/FAQPage';
import TermsPage from './modules/website/pages/TermsPage';
import PrivacyPage from './modules/website/pages/PrivacyPage';
import LoginPage from './modules/website/pages/LoginPage';
import RegisterPage from './modules/website/pages/RegisterPage';
import CheckoutPage from './modules/website/pages/CheckoutPage';
import SproutsProteinPage from './modules/website/pages/SproutsProteinPage';
import CategoriesPage from './modules/website/pages/CategoriesPage';
import SubscriptionCheckoutPage from './modules/website/pages/SubscriptionCheckoutPage';
import SubscriptionSuccessPage from './modules/website/pages/SubscriptionSuccessPage';
import SubscriptionFailurePage from './modules/website/pages/SubscriptionFailurePage';

// Customer Dashboard Pages
import CustomerDashboard from './modules/customer/pages/CustomerDashboard';
import CustomerOrdersPage from './modules/customer/pages/CustomerOrdersPage';
import CustomerSubscriptionPage from './modules/customer/pages/CustomerSubscriptionPage';
import CustomerAnalyticsPage from './modules/customer/pages/CustomerAnalyticsPage';
import CustomerProfilePage from './modules/customer/pages/CustomerProfilePage';

// Admin Dashboard Pages
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import AdminOrdersPage from './modules/admin/pages/AdminOrdersPage';
import AdminIngredientsPage from './modules/admin/pages/AdminIngredientsPage';
import AdminInventoryPage from './modules/admin/pages/AdminInventoryPage';
import AdminProductsPage from './modules/admin/pages/AdminProductsPage';
import AdminCustomersPage from './modules/admin/pages/AdminCustomersPage';
import AdminSubscriptionsPage from './modules/admin/pages/AdminSubscriptionsPage';
import AdminCMSPage from './modules/admin/pages/AdminCMSPage';
import AdminSettingsPage from './modules/admin/pages/AdminSettingsPage';
import AdminReportsPage from './modules/admin/pages/AdminReportsPage';
import AdminContactPage from './modules/admin/pages/AdminContactPage';
import AdminNewsletterPage from './modules/admin/pages/AdminNewsletterPage';
import AdminSproutsCategoriesPage from './modules/admin/pages/AdminSproutsCategoriesPage';
import AdminSproutsIngredientsPage from './modules/admin/pages/AdminSproutsIngredientsPage';

// Voice Assistant Widget Component
import VoiceAssistant from './components/VoiceAssistant';

// Guard components
const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center font-bold">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-8 text-center font-bold">Loading...</div>;
  return user && isAdmin ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <VoiceAssistant />
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/bowl-builder" element={<BowlBuilderPage />} />
                <Route path="/juices" element={<JuicesPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
                <Route path="/subscription/checkout" element={<CustomerRoute><SubscriptionCheckoutPage /></CustomerRoute>} />
                <Route path="/subscription/success" element={<CustomerRoute><SubscriptionSuccessPage /></CustomerRoute>} />
                <Route path="/subscription/failure" element={<CustomerRoute><SubscriptionFailurePage /></CustomerRoute>} />
                <Route path="/sprouts-protein" element={<SproutsProteinPage />} />
                <Route path="/categories" element={<CategoriesPage />} />

                {/* Customer Dashboard Routes */}
                <Route path="/customer" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
                <Route path="/customer/orders" element={<CustomerRoute><CustomerOrdersPage /></CustomerRoute>} />
                <Route path="/customer/subscriptions" element={<CustomerRoute><CustomerSubscriptionPage /></CustomerRoute>} />
                <Route path="/customer/analytics" element={<CustomerRoute><CustomerAnalyticsPage /></CustomerRoute>} />
                <Route path="/customer/profile" element={<CustomerRoute><CustomerProfilePage /></CustomerRoute>} />

                {/* Admin Dashboard Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
                <Route path="/admin/ingredients" element={<AdminRoute><AdminIngredientsPage /></AdminRoute>} />
                <Route path="/admin/inventory" element={<AdminRoute><AdminInventoryPage /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
                <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptionsPage /></AdminRoute>} />
                <Route path="/admin/cms" element={<AdminRoute><AdminCMSPage /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
                <Route path="/admin/contact" element={<AdminRoute><AdminContactPage /></AdminRoute>} />
                <Route path="/admin/newsletter" element={<AdminRoute><AdminNewsletterPage /></AdminRoute>} />
                <Route path="/admin/sprouts-categories" element={<AdminRoute><AdminSproutsCategoriesPage /></AdminRoute>} />
                <Route path="/admin/sprouts-ingredients" element={<AdminRoute><AdminSproutsIngredientsPage /></AdminRoute>} />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
