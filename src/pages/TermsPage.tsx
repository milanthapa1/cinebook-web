import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 mb-2">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-gray-600 text-sm">Last updated: July 31, 2026</p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gray-200 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">1. Ticket Booking & Lock Policy</h2>
          <p>
            Seats selected on CineBook are held in real-time for up to 10 minutes. If payment is not completed within this timeframe, held seats are automatically released back into available inventory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. Payments & Gateway Verifications</h2>
          <p>
            All digital payments processed via Khalti or eSewa are verified server-to-server. Once confirmed, ticket issuance is final and non-transferable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. Cancellations & Refunds</h2>
          <p>
            Cancellations are allowed up to 2 hours prior to the showtime starting time. Approved refunds will be credited back through the original payment channel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">4. Admission & Age Ratings</h2>
          <p>
            Patrons must present valid QR codes at entry. Movies with age ratings (e.g. R, PG-13) require appropriate identification upon entry at cinema auditoriums.
          </p>
        </section>
      </div>
    </div>
  );
};
