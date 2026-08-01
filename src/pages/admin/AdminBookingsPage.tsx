import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Ticket, Loader2, X, MapPin, Clock, Search, Filter } from 'lucide-react';
import { useAdminBookings, useUpdateBookingStatus, useCancelBooking, useAdminBookingDetail } from '../../features/admin/useAdmin';

const Badge: React.FC<{ s: string }> = ({ s }) => {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED:  'bg-rose-100 text-rose-600 border-rose-200',
    EXPIRED:    'bg-gray-100 text-gray-500 border-gray-200',
    PENDING:    'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[s] ?? map.PENDING}`}>
      <span className={`w-1 h-1 rounded-full ${
        s === 'CONFIRMED' ? 'bg-emerald-500' : s === 'CANCELLED' ? 'bg-rose-500' : s === 'EXPIRED' ? 'bg-gray-400' : 'bg-amber-500'
      }`} />
      {s}
    </span>
  );
};

const BookingModal: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const { data: b, isLoading } = useAdminBookingDetail(id);
  const cancelMut = useCancelBooking();
  const [updatingId, setUpdatingId] = useState('');
  const fmt = (d: string) => new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00a8cc]/10 flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-[#00a8cc]" />
            </div>
            Booking Detail
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">{[1,2,3].map(n => <div key={n} className="h-4 shimmer rounded" />)}</div>
        ) : b ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Booking ID</p>
                <span className="font-mono text-base font-black text-gray-900">#{b.id.slice(-8).toUpperCase()}</span>
              </div>
              <Badge s={b.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                <p className="text-gray-900 font-semibold">{(b as any).user?.name}</p>
                <p className="text-gray-500">{(b as any).user?.email}</p>
                <p className="text-gray-500">{(b as any).user?.phone || '—'}</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Showtime</p>
                <p className="text-gray-900 font-semibold truncate">{(b as any).showtime?.movie?.title}</p>
                <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{(b as any).showtime?.hall?.name}</p>
                <p className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{(b as any).showtime?.startsAt ? fmt((b as any).showtime.startsAt) : '—'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Seats ({(b as any).seats?.length || 0})</p>
              <div className="flex flex-wrap gap-1.5">
                {(b as any).seats?.map((s: any) => (
                  <span key={s.id} className="px-2.5 py-1 bg-white border border-[#00a8cc]/30 text-[#00a8cc] rounded-lg text-[11px] font-bold shadow-sm">
                    {s.seatDetails ? `${s.seatDetails.row}${s.seatDetails.number}` : s.seatId}
                    <span className="text-gray-400 ml-1.5">NPR {Number(s.priceAtBooking).toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#00a8cc]/5 border border-[#00a8cc]/15 p-4 rounded-xl">
              <span className="text-sm font-semibold text-gray-600">Total Paid</span>
              <span className="text-xl font-bold text-[#00a8cc]">NPR {Number(b.totalAmount).toFixed(2)}</span>
            </div>
            {b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && (
              <button
                onClick={async () => { setUpdatingId(b.id); await cancelMut.mutateAsync(b.id); setUpdatingId(''); onClose(); }}
                disabled={cancelMut.isPending}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {cancelMut.isPending && updatingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking & Release Seats'}
              </button>
            )}
          </div>
        ) : <p className="p-8 text-center text-xs text-gray-400">Booking not found</p>}
      </div>
    </div>
  );
};

const STATUS_FILTERS = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'] as const;
const STATUS_LABELS: Record<string, string> = { '': 'All', PENDING: 'Pending', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled', EXPIRED: 'Expired' };

export const AdminBookingsPage: React.FC = () => {
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [detailId, setDetailId]         = useState<string | null>(null);
  const { data, isLoading } = useAdminBookings(page, statusFilter || undefined);
  const fmt = (d: string) => new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">All customer reservations · <span className="font-semibold text-gray-700">{data?.total ?? 0}</span> total</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={e => { e.preventDefault(); setPage(1); }} className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl focus:outline-none transition-all"
          />
        </form>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-[#00a8cc] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(n => <div key={n} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Booking ID', 'Customer', 'Movie / Hall', 'Date & Time', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.bookings?.map((b, i) => (
                  <tr key={b.id}
                    className={`cursor-pointer transition-colors hover:bg-[#00a8cc]/5 border-b border-gray-50 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                    onClick={() => setDetailId(b.id)}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">#{b.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{b.user?.name}</p>
                      <p className="text-gray-400 mt-0.5">{b.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900 truncate max-w-[160px]">{b.showtime?.movie?.title}</p>
                      <p className="text-gray-400 mt-0.5">{b.showtime?.hall?.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{b.showtime?.startsAt ? fmt(b.showtime.startsAt) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-black text-gray-900">NPR {Number(b.totalAmount).toFixed(0)}</span>
                    </td>
                    <td className="px-5 py-3.5"><Badge s={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data?.bookings?.length && (
            <div className="py-16 text-center">
              <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-400">No bookings found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Page <span className="font-bold text-gray-700">{data.page}</span> of <span className="font-bold text-gray-700">{data.totalPages}</span> · {data.total} results</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {detailId && <BookingModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
};
