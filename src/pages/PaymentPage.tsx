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
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="h-80 shimmer rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-sm text-gray-500">This booking may have expired or you may not have access to it.</p>
        <Link to="/profile" className="inline-block px-5 py-2 rounded-xl bg-[#00a8cc] text-white text-sm font-semibold">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <button onClick={() => navigate(-1)} className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-400">Now Showing</span>
          <span className="text-[#00a8cc] border-b-2 border-[#00a8cc] pb-0.5">Checkout</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout & Payment</h1>
          <p className="text-xs text-gray-500">Choose a payment gateway to complete your booking</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-sm text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Amount Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider">Total Amount Payable</span>
            <span className="text-[10px] text-gray-400 font-mono">Ref: #{booking.id.slice(-8).toUpperCase()}</span>
          </div>
          <span className="text-3xl font-black text-gray-900">NPR {Number(booking.totalAmount).toFixed(2)}</span>
        </div>

        {/* Gateway Selector */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-sm">
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Select Digital Wallet</h3>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-extrabold text-emerald-600 text-base">eSewa</p>
                  <p className="text-[11px] text-gray-500">Direct e-payment via eSewa account</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                Selected
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2.5 text-xs text-gray-500">
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