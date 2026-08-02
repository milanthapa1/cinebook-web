import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: July 31, 2026
        </p>
      </div>

      <div className="space-y-10 text-gray-700 leading-7">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Data Collection
          </h2>
          <p>
            We collect personal information necessary to process movie ticket
            reservations, including your name, email address, phone number,
            and transaction references.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Data Security & Storage
          </h2>
          <p>
            User authentication data is securely encrypted using
            industry-standard bcrypt hashing. Refresh tokens are stored in
            secure HTTP-only cookies to help protect against unauthorized
            access and common web security threats.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Third-Party Integrations
          </h2>
          <p>
            Payment information is processed securely through Khalti and
            eSewa. Profile images are stored securely using Cloudinary without
            exposing sensitive API credentials.
          </p>
        </section>
      </div>
    </div>
  );
};