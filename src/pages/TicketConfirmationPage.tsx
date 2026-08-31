import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Printer, Film, MapPin, Clock, Ticket, ChevronRight } from 'lucide-react';
import { useBookingDetail } from '../features/booking/useBookings';

// The booking response always carries authoritative seat labels (row + number)
// from the server. No regex/CUID guesswork is needed or acceptable here.
function parseSeatLabel(s: { seatId: string; seatDetails?: { row: string; number: number } | null }): string {
  if (s.seatDetails?.row && s.seatDetails?.number) {
    return `${s.seatDetails.row}${s.seatDetails.number}`;
  }
  return s.seatId;
}

export const TicketConfirmationPage: React.FC = () => {
  const { bookingId = '' } = useParams<{ bookingId: string }>();

  const { data: booking, isLoading } = useBookingDetail(bookingId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <Link to="/" className="text-[#00a8cc] font-semibold hover:underline text-sm">
          Return to Home
        </Link>
      </div>
    );
  }


  return (

    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8 print:p-4">

        {/* Success Banner */}
        <div className="bg-white border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3 print:hidden">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Payment Confirmed!</h1>
          <p className="text-xs text-gray-700 max-w-sm mx-auto">
            Your seats have been permanently reserved. Show the QR code below at the cinema entrance.
          </p>
        </div>

        {/* ── E-Ticket Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl print:border-black">

          {/* Ticket Header */}
          <div className="qfx-card-top-bar px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-gray-900" />
              <div>
                <span className="text-base font-black text-gray-900 tracking-wider uppercase">CINEBOOK</span>
                <span className="block text-[10px] font-semibold text-gray-900/80 uppercase tracking-widest">Admit One · Official E-Ticket</span>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs font-extrabold uppercase text-gray-900 border border-white/20">
              {booking.status}
            </span>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Movie + QR Row */}
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
              <div className="space-y-2.5">
                <h2 className="text-2xl font-black text-gray-900">
                  {booking.showtime?.movie?.title ?? 'Cinema Movie'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700 font-semibold">
                  <span className="flex items-center gap-1 text-[#00a8cc]">
                    <MapPin className="w-3.5 h-3.5" />
                    {booking.showtime?.hall?.name ?? 'Cinema'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {booking.showtime?.startsAt
                      ? new Date(booking.showtime.startsAt).toLocaleString(undefined, {
                          weekday: 'short', day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : 'Show Time'}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 shrink-0">
                <QRCodeSVG value={booking.qrPayload || booking.id} size={96} level="H" />
                <span className="block text-[9px] text-center text-gray-500 font-mono font-semibold mt-1.5">
                  REF #{booking.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="ticket-dashed-line ticket-perforated my-2" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-100 p-3.5 rounded-xl border border-gray-200">
                <span className="block text-gray-500 font-bold uppercase text-[10px] mb-1">Seats</span>
                <span className="text-sm font-extrabold text-gray-900">
                  {booking.seats.map(parseSeatLabel).join(', ') || '-'}
                </span>
              </div>
              <div className="bg-gray-100 p-3.5 rounded-xl border border-gray-200">
                <span className="block text-gray-500 font-bold uppercase text-[10px] mb-1">Total Paid</span>
                <span className="text-sm font-extrabold text-[#00a8cc]">NPR {Number(booking.totalAmount).toFixed(2)}</span>
              </div>
              <div className="bg-gray-100 p-3.5 rounded-xl border border-gray-200">
                <span className="block text-gray-500 font-bold uppercase text-[10px] mb-1">Booking ID</span>
                <span className="text-sm font-extrabold text-gray-900 font-mono">{booking.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            {/* Advisory */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">Entry Instructions</p>
              <p>Please arrive 15 minutes before showtime. Outside food &amp; beverages are not allowed. Show this QR code or booking ID at the counter.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 px-5 py-3 rounded-xl bg-white hover:bg-gray-200 text-gray-900 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-gray-200"
          >
            <Printer className="w-4 h-4 text-[#00a8cc]" /> Print / Save PDF
          </button>
          <Link
            to="/profile"
            className="flex-1 px-5 py-3 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Ticket className="w-4 h-4" /> My Bookings
          </Link>
          <Link
            to="/"
            className="flex-1 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-gray-200"
          >
            Back to Home <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
