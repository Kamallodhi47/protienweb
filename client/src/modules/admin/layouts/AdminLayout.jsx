import React from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1c211d]">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar mode="admin" />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
