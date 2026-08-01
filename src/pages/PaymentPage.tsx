import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, ChevronLeft, CreditCard, Wallet } from 'lucide-react';
import { useBookingDetail, useInitiatePayment, useVerifyPayment } from '../features/booking/useBookings';

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const navigate = useNavigate();

  const [provider, setProvider] = useState<'khalti' | 'esewa'>('khalti');
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const initiateMutation = useInitiatePayment();
  const verifyMutation = useVerifyPayment();

  // Warn user if they try to close/navigate away during payment processing
  useEffect(() => {
    if (!isSimulating) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Payment is being processed. If you leave now, your booking may remain unpaid.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSimulating]);

  const handlePay = async () => {
    setIsSimulating(true);
    setErrorMsg('');
    try {
      await initiateMutation.mutateAsync({ bookingId, provider });

      setTimeout(async () => {
        try {
          const verifyResult = await verifyMutation.mutateAsync({
            bookingId,
            provider,
            token: `mock_${provider}_token_${Date.now()}`,
            pidx: `mock_${provider}_pidx_${Date.now()}`,
            refId: `MOCK_TXN_${Date.now()}`,
          });
          if (verifyResult) {
            navigate(`/ticket-confirmation?bookingId=${bookingId}`);
          }
        } catch (vErr: any) {
          setErrorMsg(vErr.response?.data?.message || 'Payment verification failed.');
          setIsSimulating(false);
        }
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to initiate payment.');
      setIsSimulating(false);
    }
  };

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
          <span className="text-gray-400">Food & Beverages</span>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Khalti */}
            <button
              onClick={() => setProvider('khalti')}
              className={`p-5 rounded-xl border transition-all text-left space-y-2 ${
                provider === 'khalti'
                  ? 'bg-purple-50 border-purple-400'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  <span className="font-extrabold text-purple-600 text-base">Khalti</span>
                </div>
                {provider === 'khalti' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </div>
              <p className="text-[11px] text-gray-500">Instant checkout & mobile wallet PIN</p>
            </button>

            {/* eSewa */}
            <button
              onClick={() => setProvider('esewa')}
              className={`p-5 rounded-xl border transition-all text-left space-y-2 ${
                provider === 'esewa'
                  ? 'bg-emerald-50 border-emerald-400'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-emerald-600 text-base">eSewa</span>
                </div>
                {provider === 'esewa' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-gray-500">Direct e-payment via eSewa account</p>
            </button>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2.5 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit encrypted & server-verified transaction. No card data stored locally.</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isSimulating}
            className={`w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] ${
              provider === 'khalti'
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying with {provider === 'khalti' ? 'Khalti' : 'eSewa'}...
              </>
            ) : (
              `Pay NPR ${Number(booking.totalAmount).toFixed(2)} via ${provider === 'khalti' ? 'Khalti' : 'eSewa'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
