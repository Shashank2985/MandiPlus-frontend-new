"use client";
import React from 'react';
import { useRouter } from "next/navigation";

const SupportPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0d7fc] px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full flex flex-col items-center relative">
        <button
          onClick={() => router.push("/")}
          className="absolute left-4 top-4 flex items-center gap-1 text-[#4309ac] hover:text-[#350889] font-medium text-sm px-2 py-1 rounded-lg bg-[#f3f0fa] border border-[#e0d7fc] hover:bg-[#ede7fa] transition"
          aria-label="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>

        </button>
        <h1 className="text-3xl font-bold text-[#4309ac] mb-4">Support</h1>
        <p className="text-gray-700 text-lg mb-6 text-center">
          <span className="font-semibold text-[#4309ac]">All claim-related communication must be made via email or phone:</span>
        </p>
        <div className="flex flex-col items-center gap-4 w-full">
          <a href="mailto:support@mandiplus.com" className="flex items-center gap-2 bg-[#f3f0fa] border border-[#e0d7fc] rounded-xl px-4 py-3 w-full justify-center hover:bg-[#ede7fa] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4309ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0-4V8" /></svg>
            <span className="text-[#4309ac] font-medium">support@mandiplus.com</span>
          </a>
          <a href="tel:+919900186757" className="flex items-center gap-2 bg-[#f3f0fa] border border-[#e0d7fc] rounded-xl px-4 py-3 w-full justify-center hover:bg-[#ede7fa] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4309ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="text-[#4309ac] font-medium">+91 99001 86757</span>
          </a>
        </div>
        <p className="text-gray-500 text-xs mt-6 text-center">We are here to help you with your claims and support queries.</p>
      </div>
    </div>
  );
};

export default SupportPage;
