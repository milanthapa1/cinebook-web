import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-2">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-600 text-sm">Last updated: July 31, 2026</p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gray-200 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">1. Data Collection</h2>
          <p>
            We collect personal information necessary to process movie ticket reservations, including your name, email address, phone number, and transaction references.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. Data Security & Storage</h2>
          <p>
            User authentication data is securely encrypted using industry-standard bcrypt hashing. Refresh tokens are stored in secure httpOnly cookies to mitigate XSS exposure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. Third-Party Integrations</h2>
          <p>
            Payment information is directly handed off to Khalti and eSewa sandbox environments. Profile avatars are uploaded to signed Cloudinary storage buckets without exposing API credentials.
          </p>
        </section>
      </div>
    </div>
  );
};
