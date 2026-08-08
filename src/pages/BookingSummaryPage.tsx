import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Ticket, Plus, Minus, ShieldCheck, ArrowRight, Film, ChevronLeft, Clock, MapPin } from 'lucide-react';
import { useSeatStore } from '../features/seat-selection/useSeatStore';
import { useCreateBooking } from '../features/booking/useBookings';

export const BookingSummaryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showtimeId = searchParams.get('showtimeId') || '';
  const movieTitle = searchParams.get('movie') || 'Selected Movie';
  const cinemaName = searchParams.get('cinema') || 'Cinema Hall';
  const showTime  = searchParams.get('time') || '';
  const navigate = useNavigate();

  const { selectedSeats } = useSeatStore();
  const createBookingMutation = useCreateBooking();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const subtotal = seatsTotal;
  const vatAmount = Math.round(subtotal * 0.13);
  const grandTotal = subtotal + vatAmount;

  const handleCreateBooking = async () => {
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat before proceeding.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const booking = await createBookingMutation.mutateAsync({
        showtimeId,
        seatIds: selectedSeats.map((s) => s.id),
      });
      navigate(`/payment?bookingId=${booking.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Breadcrumb Steps */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <button onClick={() => navigate(-1)} className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-500">Now Showing</span>
          <span className="text-[#00a8cc] border-b-2 border-[#00a8cc] pb-0.5">Checkout</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Summary</h1>
          <p className="text-xs text-gray-600 mt-1">Review your seat selection before proceeding to checkout</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" /> {errorMsg}
          </div>
        )}

        {/* Showtime & Seats Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
            <div className="w-11 h-11 rounded-xl bg-[#00a8cc]/15 text-[#00a8cc] flex items-center justify-center border border-[#00a8cc]/20 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">{movieTitle}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-gray-600">
                {cinemaName && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#00a8cc]" />{cinemaName}</span>}
                {showTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" />{showTime}</span>}
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          <div>
            <h4 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest mb-3">Selected Seats</h4>
            {selectedSeats.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No seats selected.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="p-3.5 bg-gray-100 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-[#00a8cc]" />
                      Seat {seat.row}{seat.number}
                      <span className="px-1.5 py-0.5 bg-[#00a8cc]/15 text-[#00a8cc] rounded text-[9px] font-bold uppercase">{seat.type}</span>
                    </span>
                    <span className="font-extrabold text-gray-900">NPR {seat.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Price Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4">
            Payment Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Ticket Base ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</span>
              <span className="text-gray-900 font-semibold">NPR {seatsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Govt. VAT (13%)</span>
              <span className="text-gray-900 font-semibold">NPR {vatAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-base font-extrabold text-gray-900">Grand Total</span>
              <span className="text-2xl font-black text-[#00a8cc]">NPR {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateBooking}
            disabled={loading || selectedSeats.length === 0}
            className="w-full py-4 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-slate-600" />
            Seats held for 10 minutes. Payment via eSewa.
          </p>
        </div>
      </div>
    </div>
  );
};
