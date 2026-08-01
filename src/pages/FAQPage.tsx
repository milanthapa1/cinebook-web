import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How long are my selected seats held during checkout?',
    a: 'Seats are locked on the server for 10 minutes once held. If payment is not completed before expiry, the seat hold is automatically released back to available status.',
  },
  {
    q: 'Which payment methods are accepted for online booking?',
    a: 'We support instant server-verified payments via Khalti Digital Wallet and eSewa e-Payment gateway.',
  },
  {
    q: 'Can I cancel or modify my confirmed booking?',
    a: 'Confirmed bookings can be cancelled up to 2 hours before the showtime starts directly from your User Dashboard.',
  },
  {
    q: 'How do I present my ticket at entry?',
    a: 'Simply present the QR code rendered on your digital ticket screen or printed PDF copy to our theater scanners.',
  },
  {
    q: 'What is the difference between Standard, Premium, and Recliner seats?',
    a: 'Standard seats are located in rows A–B. Premium seats offer optimal viewing angles in rows C–D. Recliner seats in rows E–F feature motor legrests and plush leather cushions.',
  },
];

export const FAQPage: React.FC = () => {
  const [search, setSearch]       = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-500">Search questions about seat holds, payments, and ticket policies</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
        />
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No results found for "{search}"</p>
        )}
        {filtered.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 text-left text-sm font-semibold text-gray-900 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  openIndex === idx ? 'rotate-180 text-[#00a8cc]' : ''
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
