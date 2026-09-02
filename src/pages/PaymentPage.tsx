import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ChevronLeft, CreditCard, ExternalLink } from 'lucide-react';
import { useBookingDetail, useInitiatePayment, useVerifyPayment } from '../features/booking/useBookings';
import { useSeatStore } from '../features/seat-selection/useSeatStore';

interface CallbackPayload {
  refId?: string;
  transaction_code?: string;
  transaction_uuid?: string;
  status?: string;
  signed_field_names?: string;
  signature?: string;
  product_code?: string;
  amount?: number;
}

function readGatewayCallback(searchParams: URLSearchParams): CallbackPayload | null {
  const refId = searchParams.get('refId') || searchParams.get('oid');
  if (!refId) return null;
  const amount = Number(searchParams.get('amt') || searchParams.get('total_amount') || '0');
  return {
    refId,
    transaction_code: searchParams.get('transaction_code') || undefined,
    transaction_uuid: searchParams.get('transaction_uuid') || undefined,
    status: searchParams.get('status') || undefined,
    signed_field_names: searchParams.get('signed_field_names') || undefined,
    signature: searchParams.get('signature') || searchParams.get('respSignature') || undefined,
    product_code: searchParams.get('product_code') || undefined,
    amount: amount > 0 ? amount : undefined,
  };
}

function stripCallbackParams(searchParams: URLSearchParams) {
  const clean = new URLSearchParams(searchParams.toString());
  for (const key of [...clean.keys()]) {
    if (['pid', 'oid', 'amt', 'refId', 'respSignature', 'signature', 'transaction_uuid',
         'transaction_code', 'status', 'total_amount', 'signed_field_names', 'product_code'].includes(key)) {
      clean.delete(key);
    }
  }
  const qs = clean.toString();
  window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // bookingId may come from our own URL (?bookingId=) or from the eSewa return
  // query string (?pid= or ?transaction_uuid=) when redirected back.
  const bookingId =
    searchParams.get('bookingId') ||
    searchParams.get('pid') ||
    searchParams.get('transaction_uuid') ||
    '';
  const gatewayCallback = readGatewayCallback(searchParams);

  const [errorMsg, setErrorMsg] = useState('');
  const verifiedRef = useRef(false);

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const initiateMutation = useInitiatePayment();
  const verifyMutation = useVerifyPayment();

  // Auto-verify when we return from the gateway with a payment reference.
  useEffect(() => {
    if (!bookingId || !gatewayCallback || verifiedRef.current || verifyMutation.isPending) return;
    verifiedRef.current = true;

    verifyMutation.mutate(
      {
        bookingId,
        provider: 'esewa',
        ...gatewayCallback,
      },
      {
        onSuccess: () => {
          useSeatStore.getState().clearSelection();
          stripCallbackParams(searchParams);
          navigate(`/ticket-confirmation/${bookingId}`, { replace: true });
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || 'Payment verification failed. Please contact support with your booking reference.');
        },
      },
    );
  }, [bookingId, gatewayCallback, searchParams, verifyMutation, navigate]);

  const handlePay = async () => {
    setErrorMsg('');
    try {
      const { paymentUrl } = await initiateMutation.mutateAsync({ bookingId, provider: 'esewa' });
      if (!paymentUrl) throw new Error('No payment URL returned');
      // Send the user to the gateway. eSewa redirects back to /payment?bookingId=...
      window.location.assign(paymentUrl);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const isProcessing = initiateMutation.isPending || verifyMutation.isPending;

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="bg-white border-b border-gray-200 py-3 px-4 -mx-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="skeleton h-6 w-6 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="skeleton h-7 w-56 rounded mx-auto" />
          <div className="skeleton h-3 w-64 rounded mx-auto" />
        </div>

        {/* Amount card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-36 rounded" />
            <div className="skeleton h-2.5 w-24 rounded" />
          </div>
          <div className="skeleton h-9 w-32 rounded" />
        </div>

        {/* Gateway card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-sm">
          <div className="skeleton h-3 w-36 rounded" />
          {/* eSewa option */}
          <div className="p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="skeleton w-5 h-5 rounded" />
                <div className="space-y-1">
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-2.5 w-40 rounded" />
                </div>
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
          </div>
          {/* Security notice */}
          <div className="skeleton h-10 w-full rounded-xl" />
          {/* Pay button */}
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Booking Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">This booking may have expired or you may not have access to it.</p>
        <Link to="/profile" className="inline-block px-5 py-2 rounded-xl bg-[#00a8cc] text-white text-sm font-semibold">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-40 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <button onClick={() => navigate(-1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-400">Now Showing</span>
          <span className="text-[#00a8cc] border-b-2 border-[#00a8cc] pb-0.5">Checkout</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight dark:text-gray-100">Checkout & Payment</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose a payment gateway to complete your booking</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Amount Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider dark:text-gray-400">Total Amount Payable</span>
            <span className="text-[10px] text-gray-400 font-mono dark:text-gray-500">Ref: #{booking.id.slice(-8).toUpperCase()}</span>
          </div>
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">NPR {Number(booking.totalAmount).toFixed(2)}</span>
        </div>

        {/* Gateway Selector */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest dark:text-gray-400">Select Digital Wallet</h3>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-extrabold text-emerald-600 text-base dark:text-emerald-400">eSewa</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Direct e-payment via eSewa account</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">
                Selected
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2.5 text-xs text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>You will be redirected to the eSewa gateway. Payment is verified server-side before your booking is confirmed.</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] bg-emerald-600 hover:bg-emerald-500"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {verifyMutation.isPending ? 'Verifying payment...' : 'Contacting gateway...'}
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Pay NPR {Number(booking.totalAmount).toFixed(2)} via eSewa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};