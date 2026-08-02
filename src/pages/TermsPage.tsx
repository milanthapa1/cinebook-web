import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Last updated: July 31, 2026
        </p>
      </div>

      <div className="space-y-10 text-gray-700 leading-7">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Ticket Booking & Lock Policy
          </h2>
          <p>
            Seats selected on CineBook are held in real time for up to 10
            minutes. If payment is not completed within this timeframe, the
            reserved seats are automatically released back into the available
            inventory.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Payments & Gateway Verification
          </h2>
          <p>
            All digital payments processed through Khalti or eSewa are verified
            securely. Once payment is successfully confirmed, ticket issuance is
            final and non-transferable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Cancellations & Refunds
          </h2>
          <p>
            Cancellations are permitted up to two hours before the scheduled
            showtime. Approved refunds will be credited back through the
            original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Admission & Age Ratings
          </h2>
          <p>
            Guests must present a valid QR code upon entry. Films with age
            restrictions (such as PG-13 or R) may require valid identification
            before admission.
          </p>
        </section>
      </div>
    </div>
  );
};