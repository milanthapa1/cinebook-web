import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ChevronLeft, CreditCard, ExternalLink, XCircle } from 'lucide-react';
import { useBookingDetail, useInitiatePayment, useVerifyPayment } from '../features/booking/useBookings';
import { useSeatStore } from '../features/seat-selection/useSeatStore';

// ─── eSewa v2 flow ────────────────────────────────────────────────────────────
//
// 1. User clicks Pay → POST /payments/initiate → API returns { formFields, paymentUrl }
// 2. We programmatically submit a hidden <form method="POST" action={paymentUrl}>
//    with all signed fields — browser navigates to eSewa.
// 3. After payment, eSewa redirects back to:
//    /payment?bookingId=<id>&data=<base64-json>       (success)
//    /payment?bookingId=<id>&failed=1                 (failure / cancel)
// 4. We POST the base64 `data` to /payments/verify → API decodes, verifies
//    HMAC, confirms booking → navigate to /ticket-confirmation/:id

interface EsewaFormFields {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const bookingId  = searchParams.get('bookingId') ?? '';
  const esewaData  = searchParams.get('data');          // Base64 from eSewa success redirect
  const isFailed   = searchParams.get('failed') === '1';

  const [errorMsg, setErrorMsg]     = useState(isFailed ? 'Payment was cancelled or failed at eSewa. Please try again.' : '');
  const [formData, setFormData]     = useState<{ fields: EsewaFormFields; url: string } | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);
  const verifiedRef                 = useRef(false);

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const initiateMut  = useInitiatePayment();
  const verifyMut    = useVerifyPayment();

  // ── Step 3: auto-verify when eSewa redirects back with ?data= ──────────────
  useEffect(() => {
    if (!bookingId || !esewaData || verifiedRef.current || verifyMut.isPending) return;
    verifiedRef.current = true;

    // Strip the callback params from the URL immediately so a refresh doesn't re-verify
    const clean = new URLSearchParams({ bookingId });
    window.history.replaceState(null, '', `${window.location.pathname}?${clean.toString()}`);

    verifyMut.mutate(
      { bookingId, provider: 'esewa', data: esewaData },
      {
        onSuccess: () => {
          useSeatStore.getState().clearSelection();
          navigate(`/ticket-confirmation/${bookingId}`, { replace: true });
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
            'Payment verification failed. Please contact support with your booking reference.',
          );
        },
      },
    );
  }, [bookingId, esewaData, verifyMut, navigate]);

  // ── Step 4: auto-submit the form once fields are ready ────────────────────
  useEffect(() => {
    if (formData && formRef.current) {
      // Small tick to let React render the hidden form before submitting
      const t = setTimeout(() => formRef.current?.submit(), 50);
      return () => clearTimeout(t);
    }
  }, [formData]);

  // ── Step 2: initiate payment → get signed form fields ─────────────────────
  const handlePay = async () => {
    setErrorMsg('');
    try {
      const result = await initiateMut.mutateAsync({ bookingId, provider: 'esewa' });
      // result = { formFields: EsewaFormFields, paymentUrl: string, amount: number }
      if (!result?.formFields || !result?.paymentUrl) throw new Error('Invalid payment response');
      setFormData({ fields: result.formFields, url: result.paymentUrl });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const isProcessing = initiateMut.isPending || verifyMut.isPending || !!formData;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || (esewaData && !verifyMut.isError)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#00a8cc] mx-auto" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {esewaData ? 'Verifying your payment...' : 'Loading booking...'}
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Booking Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This booking may have expired or you may not have access to it.
        </p>
        <Link to="/profile" className="inline-block px-5 py-2 rounded-xl bg-[#00a8cc] text-white text-sm font-semibold">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Hidden eSewa v2 form — auto-submitted after initiate */}
      {formData && (
        <form
          ref={formRef}
          method="POST"
          action={formData.url}
          style={{ display: 'none' }}
        >
          {Object.entries(formData.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-40 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-400">Now Showing</span>
          <span className="text-[#00a8cc] border-b-2 border-[#00a8cc] pb-0.5">Checkout</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight dark:text-gray-100">
            Checkout & Payment
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Complete your booking securely via eSewa
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Amount Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold block uppercase tracking-wider dark:text-gray-400">
              Total Amount Payable
            </span>
            <span className="text-[10px] text-gray-400 font-mono dark:text-gray-500">
              Ref: #{booking.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">
            NPR {Number(booking.totalAmount).toFixed(2)}
          </span>
        </div>

        {/* Booking summary */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 space-y-3">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Booking Summary
          </h3>
          <div className="flex gap-4">
            <img
              src={booking.showtime.movie.posterUrl}
              alt={booking.showtime.movie.title}
              className="w-14 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
            />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                {booking.showtime.movie.title}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {new Date(booking.showtime.startsAt).toLocaleString(undefined, {
                  weekday: 'short', day: '2-digit', month: 'short',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <p className="text-gray-500 dark:text-gray-400">{booking.showtime.hall.name}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {booking.seats.length} seat{booking.seats.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Gateway */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Payment Gateway
          </h3>

          {/* eSewa option */}
          <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-700 text-base dark:text-emerald-400">
                    eSewa
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Nepal's leading digital wallet
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">
                Selected
              </span>
            </div>
          </div>

          {/* Sandbox notice */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-bold">Sandbox mode.</span> Use eSewa test credentials — ID: <span className="font-mono font-bold">9806800001</span> / Password & MPIN: <span className="font-mono font-bold">Nepal@123</span>
            </span>
          </div>

          {/* Security note */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2.5 text-xs text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              You will be redirected to eSewa. Payment is HMAC-verified server-side before your booking is confirmed.
            </span>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] bg-emerald-600 hover:bg-emerald-500"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {verifyMut.isPending ? 'Verifying payment...' : 'Redirecting to eSewa...'}
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
